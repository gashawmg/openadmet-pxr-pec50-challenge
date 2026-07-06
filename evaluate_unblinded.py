"""
Evaluate any prediction CSV against the unblinded Phase 1 test set.

Usage
-----
  # Score a single file and compare to Phase 1 baselines
  python evaluate_unblinded.py predictions_phase2_v4_3_4.csv --compare

  # Score all prediction CSVs in the folder
  python evaluate_unblinded.py --all

  # Score all and save ranking table
  python evaluate_unblinded.py --all --save_csv phase2_leaderboard.csv
"""

import argparse
import glob
import os
import numpy as np
import pandas as pd
from scipy import stats

TEST_CSV        = "test_unblinded.csv"
# Phase 2 best Chemprop: clean_train2 + 300 SC inactives (pEC50=2.0, w=0.2)
# Unblinded MAE 0.4456, R2 0.6021, Spearman 0.8296 — beats Phase 1 ensemble
CHEMPROP_PHASE2 = "predictions_v2_inact300.csv"
# Phase 1 best Chemprop: clean_train2, 10-fold, simple avg, dropout=0.20
# Unblinded MAE 0.4605
CHEMPROP_PHASE1 = "predictions_v4_3_3_repro2_simple.csv"
# Phase 1 best ensemble: 35% UniMol8f + 35% CP10f + 30% UniMol7f
# LB MAE 0.4468 (513 cpds, Rank 39) | Unblinded MAE 0.4464 (253 cpds)
ENSEMBLE_PHASE1 = "final_blend_submission.csv"


def rae(y_true, y_pred):
    return np.sum(np.abs(y_true - y_pred)) / np.sum(np.abs(y_true - np.mean(y_true)))


def compute_metrics(y_true, y_pred):
    mae = np.mean(np.abs(y_true - y_pred))
    r   = rae(y_true, y_pred)
    r2  = 1 - np.sum((y_true - y_pred)**2) / np.sum((y_true - np.mean(y_true))**2)
    sp  = stats.spearmanr(y_true, y_pred).correlation
    kt  = stats.kendalltau(y_true, y_pred).correlation
    return dict(MAE=mae, RAE=r, R2=r2, Spearman=sp, Kendall=kt)


def load_ground_truth(test_csv=TEST_CSV):
    gt = pd.read_csv(test_csv)
    gt = gt[gt["phase"] == 1].dropna(subset=["pEC50"])
    return dict(zip(gt["Molecule Name"], gt["pEC50"]))


def score_file(pred_csv, gt_map):
    """Return (metrics_dict, status_str). metrics_dict is None on failure."""
    try:
        pred = pd.read_csv(pred_csv)
    except Exception as e:
        return None, f"read error: {e}"
    id_col = next((c for c in pred.columns
                   if "molecule" in c.lower() or "name" in c.lower()), None)
    if id_col is None:
        return None, "no ID column"
    pc = next((c for c in pred.columns
               if "pec50" in c.lower() and c != id_col), None)
    if pc is None:
        return None, "no pEC50 column"
    pred = pred.rename(columns={id_col: "_id", pc: "_pred"})
    pred = pred[pred["_id"].isin(gt_map)].copy()
    if len(pred) < 100:
        return None, f"only {len(pred)} test compounds matched"
    pred["_true"] = pred["_id"].map(gt_map)
    pred = pred.dropna(subset=["_true", "_pred"])
    m = compute_metrics(pred["_true"].values, pred["_pred"].values)
    m["N"] = len(pred)
    return m, "ok"


def print_metrics(m, label=""):
    tag = f" [{label}]" if label else ""
    print(f"\n{'='*55}")
    print(f"  Unblinded Evaluation{tag}")
    print(f"  N        : {m['N']}")
    print(f"  MAE      : {m['MAE']:.4f}")
    print(f"  RAE      : {m['RAE']:.4f}")
    print(f"  R2       : {m['R2']:.4f}")
    print(f"  Spearman : {m['Spearman']:.4f}")
    print(f"  Kendall  : {m['Kendall']:.4f}")
    print(f"{'='*55}")


def delta_block(m_new, m_base, label_base):
    print(f"\n-- Delta (new - {label_base}) --")
    for k in ["MAE", "RAE", "R2", "Spearman", "Kendall"]:
        delta  = m_new[k] - m_base[k]
        better = (delta < 0) if k in ("MAE", "RAE") else (delta > 0)
        tag    = " BETTER" if better else (" SAME" if abs(delta) < 1e-5 else " WORSE")
        print(f"  {k:<10}: {delta:+.4f}{tag}")


