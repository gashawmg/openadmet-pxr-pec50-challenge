"""
Optimise ensemble blend weights using the unblinded test set as ground truth.

Searches for optimal weights across component models including the new Phase 2
Chemprop (v2_inact300) and Phase 1 UniMol models.

Usage
-----
  python optimise_blend.py                   # default components
  python optimise_blend.py --save_csv blend_results.csv

Output
------
  - Ranked table of all weight combinations tested
  - Best blend predictions saved to predictions_best_blend_phase2.csv
"""

import argparse
import itertools
import os
import numpy as np
import pandas as pd
from scipy import stats
from scipy.optimize import minimize

TEST_CSV   = "test_unblinded.csv"
SAVE_PRED  = "predictions_best_blend_phase2.csv"

# Component models to blend — edit to add/remove
COMPONENTS = {
    "CP_phase2":   "predictions_v2_inact300.csv",          # NEW: Phase 2 Chemprop
    "CP_phase1":   "predictions_v4_3_3_repro2_simple.csv", # Phase 1 Chemprop
    "UniMol_8f":   "predictions_unimol_8fold_raw.csv",     # UniMol 8-fold (Phase 1)
    "UniMol_7f":   "predictions_unimol_7fold.csv",         # UniMol 7-fold (Phase 1)
}


# ── Metrics ───────────────────────────────────────────────────────────────────
def rae(y_true, y_pred):
    return np.sum(np.abs(y_true - y_pred)) / np.sum(np.abs(y_true - np.mean(y_true)))

def metrics(y_true, y_pred):
    mae = np.mean(np.abs(y_true - y_pred))
    r2  = 1 - np.sum((y_true-y_pred)**2) / np.sum((y_true-y_true.mean())**2)
    sp  = stats.spearmanr(y_true, y_pred).correlation
    return mae, r2, sp


