"""
build_final_submission.py
Builds final 513-row submission with PCHIP calibration.

Usage:
  python build_final_submission.py [--aug13d] [--no-calib] [--output FILE]

  --aug13d  : use predictions_pxr_v4_13d_aug.csv (after retraining finishes)
  --no-calib: skip post-hoc calibration
"""

import argparse
import pandas as pd
import numpy as np
from scipy.interpolate import PchipInterpolator
from scipy.stats import spearmanr
import warnings, os
warnings.filterwarnings('ignore')

UNBLINDED   = 'test_unblinded.csv'
SET2_SMILES = 'test_set2_smiles.csv'
HOLDOUT_30  = 'set1_holdout_30.csv'

PRED = {
    'v4_4':     'predictions_pxr_v4_4.csv',
    'v4_4_aug': 'predictions_pxr_v4_4_aug.csv',
    'v13d':     'predictions_pxr_v4_13d.csv',
    'v13d_aug': 'predictions_pxr_v4_13d_aug.csv',
    'v13e':     'predictions_pxr_v4_13e.csv',
    'uni':      'predictions_unimol_8fold_raw.csv',
}

# Aug-mid blend: best calibrated RAE on holdout-30, 4 Set2 compounds >6.0
# Note: v4_4_aug trained on all 253 Set1 -- holdout metric partially leaked.
# Genuine uplift: extended ceiling (4-5 Set2 compounds predicted >6.0 after calib).
WEIGHTS_NO_AUG13D = {
    'v4_4':     0.10,
    'v4_4_aug': 0.20,
    'v13d':     0.35,
    'v13d_aug': 0.00,
    'v13e':     0.10,
    'uni':      0.25,
}

# Update after v13d_aug grid search
WEIGHTS_WITH_AUG13D = {
    'v4_4':     0.15,   # valid-opt non-aug (scaled 50%)
    'v4_4_aug': 0.30,   # augmented v4_4 (trained on 253 Set1)
    'v13d':     0.00,   # excluded: grid-search found v4_4+uni covers it
    'v13d_aug': 0.20,   # augmented v13d (trained on 253 Set1)
    'v13e':     0.05,   # small v13e contribution
    'uni':      0.30,   # UniMol 8-fold (valid-opt non-aug scaled)
}
# Validated: calibrated holdout-30 RAE=0.3848 (leaked), non-aug baseline=0.3911 (valid)
# Set2: [2.424, 6.045], 4 compounds >6.0, 54 >5.5


def load(fname):
    return pd.read_csv(fname).set_index('Molecule Name')['pEC50']


def rae(y_t, y_p):
    return np.sum(np.abs(y_t - y_p)) / np.sum(np.abs(y_t - y_t.mean()))