def main():
    parser = argparse.ArgumentParser(
        description="Evaluate predictions against unblinded test set")
    parser.add_argument("files", nargs="*",
                        help="Prediction CSV file(s) to evaluate")
    parser.add_argument("--test_csv", default=TEST_CSV)
    parser.add_argument("--all", action="store_true",
                        help="Score all predictions_*.csv and blend*.csv files")
    parser.add_argument("--compare", action="store_true",
                        help="Compare to Phase 1 Chemprop and Ensemble baselines")
    parser.add_argument("--save_csv", default=None,
                        help="Save ranked results table to this CSV")
    args = parser.parse_args()

    if not os.path.exists(args.test_csv):
        print(f"ERROR: {args.test_csv} not found.")
        print("  Run from D:\\unimol_finetuning\\ or pass --test_csv <path>")
        return

    gt_map = load_ground_truth(args.test_csv)
    print(f"Ground truth loaded: {len(gt_map)} Phase 1 compounds with valid pEC50")

    # Collect files to score
    if args.all:
        files = sorted(set(
            glob.glob("predictions_*.csv") +
            glob.glob("final_blend_submission.csv") +
            glob.glob("blends_3model/*.csv") +
            glob.glob("blends_4model/*.csv") +
            glob.glob("blend3_*.csv") +
            glob.glob("blend4_*.csv") +
            glob.glob("blend_*.csv") +
            glob.glob("blends/*.csv")
        ))
    else:
        files = args.files or []

    if not files:
        parser.print_help()
        return

    # Score each file
    results = []
    for fp in files:
        m, status = score_file(fp, gt_map)
        if m:
            m["file"] = os.path.basename(fp)
            results.append(m)
        elif not args.all:
            print(f"  SKIP {os.path.basename(fp)}: {status}")

    if not results:
        print("No files could be scored.")
        return

    df = pd.DataFrame(results).sort_values("MAE").reset_index(drop=True)
    df.insert(0, "rank", range(1, len(df) + 1))

    # Multi-file: print ranked table
    if args.all or len(results) > 1:
        print(f"\n{'Rank':<5} {'File':<52} {'MAE':>6} {'RAE':>6} {'R2':>6} {'Spear':>6}")
        print("-" * 80)
        for _, row in df.iterrows():
            print(f"{int(row['rank']):<5} {row['file'][:51]:<52} "
                  f"{row['MAE']:.4f} {row['RAE']:.4f} {row['R2']:.4f} {row['Spearman']:.4f}")
        for baseline, label in [
            (CHEMPROP_PHASE1, "Phase 1 Chemprop best (LB MAE 0.4622, Rank 36)"),
            (ENSEMBLE_PHASE1, "Phase 1 Ensemble best (LB MAE 0.4468, Rank 39)"),
        ]:
            base = df[df["file"] == os.path.basename(baseline)]
            if len(base):
                br = base.iloc[0]
                print(f"\n  {label}: rank {int(br['rank'])} / {len(df)}  "
                      f"MAE={br['MAE']:.4f}  Spearman={br['Spearman']:.4f}")

    # Single file: print full metrics + optional comparison
    else:
        m = results[0]
        print_metrics(m, label=os.path.basename(files[0]))

        if args.compare:
            for baseline_csv, label_base in [
                (CHEMPROP_PHASE1,
                 "Phase 1 Chemprop (clean_train2, 10-fold, simple avg, MAE 0.4605)"),
                (ENSEMBLE_PHASE1,
                 "Phase 1 Ensemble (LB MAE 0.4468, Rank 39)"),
            ]:
                if not os.path.exists(baseline_csv):
                    print(f"  (baseline not found: {baseline_csv})")
                    continue
                m_base, status = score_file(baseline_csv, gt_map)
                if not m_base:
                    print(f"  (could not score baseline: {status})")
                    continue
                print_metrics(m_base, label=label_base)
                delta_block(m, m_base, label_base)

    # Save CSV ranking if requested
    if args.save_csv:
        df.to_csv(args.save_csv, index=False)
        print(f"\nRanking saved -> {args.save_csv}")


if __name__ == "__main__":
    main()