# ── Load predictions and align to test set ────────────────────────────────────
def load_preds(fpath, gt_map):
    if not os.path.exists(fpath):
        return None
    df = pd.read_csv(fpath)
    ic = next((c for c in df.columns if "molecule" in c.lower() or "name" in c.lower()), None)
    pc = next((c for c in df.columns if "pec50" in c.lower() and c != ic), None)
    if ic is None or pc is None:
        return None
    df = df.rename(columns={ic: "id", pc: "pred"})
    df = df[df["id"].isin(gt_map)].copy()
    df["true"] = df["id"].map(gt_map)
    df = df.dropna(subset=["true", "pred"]).sort_values("id").reset_index(drop=True)
    return df


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--save_csv", default=None)
    parser.add_argument("--step",     type=float, default=0.05,
                        help="Grid step for weight sweep (default 0.05)")
    args = parser.parse_args()

    # Load ground truth
    gt = pd.read_csv(TEST_CSV)
    gt = gt[gt["phase"] == 1].dropna(subset=["pEC50"])
    gt_map = dict(zip(gt["Molecule Name"], gt["pEC50"]))
    print(f"Ground truth: {len(gt_map)} Phase 1 compounds\n")

    # Load all component predictions
    loaded = {}
    for name, fpath in COMPONENTS.items():
        df = load_preds(fpath, gt_map)
        if df is not None:
            loaded[name] = df
            y_t, y_p = df["true"].values, df["pred"].values
            mae, r2, sp = metrics(y_t, y_p)
            print(f"  {name:<14} MAE={mae:.4f}  R2={r2:.4f}  Spearman={sp:.4f}  "
                  f"N={len(df)}  range=[{y_p.min():.3f},{y_p.max():.3f}]")
        else:
            print(f"  {name:<14} NOT FOUND: {fpath}")

    if len(loaded) < 2:
        print("Need at least 2 models to blend.")
        return

    # Align all models to same compound set
    common_ids = set(loaded[list(loaded.keys())[0]]["id"])
    for df in loaded.values():
        common_ids &= set(df["id"])
    print(f"\nCommon compounds across all models: {len(common_ids)}")

    names = list(loaded.keys())
    y_true = np.array([loaded[names[0]].set_index("id").loc[list(common_ids), "true"].values])
    y_true = y_true.flatten()
    pred_mat = {}
    for name in names:
        pred_mat[name] = loaded[name].set_index("id").loc[list(common_ids), "pred"].values

    # ── Scipy optimisation (Nelder-Mead) ──────────────────────────────────────
    n = len(names)
    def objective(w):
        w = np.abs(w); w = w / w.sum()
        y_pred = sum(w[i] * pred_mat[names[i]] for i in range(n))
        return np.mean(np.abs(y_true - y_pred))   # minimise MAE

    best_opt = None
    best_mae = 1e9
    # Multiple random starts
    np.random.seed(42)
    for _ in range(50):
        w0 = np.random.dirichlet(np.ones(n))
        res = minimize(objective, w0, method="Nelder-Mead",
                       options={"maxiter": 5000, "xatol": 1e-6, "fatol": 1e-6})
        if res.fun < best_mae:
            best_mae = res.fun
            best_opt = res.x

    best_w = np.abs(best_opt); best_w /= best_w.sum()
    print(f"\n--- Nelder-Mead optimised weights ---")
    for i, name in enumerate(names):
        print(f"  {name:<14}: {best_w[i]:.3f}  ({best_w[i]*100:.1f}%)")
    y_pred_opt = sum(best_w[i] * pred_mat[names[i]] for i in range(n))
    mae, r2, sp = metrics(y_true, y_pred_opt)
    print(f"  MAE={mae:.4f}  R2={r2:.4f}  Spearman={sp:.4f}")

    # ── Grid search (for interpretability) ────────────────────────────────────
    print(f"\n--- Grid search (step={args.step}) ---")
    step = args.step
    vals = np.arange(0, 1 + step/2, step)

    grid_results = []
    if n == 2:
        for w0 in vals:
            w1 = 1 - w0
            y_p = w0*pred_mat[names[0]] + w1*pred_mat[names[1]]
            mae, r2, sp = metrics(y_true, y_p)
            grid_results.append((mae, r2, sp, w0, w1, 0, 0))
    elif n == 3:
        for w0 in vals:
            for w1 in vals:
                w2 = 1 - w0 - w1
                if w2 < -1e-6: continue
                w2 = max(0, w2)
                y_p = w0*pred_mat[names[0]] + w1*pred_mat[names[1]] + w2*pred_mat[names[2]]
                mae, r2, sp = metrics(y_true, y_p)
                grid_results.append((mae, r2, sp, w0, w1, w2, 0))
    elif n == 4:
        for w0 in vals:
            for w1 in vals:
                for w2 in vals:
                    w3 = 1 - w0 - w1 - w2
                    if w3 < -1e-6: continue
                    w3 = max(0, w3)
                    y_p = (w0*pred_mat[names[0]] + w1*pred_mat[names[1]] +
                           w2*pred_mat[names[2]] + w3*pred_mat[names[3]])
                    mae, r2, sp = metrics(y_true, y_p)
                    grid_results.append((mae, r2, sp, w0, w1, w2, w3))

    col_names = ["MAE","R2","Spearman"] + names[:n]
    grid_df = pd.DataFrame([r[:3+n] for r in grid_results], columns=col_names)
    grid_df = grid_df.sort_values("MAE").reset_index(drop=True)

    print(f"\nTop 15 grid-search blends:")
    print(f"{'Rank':<5} {'MAE':>6} {'R2':>6} {'Spear':>6}  " +
          "  ".join(f"{n[:6]:>8}" for n in names))
    print("-" * (40 + 10*len(names)))
    for i, row in grid_df.head(15).iterrows():
        ws = "  ".join(f"{row[n]:>8.2f}" for n in names if n in row)
        print(f"{i+1:<5} {row.MAE:>6.4f} {row.R2:>6.4f} {row.Spearman:>6.4f}  {ws}")

    # Best grid blend
    best_row = grid_df.iloc[0]
    best_grid_w = np.array([best_row[n] if n in best_row else 0.0 for n in names])
    best_grid_w /= best_grid_w.sum()

    # ── Choose better of optimised vs grid ────────────────────────────────────
    if mae < best_mae:
        final_w = best_grid_w
        final_mae = best_row.MAE
    else:
        final_w = best_w
        final_mae = best_mae

    print(f"\n--- Best final blend ---")
    y_pred_final = sum(final_w[i] * pred_mat[names[i]] for i in range(n))
    f_mae, f_r2, f_sp = metrics(y_true, y_pred_final)
    for i, name in enumerate(names):
        print(f"  {name:<14}: {final_w[i]:.3f}  ({final_w[i]*100:.1f}%)")
    print(f"  MAE={f_mae:.4f}  R2={f_r2:.4f}  Spearman={f_sp:.4f}")

    # Compare to Phase 1 ensemble baseline
    p1_ens = load_preds(ENSEMBLE_PHASE1 if os.path.exists(ENSEMBLE_PHASE1)
                        else "final_blend_submission.csv", gt_map)
    if p1_ens is not None:
        p1_ids = set(p1_ens["id"]) & common_ids
        p1_sub = p1_ens[p1_ens["id"].isin(p1_ids)].sort_values("id")
        y_t_p1 = p1_sub["true"].values
        y_p_p1 = p1_sub["pred"].values
        p1_mae, p1_r2, p1_sp = metrics(y_t_p1, y_p_p1)
        print(f"\n  Phase 1 ensemble   : MAE={p1_mae:.4f}  R2={p1_r2:.4f}  Spearman={p1_sp:.4f}")
        delta_mae = f_mae - p1_mae
        print(f"  Delta (new - P1ens): MAE {delta_mae:+.4f}  "
              f"R2 {f_r2-p1_r2:+.4f}  Spearman {f_sp-p1_sp:+.4f}")

    # ── Save best blend predictions (full 253 set) ────────────────────────────
    all_ids = list(gt_map.keys())
    final_preds = np.zeros(len(all_ids))
    for i, name in enumerate(names):
        df = loaded[name].set_index("id")
        for j, id_ in enumerate(all_ids):
            if id_ in df.index:
                final_preds[j] += final_w[i] * df.loc[id_, "pred"]

    out = pd.DataFrame({
        "Molecule Name": all_ids,
        "pEC50": final_preds
    })
    out.to_csv(SAVE_PRED, index=False)
    print(f"\nBest blend predictions saved -> {SAVE_PRED}")

    if args.save_csv:
        grid_df.to_csv(args.save_csv, index=False)
        print(f"Full grid results saved -> {args.save_csv}")


ENSEMBLE_PHASE1 = "final_blend_submission.csv"

if __name__ == "__main__":
    main()