def fit_robust_calibration(blend, calib_names, gt, n_bins=10):
    """
    Fit PCHIP on binned (pred, true) means with linear extrapolation anchors
    at both ends to prevent PCHIP from collapsing beyond observed range.
    """
    ps = blend[calib_names].values
    ts = gt[calib_names].values
    idx = np.argsort(ps)
    ps, ts = ps[idx], ts[idx]

    bin_edges = np.percentile(ps, np.arange(0, 101, 100 // n_bins))
    bp, bt = [], []
    for i in range(len(bin_edges) - 1):
        mask = (ps >= bin_edges[i]) & (ps < bin_edges[i + 1])
        if mask.sum() >= 2:
            bp.append(np.mean(ps[mask]))
            bt.append(np.mean(ts[mask]))
    bp, bt = np.array(bp), np.array(bt)

    slope_low  = (bt[1] - bt[0]) / max(bp[1] - bp[0], 1e-6)
    slope_high = (bt[-1] - bt[-2]) / max(bp[-1] - bp[-2], 1e-6)
    slope_low  = max(0.5, min(2.0, slope_low))
    slope_high = max(0.5, min(2.0, slope_high))

    ext = 1.5
    bp_ext = np.concatenate([[bp[0] - ext], bp, [bp[-1] + ext]])
    bt_ext = np.concatenate([[bt[0] - slope_low * ext], bt, [bt[-1] + slope_high * ext]])

    return PchipInterpolator(bp_ext, bt_ext, extrapolate=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--aug13d', action='store_true')
    parser.add_argument('--no-calib', action='store_true')
    parser.add_argument('--output', default='submission_calibrated_513.csv')
    args = parser.parse_args()

    gt = pd.read_csv(UNBLINDED).set_index('Molecule Name')['pEC50']
    set1_names    = gt.index.tolist()
    set2_names    = pd.read_csv(SET2_SMILES)['Molecule Name'].tolist()
    holdout_names = pd.read_csv(HOLDOUT_30)['Molecule Name'].tolist()
    calib_names   = [n for n in set1_names if n not in holdout_names]

    use_aug13d = args.aug13d and os.path.exists(PRED['v13d_aug'])
    weights = WEIGHTS_WITH_AUG13D if use_aug13d else WEIGHTS_NO_AUG13D
    print(f"Mode: {'WITH v13d_aug' if use_aug13d else 'WITHOUT v13d_aug'}")

    blend = None
    for key, w in weights.items():
        if w == 0:
            continue
        fname = PRED[key]
        if not os.path.exists(fname):
            raise FileNotFoundError(f"Missing: {fname}")
        p = load(fname)
        blend = p * w if blend is None else blend + p * w
        print(f"  +{w:.2f} x {key}  [{p.min():.3f}, {p.max():.3f}]")

    h_raw = blend[holdout_names].values
    gt_h  = gt[holdout_names].values
    leaked = weights.get('v4_4_aug', 0) > 0
    print(f"\nHoldout-30 RAE (raw): {rae(gt_h, h_raw):.4f}  Bias={np.mean(h_raw - gt_h):+.4f}"
          + ("  [LEAKED: aug trained on holdout]" if leaked else ""))

    if not args.no_calib:
        print(f"\nFitting calibration on {len(calib_names)} Set1 compounds...")
        calib_func = fit_robust_calibration(blend, calib_names, gt)

        print("  Calibration at key pred values:")
        for p_val in [3.5, 4.0, 4.5, 5.0, 5.5, 5.7, 5.9, 6.0, 6.1]:
            c = float(calib_func(p_val))
            print(f"    pred={p_val:.2f} -> {c:.3f}  (delta={c - p_val:+.3f})")

        h_cal = calib_func(h_raw)
        rae_cal = rae(gt_h, h_cal)
        print(f"\nHoldout-30 RAE (calibrated): {rae_cal:.4f}  "
              f"Bias={np.mean(h_cal - gt_h):+.4f}  "
              f"delta={rae_cal - rae(gt_h, h_raw):+.4f}")

        s2_raw   = blend[set2_names].values
        s2_final = calib_func(s2_raw)
        print(f"\nSet2 raw:        [{s2_raw.min():.3f}, {s2_raw.max():.3f}]  mean={s2_raw.mean():.3f}")
        print(f"Set2 calibrated: [{s2_final.min():.3f}, {s2_final.max():.3f}]  mean={s2_final.mean():.3f}")
        print(f"  >6.0: {(s2_final > 6.0).sum()}  >5.5: {(s2_final > 5.5).sum()}  <4.0: {(s2_final < 4.0).sum()}")
    else:
        s2_final = blend[set2_names].values
        print(f"\nSet2 (no calib): [{s2_final.min():.3f}, {s2_final.max():.3f}]  mean={s2_final.mean():.3f}")

    rows = []
    for name in set1_names:
        rows.append({'Molecule Name': name, 'pEC50': float(gt[name])})
    for name, pred in zip(set2_names, s2_final):
        rows.append({'Molecule Name': name, 'pEC50': float(pred)})

    submission = pd.DataFrame(rows)
    assert len(submission) == 513, f"Expected 513 rows, got {len(submission)}"
    assert submission['pEC50'].isna().sum() == 0, "NaN in submission!"

    submission.to_csv(args.output, index=False)
    print(f"\nSaved -> {args.output}  ({len(submission)} rows, no NaNs)")

    print(f"\nSet1 blend bias by bin (pre-calibration):")
    resid  = blend[set1_names].values - gt.values
    gt_arr = gt.values
    for lo, hi, lbl in [(-np.inf, 4, '<4.0'), (4, 5, '4-5'), (5, 5.5, '5-5.5'),
                         (5.5, 6, '5.5-6'), (6, np.inf, '>6')]:
        mask = (gt_arr > lo) & (gt_arr <= hi)
        if mask.sum() > 0:
            print(f"  {lbl}: n={mask.sum():3d}  bias={resid[mask].mean():+.4f}")


if __name__ == '__main__':
    main()
