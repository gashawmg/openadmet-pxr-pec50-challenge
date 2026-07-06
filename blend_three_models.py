"""
3-model blend: UniMol 8-fold (3743) + Chemprop 10-fold (3743) + UniMol 10-fold (2948)
Run: python blend_three_models.py
"""

import pandas as pd
import numpy as np
import os
from itertools import product

# ── Input files ────────────────────────────────────────────────────────────────
UNIMOL_8F_CSV  = r'D:\unimol_finetuning\predictions_unimol_8fold_raw.csv'   # rank 33, MAE 0.4615
CHEMPROP_CSV   = r'D:\unimol_finetuning\predictions_pec50_pxr_v4_3_3_nw.csv' # rank 36, MAE 0.4622
UNIMOL_2948_CSV = r'D:\unimol_finetuning\predictions_unimol_7fold.csv'       # MAE ~0.463

OUT_DIR = r'D:\unimol_finetuning\blends_3model'
os.makedirs(OUT_DIR, exist_ok=True)

# ── Load predictions ───────────────────────────────────────────────────────────
um8  = pd.read_csv(UNIMOL_8F_CSV)
cp   = pd.read_csv(CHEMPROP_CSV)
um29 = pd.read_csv(UNIMOL_2948_CSV)

print(f"UniMol 8-fold  (3743): {len(um8)}  compounds, "
      f"range=[{um8['pEC50'].min():.3f}, {um8['pEC50'].max():.3f}]")
print(f"Chemprop 10-fold(3743): {len(cp)}  compounds, "
      f"range=[{cp['pEC50'].min():.3f}, {cp['pEC50'].max():.3f}]")
print(f"UniMol 10-fold (2948): {len(um29)} compounds, "
      f"range=[{um29['pEC50'].min():.3f}, {um29['pEC50'].max():.3f}]")

assert len(um8) == len(cp) == len(um29), \
    f"Row count mismatch: {len(um8)}, {len(cp)}, {len(um29)}"

um8_preds  = um8['pEC50'].values
cp_preds   = cp['pEC50'].values
um29_preds = um29['pEC50'].values

# ── Correlation check ──────────────────────────────────────────────────────────
print(f"\nPairwise correlations (Pearson):")
print(f"  UniMol-8f  vs Chemprop    : {np.corrcoef(um8_preds, cp_preds)[0,1]:.4f}")
print(f"  UniMol-8f  vs UniMol-2948 : {np.corrcoef(um8_preds, um29_preds)[0,1]:.4f}")
print(f"  Chemprop   vs UniMol-2948 : {np.corrcoef(cp_preds, um29_preds)[0,1]:.4f}")
print("  (Lower correlation = more complementary = better ensemble potential)")

# ── Best 2-model blend reminder ────────────────────────────────────────────────
best_2model = 0.5 * um8_preds + 0.5 * cp_preds
print(f"\nExisting best (50/50 UniMol-8f + Chemprop): "
      f"range=[{best_2model.min():.3f}, {best_2model.max():.3f}]  "
      f"std={best_2model.std():.3f}")

# ── 3-model grid search ────────────────────────────────────────────────────────
# Weights: (w_um8, w_cp, w_um29) summing to 1.0
# Give UniMol-2948 a small weight (0.1-0.3) since it's the weakest model
print(f"\n{'W_UniMol8':>10} {'W_Chemprop':>10} {'W_UniMol29':>11} "
      f"{'Range':>18} {'Std':>6}  File")
print("-" * 85)

blend_files = []

# Structured weight combinations
weight_sets = [
    # (w_um8, w_cp, w_um2948)  — must sum to 1.0
    (0.45, 0.45, 0.10),   # small UniMol-2948 contribution
    (0.40, 0.40, 0.20),   # moderate UniMol-2948 contribution
    (0.35, 0.35, 0.30),   # equal three-way
    (0.50, 0.30, 0.20),   # UniMol-8f dominant
    (0.30, 0.50, 0.20),   # Chemprop dominant
    (0.40, 0.50, 0.10),   # Chemprop slightly dominant, small UniMol-2948
    (0.50, 0.40, 0.10),   # UniMol-8f slightly dominant, small UniMol-2948
    (0.45, 0.35, 0.20),   # UniMol-8f dominant, moderate UniMol-2948
    (0.35, 0.45, 0.20),   # Chemprop dominant, moderate UniMol-2948
    (0.33, 0.33, 0.34),   # equal thirds
]

for w_um8, w_cp, w_um29 in weight_sets:
    assert abs(w_um8 + w_cp + w_um29 - 1.0) < 1e-6, "Weights must sum to 1"
    blended = w_um8 * um8_preds + w_cp * cp_preds + w_um29 * um29_preds

    fname = (f'blend3_um8f{int(w_um8*100)}'
             f'_cp{int(w_cp*100)}'
             f'_um29{int(w_um29*100)}.csv')
    fpath = os.path.join(OUT_DIR, fname)

    sub = pd.DataFrame()
    if 'Molecule Name' in um8.columns:
        sub['Molecule Name'] = um8['Molecule Name'].values
    if 'SMILES' in um8.columns:
        sub['SMILES'] = um8['SMILES'].values
    sub['pEC50'] = blended
    sub.to_csv(fpath, index=False)
    blend_files.append(fpath)

    print(f"  {w_um8:>9.2f} {w_cp:>10.2f} {w_um29:>11.2f}  "
          f"[{blended.min():.3f}, {blended.max():.3f}]  "
          f"{blended.std():.3f}  {fname}")

print(f"\n{len(blend_files)} blend files saved to: {OUT_DIR}")

print("""
Recommended submission order:
  1. (0.45, 0.45, 0.10) — safest: minimal UniMol-2948 contribution
  2. (0.40, 0.40, 0.20) — moderate UniMol-2948 contribution
  3. (0.33, 0.33, 0.34) — equal thirds (most aggressive)

If correlation(UniMol-8f, UniMol-2948) > 0.97:
  → The two UniMol models are too similar; adding UniMol-2948 unlikely to help
  → Stick with 2-model blend (rank 26)

If correlation(UniMol-8f, UniMol-2948) < 0.95:
  → Meaningful diversity exists; 3-model blend has real potential
""")
