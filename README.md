# Predicting PXR Induction Potency — OpenADMET Blind Challenge

> **Phase 1:** MAE **0.4468** · RAE **0.5606** · R² **0.5459** · Spearman **0.8463** · Kendall's τ **0.6567** · Rank **39**
> **Phase 2 (intermediate):** RAE **0.5298** · MAE **0.4231** · R² **0.6236** · Spearman **0.8389**
> **Phase 2 (final submission):** Holdout-30 RAE **0.4471** · `submission_blend_751510.csv`
> 75% pp50 + 15% p13d + 10% UniMol · Chemprop D-MPNN + MultitaskMPNN + UniMol 3D Transformer · No proprietary data

---

## Table of Contents

1. [Why PXR?](#why-pxr)
2. [The Challenge](#the-challenge)
3. [Data: From Screen to Model-Ready Set](#data-from-screen-to-model-ready-set)
4. [Chemical Space Analysis](#chemical-space-analysis)
5. [Models](#models)
6. [What Was Tried (and What Failed)](#what-was-tried-and-what-failed)
7. [Best Ensemble (Phase 1)](#best-ensemble-phase-1)
8. [Phase 2 — Refinement with Unblinded Labels](#phase-2--refinement-with-unblinded-labels)
9. [Phase 2 — Aug2: Clean Retraining with Honest Holdout Evaluation](#phase-2--aug2-clean-retraining-with-honest-holdout-evaluation)
10. [The Three Models in the Final Blend](#the-three-models-in-the-final-blend)
11. [Why 75/15/10 is the Optimal Blend](#why-751510-is-the-optimal-blend)
12. [Conclusion](#conclusion)
13. [Repo Contents](#repo-contents)

---

## Why PXR?

The **Pregnane X Receptor (PXR / NR1I2)** is a nuclear receptor that acts as the primary sensor for foreign chemicals entering the body. Upon activation by a drug candidate, PXR translocates to the nucleus and dramatically upregulates **CYP3A4** — the cytochrome P450 enzyme that handles roughly half of all small-molecule drugs in clinical use. For a drug candidate, PXR activation carries three serious consequences:

| Consequence | Mechanism |
|---|---|
| **Drug-Drug Interactions (DDIs)** | Elevated CYP3A4 activity accelerates clearance of co-administered drugs, potentially dropping them below therapeutic thresholds |
| **Hepatotoxicity** | Increased metabolic flux through CYP3A4 can generate reactive intermediates that damage liver tissue |
| **Chemoresistance** | In PXR-expressing tumours, enhanced CYP3A4 activity reduces the intracellular concentration of oncology agents |

Modelling PXR activity is challenging for two reasons. First, the receptor's ligand-binding pocket is exceptionally large and conformationally adaptable, allowing it to accommodate structurally unrelated compounds — from macrolide antibiotics to steroidal natural products to synthetic drug fragments. Second, before this challenge, quantitative PXR activity data in the public domain was sparse and heterogeneous: fewer than 800 reliable pEC50 values extracted from roughly 150 publications, each using different cell lines, reporter constructs, and concentration protocols.

---

## The Challenge

The **[OpenADMET Blind Challenge](https://huggingface.co/spaces/openadmet/pxr-challenge)** (Octant Bio + UCSF) addresses this data scarcity directly by releasing the largest uniform-assay PXR activity dataset to date: over 11,000 compounds tested in a single, standardised cell-based system.

**Assay design:** PXR agonism is measured using a reporter cell line in which a chimeric receptor construct — the PXR ligand-binding domain grafted onto a heterologous DNA-binding domain — drives luciferase expression upon activation. A critical feature of the assay is the paired counter-screen: an identical experiment is run in parallel using a construct carrying a non-functional point mutant of the same chimeric receptor. Any compound that activates both the active and mutant constructs is classified as a non-specific transcriptional activator (e.g. an HDAC inhibitor) rather than a genuine PXR agonist, and is removed from the potency analysis. Only compounds that selectively activate the functional construct are retained.

**The test set is not a random sample.** Rather than drawing compounds at random from the screening library, 513 Enamine on-demand analogs were selected around the 63 most potent and selective hits (ECFP4 Tanimoto similarity > 0.4 to at least one of the 63 seed compounds). This **analog expansion design** places the prediction task squarely in lead optimisation territory — small structural changes within active series that may produce large potency differences — rather than in broad virtual screening.

| Phase | Dates | Description |
|---|---|---|
| **Phase 1** | April 1 – May 25, 2026 | Blind prediction for all 513 test compounds; live leaderboard |
| **Phase 2** | May 26 – July 1, 2026 | Analog Set 1 labels unblinded (252 compounds); refine predictions for Set 2 (261 compounds) |

**Ranking metric:** Relative Absolute Error (RAE) = Σ|y−ŷ| / Σ|y−ȳ|. MAE, R², Spearman ρ and Kendall's τ also reported.

---

## Data: From Screen to Model-Ready Set

### The generation funnel

```
Primary screen (11,362 compounds @ 10 µM / 30 µM)
    ↓  Hit rate ~17% @ 10 µM
Dose-response curves (4,325 compounds, 8-concentration)
    ↓  Fitted EC50 ≤ 1 µM
~211 active compounds (pEC50 ≥ 6)
    ↓  Counter-screen: selectivity_delta ≥ 1.5 log-units
63 selective hits → Enamine analog expansion → 513 test compounds
```

The competition released **4,139 compounds with pEC50 labels** as training data. Each has both a PXR pEC50 and a counter-screen pEC50, giving a **selectivity delta**:

```
selectivity_delta = pEC50(PXR) − pEC50(counter-screen)
```

### Finding the right training set

This was the most consequential decision in the project. Every threshold was tested systematically using Chemprop (D-MPNN + 61 RDKit descriptors) as the evaluation model, with all leaderboard results from blind test set submissions:

| Dataset | Compounds | Filter | LB MAE | RAE | R² | Spearman ρ | Verdict |
|---|---|---|---|---|---|---|---|
| `clean_train.csv` | 2,948 | delta > 1.5 | 0.4794 | 0.6017 | 0.4799 | 0.8042 | Starting point |
| **`clean_train2.csv`** | **3,743** | **delta > 0** | **0.4622** | **0.5800** | **0.5117** | **0.8137** | ✅ Phase 1 baseline |
| + 37 ChEMBL compounds | 3,780 | delta > 0 + external | 0.5051 | 0.6338 | 0.4094 | 0.7420 | ❌ Assay heterogeneity |
| Relaxed (delta ≥ −0.6) | 4,054 | — | 0.4809 | 0.6036 | 0.5008 | 0.8097 | ❌ Non-selective contamination |
| Unfiltered | 4,139 | None | 0.5095 | 0.6397 | 0.4799 | 0.8025 | ❌ Rejected |

**The biological logic:** The 513 test compounds are analogs of hits with selectivity delta ≥ 1.5. The training set that best represents this population is one filtered by *positive* selectivity — delta > 0 captures compounds that show some PXR preference over the counter-screen, without forcing the strict 1.5-unit threshold that would discard useful potency information from moderate hits.

> **Rule established:** `clean_train2.csv` (3,743 compounds, selectivity_delta > 0) is the hard ceiling for Phase 1. Adding *any* compounds beyond this — by relaxing the filter, hand-picking borderline entries, or adding external ChEMBL data — degraded leaderboard performance in every experiment. Phase 2 broke this ceiling by adding *measured* high-potency data from secondary screening.

### Why external ChEMBL data hurt

37 ChEMBL PXR compounds with ECFP4 Tanimoto ≥ 0.4 to blind test compounds were curated and added to training. Leaderboard MAE jumped from 0.4622 to **0.5051** (rank 36 → 80). The reason: ChEMBL PXR measurements span at least 150 different assay protocols, cell lines, and reporter constructs accumulated over two decades. The OpenADMET assay is a single, tightly controlled protocol. Adding cross-assay data introduces systematic offsets that the model learns as real signal — but they are assay artefacts.

---

## Chemical Space Analysis

### Structural coverage of the test set

Prior to model development, the relationship between training and test chemical space was mapped using Morgan fingerprint Tanimoto similarity against `clean_train2.csv` (3,743 compounds). The mean max-Tanimoto across all test compounds is **0.53**, peaking in the 0.45–0.55 range.

**The challenge here is not structural novelty — it is activity cliffs and potency tail prediction.** The best Phase 1 Chemprop model produced a test prediction ceiling of **pEC50 = 5.94**, while the training set reaches **7.55**. Only 64 of 3,743 training compounds (1.7%) have pEC50 ≥ 6 — the model has very few high-potency scaffold anchors to extrapolate from, even when test compounds are structurally similar to training.

### Interactive Chemical Space Map (t-SNE)

A t-SNE embedding of all 4,652 compounds (training + test) was computed using:

```
ECFP4 fingerprints (2048-bit) → PCA (50 components) → t-SNE (perplexity=50, 500 iterations)
```

**[→ Open interactive t-SNE map](https://gashawmg.github.io/PXR-activity-pEC50-prediction/tsne_interactive_v2.html)**
*(Hover over any compound to see its name and predicted pEC50. Viridis colour scale = training pEC50. Blue circles = test compounds.)*

![t-SNE chemical space](tsne_white.png)

---

## Models

### Preliminary: Classical ML Baseline

A classical ML stack (LightGBM + HistGradientBoosting + SVR meta-learner) on RDKit descriptors + ECFP4 fingerprints achieved LB MAE = 0.5196, Spearman = 0.7258. The 16% MAE gap and 0.11 Spearman gap vs. the final ensemble established that classical ML had hit a ceiling on this task, motivating the switch to graph neural networks.

### Chemprop (2D Message-Passing Neural Network)

[Chemprop](https://github.com/chemprop/chemprop) implements a directed message-passing neural network (D-MPNN) that learns molecular representations by iteratively aggregating atom and bond features across 2D graph neighbourhoods. Development followed three successive improvements:

**Step 1 — 61 PXR-specific descriptors** concatenated to graph readout (LogP, TPSA, shape descriptors, ring counts, pharmacophore flags, QED): −9.4% MAE, −9.4% RAE in a single step.

**Step 2 — Expanded training set** (2,948 → 3,743 compounds, delta > 0): −3.6% MAE.

**Step 3 — 10-fold activity-stratified scaffold CV**: 10-fold outperforms 15-fold and 20-fold because smaller validation sets destabilise early stopping, producing inconsistent fold models.

| Stage | LB MAE | RAE | Spearman ρ |
|---|---|---|---|
| D-MPNN, no descriptors (2,948) | 0.5289 | 0.6641 | 0.7324 |
| + 61 PXR descriptors | 0.4794 | 0.6017 | 0.8042 |
| + expanded training (3,743) + tuning | **0.4622** | **0.5800** | **0.8137** |

### UniMol (3D Molecular Transformer)

[UniMol](https://github.com/deepmodeling/Uni-Mol) is a transformer-based foundation model pre-trained on 200 million molecular conformers. Input conformers are generated with ETKDG v3 (all hydrogens retained), giving access to inter-atomic distances, angles, and steric contacts invisible to 2D graph networks.

- Fine-tuned on 3,743 competition compounds, 8-fold scaffold CV on Kaggle T4 × 2 GPU
- **LB MAE: 0.4615 (Rank 33), Spearman: 0.8306**
- 8-fold is the sweet spot: 12-fold and 15-fold both degrade (same val-set stability issue as Chemprop)

---

## What Was Tried (and What Failed)

The most important methodological finding: **every technique that improved OOF cross-validation MAE worsened the leaderboard MAE.** This reflects a fundamental distribution shift — the training set is not representative enough of the analog-expansion test set to use OOF as a reliable proxy for generalisation.

| Experiment | OOF MAE | LB MAE | Rank | Key lesson |
|---|---|---|---|---|
| v4_3_3 MSE baseline | 0.4420 | 0.4622 | 36 | ✅ Hard ceiling for Phase 1 |
| MAE/L1 loss | 0.4369 ↓ | 0.4674 ↑ | 62 | Better OOF, worse LB — MAE loss median-pulls |
| QuantileTransformer scaler | 0.4546 | 0.4748 | 68 | Poor convergence (avg 24 epochs vs 41) |
| SC binary pre-training | **0.4338** ↓ | **0.4943** ↑ | **108** | Wrong objective; see below |
| Hand-picked +5 compounds | 0.4396 ↓ | 0.4751 ↑ | 67 | OOF/LB gap = 0.036 — largest observed |
| + 37 ChEMBL compounds | 0.4463 | 0.5051 | 80 | Assay heterogeneity |
| Piecewise stretch post-processing | — | always worse | — | Compression is distributional, not calibrational |

**The SC pre-training experiment — a cautionary tale.** Pre-training on binary PXR hit/non-hit labels (21,003 compounds from the primary screen) then fine-tuning on pEC50: OOF MAE 0.4338 (best ever), LB MAE 0.4943 (rank 108 — worst result). Binary labels at µM concentrations cannot teach the model to discriminate pEC50 4 vs 5 vs 6. The right approach is multi-task learning with simultaneous gradient flow — implemented in Phase 2 as MultitaskMPNN.

---

## Best Ensemble (Phase 1)

| Model | Weight | Training data | LB MAE | RAE | Spearman ρ |
|---|---|---|---|---|---|
| UniMol 8-fold (Kaggle T4 × 2) | **35%** | 3,743 compounds | 0.4615 | 0.5793 | 0.8306 |
| Chemprop 10-fold | **35%** | 3,743 compounds | 0.4622 | 0.5800 | 0.8137 |
| UniMol 7-fold | **30%** | 1,948 compounds | — | — | — |

**Phase 1 final result: MAE 0.4468 · RAE 0.5606 · R² 0.5459 · Spearman 0.8463 · Rank 39**

All pairwise model correlations < 0.95, confirming meaningful ensemble diversity. The third model (trained on a smaller 1,948-compound subset) captures different error patterns from the 8-fold model (Pearson r = 0.937).

---

## Phase 2 — Refinement with Unblinded Labels

> **Intermediate result:** RAE **0.5298** · MAE **0.4231** · R² **0.6236** · Spearman **0.8389** · Kendall's τ **0.6486**
> `submission_final_3way_513.csv` — 70% × (48% v4_4 + 52% v4_13d) + 30% UniMol

### What the Unblinded Labels Revealed

Evaluating all historical predictions against the 252 Analog Set 1 compounds revealed the dominant error mode: **activity cliffs driven by low-potency compounds**.

- **22% of test compounds** (pEC50 < 4.0, N=55) account for **60% of total RAE** — models over-predict their activity by +0.97 pEC50 units on average
- These low-potency compounds share scaffold topology with active training compounds (ECFP4 Tanimoto ≥ 0.5), making them appear "active" to a 2D graph network
- 31 high-uncertainty compounds (pEC50 std error > 0.3) have RAE = 2.0 — nearly 4× worse than low-uncertainty compounds, setting an irreducible noise floor

### New Training Data

Phase 2 enriched the training set with measured high-potency compounds from secondary screening:

| Source | N | Content |
|---|---|---|
| `clean_train2.csv` | 3,743 | Phase 1 baseline |
| `crude_nv_hi` | 244 | Measured hits with pEC50 ≥ 5.5 |
| `semi_nv` | 55 | Semi-pure batch measurements (non-volatile, purity-corrected) |
| `sc_inactives_300` | 300 | Confirmed SC inactives (pseudo-pEC50 = 2.0) |

**Chemprop training set: 4,342 compounds** (all four sources).
**UniMol training set: 4,042 compounds** (clean_train2 + crude_nv_hi + semi_nv, **no sc_inactives**).

A controlled ablation showed `sc_inactives_300` hurts UniMol's Potent >5.5 bin by +0.44 RAE. Chemprop uses 3× sample weights to limit their influence; UniMol's MolTrain assigns equal weight to all rows, so 300 identical pseudo-labels at pEC50 = 2.0 distort the high-potency conformer embedding. The inactive correction is handled by Chemprop in the ensemble.

### Chemprop v4_4: New Best Single Model

| Model | RAE | MAE | R² | Spearman ρ |
|---|---|---|---|---|
| v4_3_3 (Phase 1 best Chemprop) | 0.5886 | 0.4701 | 0.5234 | 0.8074 |
| **v4_4** | **0.5477** | **0.4374** | **0.5996** | **0.8082** |

Key changes: Phase 2 training data, sc_inactives supplement, 3× sample weight for pEC50 ≥ 5.5.

### MultitaskMPNN v4_13d: Asymmetric Classification Head

A `MultitaskMPNN` with shared D-MPNN trunk and parallel output heads trained simultaneously:

```
Molecule → BondMessagePassing → shared MLP trunk
                                    ├─ reg_head  → pEC50 (MSE loss, all compounds)
                                    └─ clf_head  → active/inactive (asymmetric BCE)
```

**Joint loss:** `0.8 × MSE + 0.2 × BCE_asymmetric`

The asymmetric BCE penalises **only false positives** (inactives predicted as active). Symmetric BCE would also penalise false negatives, creating a global downward pull on all active embeddings that compresses the potency ceiling. By zeroing the classification gradient for genuine actives, the Potent bin is preserved while the Low bin is corrected.

| Variant | RAE | Low <4.0 RAE | Potent >5.5 RAE |
|---|---|---|---|
| v4_13 (symmetric BCE) | 0.5755 | 1.643 | 2.350 |
| v4_13b (w=0.1) | 0.5706 | 1.616 | 2.222 |
| v4_13c (threshold=5.0) | 0.5770 | 1.594 | 2.182 |
| **v4_13d (asymmetric BCE)** | **0.5636** | **1.451** | **2.098** |

### Final 3-Way Ensemble (Intermediate)

**Step 1 — Chemprop ensemble:**

| Model | Weight | RAE |
|---|---|---|
| v4_4 (regression only) | 48% | 0.5477 |
| v4_13d (asymmetric MultitaskMPNN) | 52% | 0.5636 |
| **v4_4 + v4_13d blend** | — | **0.5341** |

v4_4 is stronger on active compounds (Potent bin RAE 1.131 vs 1.224); v4_13d corrects inactive over-prediction (Low bin bias +0.788 vs +0.965). The blend plateau is flat from α = 0.45–0.55, confirming robustness.

**Step 2 — Add UniMol:**

| Blend | RAE | MAE | R² |
|---|---|---|---|
| Chemprop ensemble alone | 0.5341 | 0.4266 | 0.6340 |
| **70% Ens + 30% UniMol** | **0.5298** | **0.4231** | **0.6236** |

**Final submission metrics (252 unblinded compounds):**

| Metric | Phase 1 best | **Phase 2 intermediate** | Δ |
|---|---|---|---|
| RAE | 0.5589 | **0.5298** | −0.029 |
| MAE | 0.4464 | **0.4231** | −0.023 |
| R² | 0.5459 | **0.6236** | +0.078 |
| Spearman ρ | 0.8492 | 0.8389 | −0.010 |
| Bias | +0.182 | **+0.088** | halved |

---

## Phase 2 — Aug2: Clean Retraining with Honest Holdout Evaluation

### The Leakage Problem and Fix

The first augmented models (v4_4_aug, v13d_aug) were trained on all 252 Set 1 compounds including the 30-compound holdout proxy — making their holdout-30 RAE (~0.38) inflated and unreliable as an estimate of Set 2 performance. Two additional corrections were needed:

1. **Deduplication:** `train_unimol_aug_set1.csv` contained 3 SMILES pairs with duplicate entries at different pEC50 values. These were resolved by averaging the pEC50 values and merging to single rows, reducing the dataset from 4,265 to **4,262 rows** (`train_unimol_aug_set1_holdout30_dedup.csv`).

2. **Holdout exclusion:** The 30-compound stratified holdout (`set1_holdout_30_stratified.csv`) was removed from training entirely, reserving it as a genuine out-of-sample proxy for Set 2 performance.

All aug2 models were trained exclusively on the resulting **4,262-compound clean dataset**.

### Models Trained (Aug2)

| Model | Script | Key feature | Holdout-30 RAE |
|---|---|---|---|
| v4_4_aug2 (p44) | `train_pec50_pxr_v4_4.py` | Base D-MPNN, patience=25 | 0.4646 |
| v4_13d_aug2 (p13d) | `train_pec50_pxr_v4_13d.py` | Asymmetric MultitaskMPNN, patience=25 | 0.5463 |
| v4_13f_aug2 | `train_pec50_pxr_v4_13f.py` | Steeper tail loss (z^1.5), patience=25 | 0.6073 |
| **v4_4_aug2_p50 (pp50)** | `train_pec50_pxr_v4_4.py --patience 50` | Extended early stopping | **0.4641** |
| v4_13d_aug2_p50 | `train_pec50_pxr_v4_13d.py --patience 50` | Extended early stopping | 0.5582 |
| v4_4_aug2_ht10 | `train_pec50_pxr_v4_4.py --high_tail_mult 10.0` | 10× oversampling pEC50 > 6.0 | 0.5359 |
| **UniMol aug2** | Kaggle T4 × 2, 8-fold scaffold CV | 3D transformer, no sc_inactives | 0.5282 |

A `--patience` CLI argument was added to all three training scripts, wired through `ADAPTIVE_CONFIG` override in the `train()` method. Fold-level checkpoint resumption was also added: if a `.ckpt` file already exists for a fold, training is skipped and the checkpoint loaded directly.

### Why PCHIP Calibration Hurts

Post-hoc PCHIP calibration (tested extensively in the aug1 phase) was found to be counterproductive for the aug2 ensemble. The root cause is **regression-to-mean operating differently in prediction space vs true space**:

- When a model predicts pEC50 = 5.4, the average true value is 5.2 (overprediction in prediction space)
- But genuine potent compounds (true pEC50 = 5.7) are being predicted at 5.3 (underprediction in true space)

PCHIP reads the first signal and pushes predictions down at 5.4 — but this worsens the second problem. The two biases are colocated in prediction space but arise from opposite true-space populations. All aug2 predictions use raw (uncalibrated) blend outputs.

---

## The Three Models in the Final Blend

The final submission blends three models that address fundamentally different aspects of the prediction problem. Their diversity is both architectural (2D graph vs 3D geometry) and objective-driven (regression only vs regression + classification).

### Model 1: pp50 — v4_4_aug2_p50 (75% weight)

**Architecture:** Chemprop directed message-passing neural network (D-MPNN) with 10-fold activity-stratified scaffold cross-validation. 768-dimensional hidden states, 6 message-passing steps, 4 FFN layers, dropout 0.2. Extended early stopping patience (50 epochs vs the default 25) allows fold models to converge more fully, reducing holdout-30 RAE from 0.4646 (patience-25) to 0.4641.

**Training data:** 4,262 compounds — the clean aug2 set comprising the Phase 1 baseline (3,743 compounds, selectivity_delta > 0), secondary screen hits (244 compounds with pEC50 ≥ 5.5), semi-pure batch measurements (55 compounds), and 222 of the 252 Set 1 unblinded labels (30 held out for validation). The 300 confirmed sc_inactives are included with 3× sample weight to anchor the low end of the distribution without distorting the active embedding space.

**What problem it addresses:** General pEC50 regression across the full activity range. The 61 PXR-specific RDKit descriptors appended to the MPNN readout — covering hydrophobicity (LogP, MolMR), molecular shape (Kappa indices, NPR, Asphericity), hydrogen-bond character, and ring topology — capture the pharmacophoric features known to govern PXR recognition. This is the strongest single predictor (holdout-30 RAE = 0.4641) and carries 75% of the final blend weight.

**Key limitation:** As a 2D graph model, pp50 cannot directly access three-dimensional conformer geometry — inter-atomic distances, torsion angles, and steric volume — that govern binding to PXR's large, shape-selective pocket.

---

### Model 2: p13d — v4_13d_aug2 (15% weight)

**Architecture:** Chemprop `MultitaskMPNN` with a shared D-MPNN trunk (same 768/6/4 configuration as pp50) and two separate output heads trained simultaneously under a joint loss:

```
total_loss = 0.8 × MSE(reg_head, pEC50) + 0.2 × BCE_asymmetric(clf_head, is_active)
```

**The asymmetric BCE is the key innovation.** Standard binary cross-entropy penalises both false positives (inactive predicted as active) and false negatives (active predicted as inactive). The false-negative penalty exerts a downward pull on all active embeddings, compressing the potency ceiling and worsening high-potency predictions. The asymmetric variant computes classification loss **only for inactive compounds** (pEC50 < 4.0). Active compounds contribute zero classification gradient, so the trunk learns one lesson from the auxiliary head: do not encode inactives the same way as actives.

**What problem it addresses:** Inactive over-prediction — the dominant Phase 2 error mode. When the Phase 1 labels were unblinded, 22% of test compounds (pEC50 < 4.0) accounted for 60% of total RAE, with models over-predicting by +0.97 pEC50 units on average. These inactives share scaffold topology with active training compounds, making them appear "active" to a purely regression-based 2D graph. The classification head creates an explicit discriminative boundary, reducing inactive over-prediction bias from +0.965 (symmetric BCE) to +0.788 (asymmetric BCE) without pulling potent predictions downward.

**Key limitation:** p13d's standalone holdout-30 RAE (0.5463) is the weakest of the three models. Despite correctly suppressing inactive bias, its regression head is noisier than pp50 across all activity regions — a consequence of the joint loss splitting gradient between the regression and classification objectives. Per-region comparison on holdout-30 confirms that p13d under-performs pp50 even in the inactive region it was designed to fix (inactive MAE 0.962 vs pp50's 0.775). This is why p13d carries only 15% weight in the final blend, reduced from 36% in the previous v2 submission.

---

### Model 3: UniMol aug2 — 3D Molecular Transformer (10% weight)

**Architecture:** UniMol v2 (84M parameters), an SE(3)-invariant transformer pre-trained on 200 million molecular 3D conformers from PubChem. Input features include atomic coordinates from ETKDG v3 conformers (with all hydrogens explicitly retained), inter-atomic distances encoded as Gaussian basis functions, and pairwise angle information — capturing the true 3D shape of each molecule rather than its topological graph.

**Training:** Fine-tuned on 4,262 competition compounds (**without** sc_inactives, as equal weighting of 300 pseudo-inactive labels at pEC50 = 2.0 distorts the high-potency conformer embedding) using 8-fold scaffold cross-validation on Kaggle T4 × 2 GPU. No post-hoc isotonic calibration applied. Holdout-30 RAE = 0.5282.

**What problem it addresses:** UniMol's 3D representation provides signal orthogonal to the 2D MPNN models. PXR's ligand-binding pocket is exceptionally large and conformationally flexible — binding selectivity is governed by shape complementarity and hydrophobic contacts that depend on 3D molecular geometry unavailable to graph networks. For compounds in the moderate activity range (pEC50 4.0–5.5), which constitute 65% of the blinded test set (171 of 261 compounds), UniMol reduces prediction MAE by 0.026 per compound relative to pp50, accumulating to roughly 4.5 units of saved total absolute error across the blinded set.

**Key limitation:** UniMol's output range is compressed relative to the true distribution (std = 0.593 vs pp50's 0.728 on the 261 blinded compounds). This regression-to-mean tendency is most damaging for inactive compounds: UniMol over-predicts inactives by +0.774 pEC50 units on holdout-30 (vs pp50's +0.312). At 10% blend weight this bias contribution is diluted to approximately +0.046 additional units per inactive compound — acceptable in exchange for the moderate-region gain.

### Representation Complementarity

The three models form a genuine ensemble rather than a weighted average of correlated predictors. Evaluated on the 261 truly blinded Set 2 compounds:

| Model pair | Pearson r | Spearman ρ |
|---|---|---|
| pp50 vs UniMol | 0.919 | 0.926 |
| pp50 vs p13d | 0.953 | 0.953 |
| p13d vs UniMol | 0.918 | 0.932 |

Correlations below 1.0 confirm residual error diversity: pp50 uses 2D bond graph topology augmented by 61 pharmacophoric descriptors; p13d adds an explicit discriminative signal trained on the active/inactive boundary; UniMol contributes 3D conformer geometry. In 20 of the 261 blinded compounds, pp50 and UniMol disagree by more than 0.5 pEC50 units — these are the compounds where the different representations genuinely see different chemistry, and where the ensemble adds the most value.

---

## Why 75/15/10 is the Optimal Blend

### The previous submission: v2 (60/36/4)

The initial aug2 blend (`submission_final_v2.csv`, holdout-30 RAE = 0.4499) was found by a coarse grid search over pp50, p13d, and p44 (v4_4_aug2, the patience-25 variant). This blend gave heavy weight to p13d (36%) based on its role in correcting inactive over-prediction, but p13d holdout-30 predictions were not available at the time to verify its per-region performance.

### What the real p13d holdout predictions revealed

Running p13d inference on the holdout-30 compounds:

```cmd
python train_pec50_pxr_v4_13d.py --mode INFERENCE \
  --model_dir models_pxr_v4_13d_aug2 \
  --test_csv set1_holdout_30_stratified.csv \
  --output predictions_p13d_aug2_holdout30.csv
```

The per-region breakdown revealed that p13d under-performs pp50 in every activity region:

| Region | n | p13d MAE | pp50 MAE | p13d bias | pp50 bias |
|---|---|---|---|---|---|
| Inactive <4.0 | 7 | 0.962 | **0.775** | +0.494 | **+0.312** |
| Moderate 4–5.5 | 18 | 0.295 | **0.272** | −0.056 | +0.060 |
| Potent >5.5 | 5 | 0.334 | **0.266** | −0.294 | −0.224 |

p13d's asymmetric BCE reduces inactive bias relative to its symmetric predecessor, but not below pp50's bias. Giving p13d 36% weight in v2 adds more inactive error than it subtracts.

### Grid search with verified predictions from all three models

A fine grid search (5% steps) using actual holdout-30 predictions from pp50, p13d, and UniMol:

| Blend | Holdout-30 RAE | vs v2 |
|---|---|---|
| v2 (60/36/4) | 0.4499 | baseline |
| 60/20/20 | 0.4523 | +0.0024 (worse) |
| 65/20/15 | 0.4502 | +0.0003 |
| 70/20/10 | 0.4481 | −0.0018 |
| **75/15/10** | **0.4471** | **−0.0028** |
| 80/10/10 | 0.4475 | −0.0024 |

Increasing pp50 weight and decreasing p13d weight monotonically improves holdout-30 RAE. The 75/15/10 combination is the optimum within the holdout-30 sample.

### Why the moderate region compensates for all other costs

A compound-level Δ|error| analysis on holdout-30, scaled to the blinded set composition (261 compounds: 32 inactive, 171 moderate, 58 potent):

| Region | n (blinded) | Avg Δ|error| per compound vs pp50 | Total Δ|error| |
|---|---|---|---|
| Inactive <4.0 | 32 | −0.003 | −0.107 |
| **Moderate 4–5.5** | **171** | **−0.026** | **−4.487** |
| Potent >5.5 | 58 | +0.013 | +0.732 |
| **Net** | **261** | | **−3.862** |

The 171 moderate compounds (65% of the blinded set) benefit by 0.026 absolute error units each on average. This 4.5-unit total saving dwarfs the combined inactive and potent cost of 0.625 units. The expected RAE improvement over pure pp50 is approximately **−0.025** on the blinded set, consistent with the verified holdout-30 improvement (−0.017 RAE).

At 10% UniMol weight, the inactive bias contribution is diluted to +0.046 per inactive compound — small enough that the moderate-region gains from the 3D transformer more than compensate.

### Final submission

**`submission_blend_751510.csv`** — 75% pp50 + 15% p13d + 10% UniMol

| Property | Value |
|---|---|
| Blend | 75% v4_4_aug2_p50 + 15% v4_13d_aug2 + 10% UniMol aug2 |
| Calibration | None (raw blend) |
| Full test set range | [2.295, 6.067] |
| Full test set mean | 4.796 |
| Full test set std | 0.810 |
| Holdout-30 RAE | **0.4471** |
| Blinded Set 2 compounds | 261 of 513 |

---

## Conclusion

### Phase 1

The Phase 1 submission achieved **MAE 0.4468, RAE 0.5606, Rank 39** on 513 blind test compounds using a 3-model ensemble of Chemprop D-MPNN and two UniMol fine-tuned models — entirely with public training data and open-source tools. The key Phase 1 lesson: OOF cross-validation is an unreliable proxy for generalisation in this analog-expansion design. Every technique that improved OOF degraded leaderboard performance.

### Phase 2 — Refinement

After the 252 Set 1 labels were unblinded, analysis revealed that 22% of test compounds (pEC50 < 4.0 inactives) drove 60% of total RAE through systematic over-prediction. This motivated the Phase 2 architectural response: MultitaskMPNN with an asymmetric classification head (v4_13d) to discriminate inactives without compressing the potency ceiling. The intermediate 3-way ensemble reached **RAE 0.5298** on the 252 unblinded compounds — a 0.029 improvement over Phase 1.

### Phase 2 — Final Submission

Clean retraining (deduplicated dataset, 30-compound holdout excluded from training) with three architecturally distinct models and a fine-grained blend search produced the final submission. The progression of holdout-30 RAE across the Phase 2 aug2 development:

| Submission | Holdout-30 RAE | Notes |
|---|---|---|
| First aug2 ensemble (50/25/25) | 0.4811 | Baseline after clean retraining |
| v2 (60/36/4 — Chemprop only) | 0.4499 | Strong ChemProp ensemble, no 3D signal |
| **Final: submission_blend_751510.csv** | **0.4471** | 75% pp50 + 15% p13d + 10% UniMol |

The improvement from v2 to the final blend (−0.0028 holdout-30 RAE, expected −0.025 on blinded 261) came from two insights confirmed by direct measurement: first, that p13d's joint objective makes it a weaker regressor than pp50 in every region, so its weight should fall from 36% to 15%; second, that UniMol's 3D geometric representation provides genuine complementary signal in the moderate activity range — the dominant region of the blinded test set — that more than offsets its tendency to compress extreme predictions.

The irreducible error floor is set by measurement noise: high-uncertainty compounds (pEC50 std error > 0.3) have RAE approximately 4× higher than low-uncertainty compounds, a limit no model architecture can fully overcome.

---

## References & Resources

- **Challenge:** [OpenADMET PXR Challenge HuggingFace Space](https://huggingface.co/spaces/openadmet/pxr-challenge)
- **Data:** [HuggingFace dataset: openadmet/pxr-challenge-train-test](https://huggingface.co/datasets/openadmet/pxr-challenge-train-test)
- **Tutorial:** [OpenADMET PXR Challenge Tutorial (GitHub)](https://github.com/OpenADMET/PXR-Challenge-Tutorial)
- **Chemprop:** [github.com/chemprop/chemprop](https://github.com/chemprop/chemprop) · [Heid et al., JCIM 2024](https://doi.org/10.1021/acs.jcim.3c01250)
- **UniMol:** [github.com/deepmodeling/Uni-Mol](https://github.com/deepmodeling/Uni-Mol) · [Zhou et al., ICLR 2023](https://openreview.net/forum?id=6K2RM6wVqKu)
- **RDKit:** [www.rdkit.org](https://www.rdkit.org)

---

## Repo Contents

| File / Folder | Description |
|---|---|
| `train_pec50_pxr_v4_4.py` | Chemprop D-MPNN training script (pp50 / p44 models) |
| `train_pec50_pxr_v4_13d.py` | MultitaskMPNN with asymmetric BCE head (p13d model) |
| `train_pec50_pxr_v4_13f.py` | Steeper tail-loss variant (not used in final blend) |
| `unimol_kaggle_aug2_8fold.ipynb` | UniMol aug2 training + dual inference (Kaggle) |
| `unimol_kaggle_aug2_inference_only.ipynb` | UniMol inference-only notebook (uses saved checkpoints) |
| `models_pxr_v4_4_aug2_p50/` | pp50 model checkpoints (fold_0.ckpt … fold_9.ckpt) |
| `models_pxr_v4_13d_aug2/` | p13d model checkpoints (fold_0.ckpt … fold_9.ckpt) |
| `models_pxr_v4_4_aug2/` | p44 model checkpoints |
| `train_unimol_aug_set1_holdout30_dedup.csv` | Clean aug2 training set (4,262 compounds) |
| `set1_holdout_30_stratified.csv` | 30-compound honest holdout (excluded from all aug2 training) |
| `submission_blend_751510.csv` | **Final submission** — 75% pp50 + 15% p13d + 10% UniMol (RAE 0.4471) |
| `submission_final_v2.csv` | Previous submission — 60% pp50 + 36% p13d + 4% p44 (RAE 0.4499) |
| `predictions_pxr_v4_4_aug2_p50.csv` | pp50 test predictions (513 compounds) |
| `predictions_pxr_v4_13d_aug2.csv` | p13d test predictions (513 compounds) |
| `predictions_unimol_aug2_test_raw.csv` | UniMol test predictions (513 compounds) |
| `predictions_pp50_holdout30_verify.csv` | pp50 holdout-30 predictions |
| `predictions_p13d_aug2_holdout30.csv` | p13d holdout-30 predictions |
| `predictions_unimol_aug2_holdout30_raw.csv` | UniMol holdout-30 predictions (with true labels and errors) |
