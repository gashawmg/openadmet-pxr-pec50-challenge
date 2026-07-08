// PXR pEC50 Blind Challenge — presentation builder (Windows-compatible)
// Run: npm install pptxgenjs && node build_pxr_deck_v4.js
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'Gashaw';
pres.title = 'PXR pEC50 Blind Challenge';
const C = {
  navy:"0A3D52",teal:"028090",mint:"02C39A",amber:"D97706",amberLt:"FEF3C7",
  red:"DC2626",redLt:"FEE2E2",slate:"64748B",lightBg:"F4FAFD",cardBg:"EBF6FA",
  white:"FFFFFF",lightGray:"E2E8F0",darkSlate:"1E3A4A",
};
const mkSh=()=>({type:"outer",blur:8,offset:2,angle:45,color:"000000",opacity:0.10});
const mkShC=()=>({type:"outer",blur:5,offset:1,angle:90,color:"028090",opacity:0.07});
function addHdr(s,tag,title,tagColor){
  s.addShape(pres.shapes.RECTANGLE,{x:0,y:0,w:10,h:0.55,fill:{color:C.navy},line:{color:C.navy,width:0}});
  s.addText(tag,{x:0.45,y:0,w:3.2,h:0.55,fontSize:9,bold:true,color:tagColor||C.mint,fontFace:"Calibri",charSpacing:4,valign:"middle",margin:0});
  s.addText(title,{x:0.45,y:0,w:9.15,h:0.55,fontSize:21,bold:true,color:C.white,fontFace:"Trebuchet MS",align:"right",valign:"middle",margin:0});
}
const ls=()=>{const s=pres.addSlide();s.background={color:C.white};return s;};
const ss=()=>{const s=pres.addSlide();s.background={color:C.lightBg};return s;};
const ds=()=>{const s=pres.addSlide();s.background={color:C.navy};return s;};

// SLIDE 1 — Title
{const s=ds();
s.addText("Predicting PXR Induction Potency",{x:0.65,y:0.7,w:8.7,h:1.05,fontSize:38,bold:true,color:C.white,fontFace:"Trebuchet MS",align:"left",margin:0});
s.addText("OpenADMET Blind Challenge  ·  Phase 1 & Phase 2  ·  June 2026",{x:0.65,y:1.82,w:8.7,h:0.42,fontSize:16,color:"88C8DC",fontFace:"Calibri",align:"left",margin:0});
s.addShape(pres.shapes.LINE,{x:0.65,y:2.38,w:3.8,h:0,line:{color:C.mint,width:2}});
const cards=[{lbl:"OpenADMET Standing",val:"Tier 1",sub:"Activity track, top tier"},{lbl:"Phase 1 → Phase 2",val:"#39 → T1",sub:"27-rank improvement"},{lbl:"Final Blend",val:"75/15/10",sub:"pp50 / p13d / UniMol"},{lbl:"Tools",val:"Open-source",sub:"Chemprop · UniMol · RDKit"}];
const cx=[0.65,2.88,5.11,7.34];
cards.forEach((c,i)=>{
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:cx[i],y:2.72,w:2.1,h:1.2,fill:{color:"0D4F6B"},rectRadius:0.07,line:{color:C.teal,width:1}});
  s.addText(c.val,{x:cx[i],y:2.78,w:2.1,h:0.62,fontSize:20,bold:true,color:C.mint,fontFace:"Trebuchet MS",align:"center",valign:"middle",margin:0});
  s.addText(c.lbl,{x:cx[i],y:3.38,w:2.1,h:0.22,fontSize:9,bold:true,color:"88C8DC",fontFace:"Calibri",align:"center",margin:0});
  s.addText(c.sub,{x:cx[i],y:3.59,w:2.1,h:0.2,fontSize:8,color:"4A7A90",fontFace:"Calibri",align:"center",margin:0});
});
s.addText("Gashaw  ·  June 2026  ·  Open-source: Chemprop, UniMol, RDKit",{x:0,y:5.27,w:10,h:0.3,fontSize:8.5,color:"3A6A80",fontFace:"Calibri",align:"center",margin:0});
s.addNotes("Title: PXR pEC50 prediction, OpenADMET blind challenge. Official Tier 1, activity track (43-entry top tier, statistically indistinguishable from rank #1). Phase 1 rank 39. 3-model ensemble, all open-source.");}

// SLIDE 2 — Biology & Challenge
{const s=ls();
addHdr(s,"THE CHALLENGE","PXR — Why This Problem Matters");
s.addText("Pregnane X Receptor (PXR)",{x:0.4,y:0.72,w:4.5,h:0.38,fontSize:14,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
const bio=[
  {title:"Drug-Drug Interactions",body:"PXR activation upregulates CYP3A4 — responsible for ~50% of all drug metabolism. Co-administered drugs may fall below therapeutic thresholds.",col:C.teal},
  {title:"Hepatotoxicity",body:"Elevated CYP3A4 flux generates reactive metabolic intermediates that can directly damage hepatocytes.",col:C.teal},
  {title:"Chemoresistance",body:"PXR-expressing tumours use enhanced CYP3A4 to accelerate clearance of oncology agents, reducing efficacy.",col:C.teal},
];
bio.forEach((b,i)=>{const y=1.2+i*1.27;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.4,y,w:4.5,h:1.12,fill:{color:C.cardBg},rectRadius:0.06,shadow:mkShC(),line:{color:C.lightGray,width:0.5}});
  s.addText(b.title,{x:0.6,y:y+0.1,w:3.7,h:0.3,fontSize:12,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
  s.addText(b.body,{x:0.6,y:y+0.46,w:4.1,h:0.6,fontSize:10,color:C.slate,fontFace:"Calibri",margin:0});
});
s.addText("Challenge Structure",{x:5.15,y:0.72,w:4.5,h:0.38,fontSize:14,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.15,y:1.2,w:4.5,h:1.12,fill:{color:C.cardBg},rectRadius:0.06,shadow:mkShC(),line:{color:C.lightGray,width:0.5}});
s.addText("Assay Design",{x:5.35,y:1.3,w:4.1,h:0.26,fontSize:11,bold:true,color:C.teal,fontFace:"Trebuchet MS",margin:0});
s.addText("Single-protocol cell-based reporter assay. 11,000+ compounds screened. Paired counter-screen removes non-specific activators. 63 selective hits → Enamine analog expansion → 513 blind test compounds.",{x:5.35,y:1.58,w:4.1,h:0.7,fontSize:10,color:C.slate,fontFace:"Calibri",margin:0});
const phases=[{tag:"PHASE 1",dates:"Apr 1 – May 25, 2026",desc:"Blind prediction for all 513 compounds. Live leaderboard.",color:C.teal},{tag:"PHASE 2",dates:"May 26 – Jul 1, 2026",desc:"253 Set 1 labels unblinded. Refine predictions for 260 blinded Set 2.",color:C.mint}];
phases.forEach((p,i)=>{const y=2.47+i*1.28;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.15,y,w:4.5,h:1.12,fill:{color:C.cardBg},rectRadius:0.06,shadow:mkShC(),line:{color:p.color,width:1.5}});
  s.addText(p.tag,{x:5.35,y:y+0.1,w:2.5,h:0.27,fontSize:12,bold:true,color:p.color,fontFace:"Trebuchet MS",charSpacing:1.5,margin:0});
  s.addText(p.dates,{x:5.35,y:y+0.38,w:4.1,h:0.22,fontSize:10,italic:true,color:C.slate,fontFace:"Calibri",margin:0});
  s.addText(p.desc,{x:5.35,y:y+0.62,w:4.1,h:0.44,fontSize:10,color:C.darkSlate,fontFace:"Calibri",margin:0});
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.15,y:5.08,w:4.5,h:0.38,fill:{color:C.navy},rectRadius:0.05,line:{color:C.navy,width:0}});
s.addText("Metric: RAE = Σ|y−ŷ| / Σ|y−ȳ|  (lower is better)",{x:5.15,y:5.08,w:4.5,h:0.38,fontSize:10,bold:true,color:C.mint,fontFace:"Calibri",align:"center",valign:"middle",margin:0});
s.addNotes("PXR biology and challenge setup. Three serious consequences of PXR activation. Two-phase design with RAE metric.");}

// SLIDE 3 — Data
{const s=ss();
addHdr(s,"DATA","Finding the Right Training Set");
s.addText("Screening Funnel",{x:0.4,y:0.7,w:4.5,h:0.32,fontSize:13,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
const funnel=[
  {t:"Primary Screen — 11,362 compounds @ 10/30 µM  ·  Hit rate ~17%",c:C.cardBg,bc:C.teal},
  {t:"Dose-response — 4,325 compounds, 8-point EC50 fitting",c:C.cardBg,bc:C.teal},
  {t:"~211 active hits (pEC50 ≥ 6)  →  counter-screen filter",c:C.cardBg,bc:C.teal},
  {t:"63 selective hits  →  Enamine analog expansion  →  513 test compounds",c:"D6F5ED",bc:C.mint},
];
funnel.forEach((f,i)=>{const w=4.5-i*0.14,x=0.4+i*0.07,y=1.1+i*0.78;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w,h:0.6,fill:{color:f.c},rectRadius:0.05,line:{color:f.bc,width:1}});
  s.addText(f.t,{x:x+0.15,y,w:w-0.3,h:0.6,fontSize:9.5,color:C.darkSlate,fontFace:"Calibri",valign:"middle",margin:0});
  if(i<3)s.addShape(pres.shapes.LINE,{x:x+w/2,y:y+0.6,w:0,h:0.18,line:{color:C.slate,width:1.2,dashType:"dash"}});
});
s.addText("Training Set Selection — Leaderboard MAE by Filter",{x:5.1,y:0.7,w:4.55,h:0.32,fontSize:13,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
s.addChart(pres.charts.BAR,[{name:"LB MAE",labels:["delta>1.5\n(2,948)","delta>0 ✓\n(3,743)","+ChEMBL\n(3,780)","Relaxed\n(4,054)","Unfiltered\n(4,139)"],values:[0.4794,0.4622,0.5051,0.4809,0.5095]}],{
  x:5.0,y:1.05,w:4.65,h:3.2,barDir:"bar",
  chartColors:["9DC5D3","028090","DC2626","E07B4F","E07B4F"],
  chartArea:{fill:{color:C.lightBg},roundedCorners:true},
  catAxisLabelColor:C.navy,valAxisLabelColor:C.slate,
  valGridLine:{color:C.lightGray,size:0.5},catGridLine:{style:"none"},
  showValue:true,dataLabelColor:C.navy,dataLabelFormatCode:"0.0000",valAxisMinVal:0.42,valAxisMaxVal:0.54,showLegend:false,
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.4,y:4.28,w:9.2,h:0.92,fill:{color:"D6F5ED"},rectRadius:0.06,line:{color:C.mint,width:1.2}});
s.addText("Key Finding:",{x:0.65,y:4.36,w:1.45,h:0.75,fontSize:11,bold:true,color:C.navy,fontFace:"Trebuchet MS",valign:"middle",margin:0});
s.addText("clean_train2 (3,743 compounds, selectivity delta > 0) was the optimal Phase 1 training set. Adding ANY compounds beyond this — external ChEMBL data (150+ assay protocols), relaxed filters, or hand-picked outliers — degraded leaderboard performance in every experiment.",{x:2.1,y:4.38,w:7.2,h:0.74,fontSize:10,color:C.darkSlate,fontFace:"Calibri",valign:"middle",margin:0});
s.addNotes("Training set selection: delta>0 filter (3,743 cpds) is optimal. External data hurts due to assay heterogeneity.");}

// SLIDE 4 — Model Progression
{const s=ls();
addHdr(s,"PHASE 1","Model Development Journey");
const models=[
  {tag:"STARTING POINT",tagC:C.slate,name:"Classical ML",arch:"LightGBM + HistGB + SVR meta-learner\nRDKit descriptors + ECFP4 fingerprints",m1:"MAE: 0.5196",m2:"Spearman: 0.7258",insight:"Hit a ceiling — 16% MAE gap vs. final ensemble established the need for graph neural networks.",border:C.slate},
  {tag:"KEY IMPROVEMENT",tagC:C.teal,name:"Chemprop D-MPNN",arch:"Directed message-passing neural network\n+ 61 PXR-specific RDKit descriptors\n10-fold activity-stratified scaffold CV",m1:"MAE: 0.4622  (↑0 11.4%)",m2:"Spearman: 0.8137  (↑ 12%)",insight:"61 PXR descriptors alone cut MAE 9.4%. Expanded dataset (2,948→3,743): −3.6% more. Scaffold CV > random CV.",border:C.teal},
  {tag:"BEST SINGLE MODEL",tagC:C.mint,name:"UniMol 3D Transformer",arch:"84M param SE(3)-invariant transformer\nPre-trained: 200M molecular conformers\nETKDG v3 3D input · 8-fold scaffold CV",m1:"MAE: 0.4615  (Rank 33)",m2:"Spearman: 0.8306",insight:"3D conformer geometry captures inter-atomic distances and steric contacts invisible to 2D graph networks.",border:C.mint},
];
models.forEach((m,i)=>{const x=0.32+i*3.18;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:0.65,w:3.0,h:4.65,fill:{color:C.cardBg},rectRadius:0.08,shadow:mkSh(),line:{color:m.border,width:1.5}});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x+0.1,y:0.78,w:2.8,h:0.28,fill:{color:m.tagC},rectRadius:0.04,line:{color:m.tagC,width:0}});
  s.addText(m.tag,{x:x+0.1,y:0.78,w:2.8,h:0.28,fontSize:8,bold:true,color:C.white,fontFace:"Calibri",align:"center",charSpacing:1,valign:"middle",margin:0});
  s.addText(m.name,{x:x+0.12,y:1.14,w:2.75,h:0.5,fontSize:15,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
  s.addText("Architecture",{x:x+0.12,y:1.7,w:2.75,h:0.2,fontSize:8.5,bold:true,color:m.border,fontFace:"Calibri",charSpacing:1,margin:0});
  s.addText(m.arch,{x:x+0.12,y:1.92,w:2.75,h:0.85,fontSize:9.5,color:C.darkSlate,fontFace:"Calibri",margin:0});
  s.addShape(pres.shapes.LINE,{x:x+0.12,y:2.82,w:2.75,h:0,line:{color:C.lightGray,width:0.5}});
  s.addText("Performance",{x:x+0.12,y:2.92,w:2.75,h:0.2,fontSize:8.5,bold:true,color:m.border,fontFace:"Calibri",charSpacing:1,margin:0});
  s.addText(m.m1,{x:x+0.12,y:3.14,w:2.75,h:0.26,fontSize:11,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
  s.addText(m.m2,{x:x+0.12,y:3.4,w:2.75,h:0.26,fontSize:11,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
  s.addShape(pres.shapes.LINE,{x:x+0.12,y:3.72,w:2.75,h:0,line:{color:C.lightGray,width:0.5}});
  s.addText("Key insight",{x:x+0.12,y:3.82,w:2.75,h:0.2,fontSize:8.5,bold:true,color:m.border,fontFace:"Calibri",charSpacing:1,margin:0});
  s.addText(m.insight,{x:x+0.12,y:4.04,w:2.75,h:1.2,fontSize:9.5,color:C.slate,fontFace:"Calibri",margin:0});
});
s.addNotes("Model progression: Classical ML baseline, Chemprop D-MPNN with PXR descriptors, UniMol 3D transformer.");}

// SLIDE 5 — What Failed
{const s=ss();
addHdr(s,"PHASE 1 LESSONS","What Did Not Work — and Why",C.amber);
s.addShape(pres.shapes.RECTANGLE,{x:0.3,y:0.66,w:9.4,h:0.36,fill:{color:C.navy},line:{color:C.navy,width:0}});
[["Experiment",0.35,3.2],["OOF MAE",3.62,1.0],["LB MAE",4.68,0.9],["Rank",5.64,0.65],["Lesson",6.35,3.3]].forEach(([h,x,w])=>{
  s.addText(h,{x,y:0.66,w,h:0.36,fontSize:9.5,bold:true,color:C.mint,fontFace:"Calibri",valign:"middle",margin:3});
});
const rows=[
  {exp:"v4_3_3 MSE baseline ✓ (Phase 1 ceiling)",oof:"0.4420",lb:"0.4622",rank:"36",lesson:"Use as floor — do not sacrifice this",good:true},
  {exp:"MAE / L1 loss instead of MSE",oof:"0.4369 ↓",lb:"0.4674 ↑",rank:"62",lesson:"Better OOF, worse LB — MAE loss median-pulls",good:false},
  {exp:"SC binary pre-training then fine-tune",oof:"0.4338 ↓↓",lb:"0.4943 ↑↑",rank:"108",lesson:"Best OOF ever = worst LB ever. Binary labels cannot teach pEC50 discrimination",good:false},
  {exp:"+ 37 ChEMBL compounds (external)",oof:"0.4463",lb:"0.5051 ↑",rank:"80",lesson:"150+ assay protocols → systematic offsets learned as signal",good:false},
  {exp:"Hand-picked +5 high-potency compounds",oof:"0.4396 ↓",lb:"0.4751 ↑",rank:"67",lesson:"OOF/LB gap = 0.036 — largest observed in any experiment",good:false},
  {exp:"Piecewise stretch post-processing",oof:"—",lb:"always ↑",rank:"—",lesson:"Compression is distributional, not calibration error — cannot be fixed by PCHIP",good:false},
];
rows.forEach((r,i)=>{const y=1.06+i*0.58,bg=r.good?"D6F5ED":(i%2===0?C.white:C.lightBg);
  s.addShape(pres.shapes.RECTANGLE,{x:0.3,y,w:9.4,h:0.54,fill:{color:bg},line:{color:C.lightGray,width:0.5}});
  s.addText(r.exp,{x:0.38,y:y+0.06,w:3.15,h:0.44,fontSize:9.5,bold:r.good,color:r.good?C.navy:C.darkSlate,fontFace:"Calibri",valign:"middle",margin:0});
  s.addText(r.oof,{x:3.64,y:y+0.06,w:0.96,h:0.44,fontSize:9.5,color:r.oof.includes("↓")?C.teal:C.slate,fontFace:"Calibri",valign:"middle",margin:0});
  s.addText(r.lb,{x:4.7,y:y+0.06,w:0.86,h:0.44,fontSize:9.5,bold:r.lb.includes("↑"),color:r.lb.includes("↑")?C.red:(r.good?C.mint:C.slate),fontFace:"Calibri",valign:"middle",margin:0});
  s.addText(r.rank,{x:5.66,y:y+0.06,w:0.62,h:0.44,fontSize:9.5,color:C.darkSlate,fontFace:"Calibri",valign:"middle",margin:0});
  s.addText(r.lesson,{x:6.37,y:y+0.06,w:3.25,h:0.44,fontSize:9,italic:true,color:C.slate,fontFace:"Calibri",valign:"middle",margin:0});
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.3,y:4.62,w:9.4,h:0.75,fill:{color:C.amberLt},rectRadius:0.06,line:{color:C.amber,width:1.5}});
s.addText("Critical insight:",{x:0.55,y:4.7,w:1.6,h:0.56,fontSize:10.5,bold:true,color:"78350F",fontFace:"Trebuchet MS",valign:"top",margin:0});
s.addText("OOF cross-validation is an unreliable proxy for leaderboard performance in this analog-expansion design. Every technique that lowered OOF MAE degraded leaderboard MAE. The SC pre-training — best OOF ever, worst LB ever (rank 108) — is the clearest proof. Treat the blind test as the only real signal.",{x:2.1,y:4.7,w:7.4,h:0.65,fontSize:10,color:"78350F",fontFace:"Calibri",margin:0});
s.addNotes("OOF CV is unreliable here. SC pre-training: best OOF = worst LB. External data, MAE loss, calibration all hurt the leaderboard.");}

// SLIDE 6 — Phase 1 Results
{const s=ls();
addHdr(s,"PHASE 1 RESULTS","Final Ensemble & Leaderboard Performance");
s.addText("Phase 1 Ensemble",{x:0.4,y:0.7,w:4.55,h:0.32,fontSize:13,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
const comps=[
  {lbl:"UniMol  8-fold  (Kaggle T4×2)",wt:"35%",sub:"3,743 compounds · LB MAE 0.4615",c:C.teal},
  {lbl:"Chemprop  10-fold scaffold CV",wt:"35%",sub:"3,743 compounds · LB MAE 0.4622",c:C.teal},
  {lbl:"UniMol  7-fold  (subset)",wt:"30%",sub:"1,948 compounds · diverse error profile",c:"4A90A0"},
];
comps.forEach((comp,i)=>{const y=1.1+i*1.02;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.4,y,w:4.05,h:0.87,fill:{color:C.cardBg},rectRadius:0.06,shadow:mkSh(),line:{color:comp.c,width:1}});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:3.78,y:y+0.2,w:0.68,h:0.46,fill:{color:comp.c},rectRadius:0.05,line:{color:comp.c,width:0}});
  s.addText(comp.wt,{x:3.78,y:y+0.2,w:0.68,h:0.46,fontSize:15,bold:true,color:C.white,fontFace:"Trebuchet MS",align:"center",valign:"middle",margin:0});
  s.addText(comp.lbl,{x:0.6,y:y+0.1,w:3.1,h:0.3,fontSize:11.5,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
  s.addText(comp.sub,{x:0.6,y:y+0.48,w:3.1,h:0.24,fontSize:9.5,italic:true,color:C.slate,fontFace:"Calibri",margin:0});
});
s.addShape(pres.shapes.LINE,{x:4.5,y:2.65,w:0.55,h:0,line:{color:C.teal,width:2.5}});
s.addText("Final Results — 513 Blind Compounds",{x:5.2,y:0.7,w:4.45,h:0.32,fontSize:13,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
const res=[{lbl:"MAE",val:"0.4468",hi:false},{lbl:"RAE",val:"0.5606",hi:false},{lbl:"R²",val:"0.5459",hi:false},{lbl:"Spearman ρ",val:"0.8463",hi:false},{lbl:"Rank",val:"#39",hi:true}];
res.forEach((r,i)=>{const x=5.2+(i%3)*1.6,y=1.1+Math.floor(i/3)*1.1;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w:1.48,h:0.93,fill:{color:r.hi?"D6F5ED":C.cardBg},rectRadius:0.06,shadow:mkSh(),line:{color:r.hi?C.mint:C.lightGray,width:r.hi?1.5:0.5}});
  s.addText(r.val,{x,y:y+0.1,w:1.48,h:0.52,fontSize:r.hi?22:19,bold:true,color:r.hi?C.teal:C.navy,fontFace:"Trebuchet MS",align:"center",valign:"middle",margin:0});
  s.addText(r.lbl,{x,y:y+0.65,w:1.48,h:0.2,fontSize:9,color:C.slate,fontFace:"Calibri",align:"center",margin:0});
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.2,y:4.05,w:4.45,h:1.2,fill:{color:C.amberLt},rectRadius:0.06,line:{color:C.amber,width:1}});
s.addText("Limitation identified in Phase 2:",{x:5.4,y:4.14,w:4.1,h:0.26,fontSize:10,bold:true,color:"78350F",fontFace:"Trebuchet MS",margin:0});
s.addText("Predictions were range-compressed (std=0.567 on 260 blinded compounds). Only 19 of 260 blinded compounds predicted as inactive (<4.0); zero predicted above pEC50 6.0. Phase 2 would address this by training on Set 1 labels including high-potency compounds.",{x:5.4,y:4.42,w:4.1,h:0.78,fontSize:9.5,color:"78350F",fontFace:"Calibri",margin:0});
s.addNotes("Phase 1 result: Rank 39, MAE 0.4468. Limitation: range-compressed predictions, missing potent extremes and inactives.");}

// SLIDE 7 — Phase 2 Diagnosis
{const s=ss();
addHdr(s,"PHASE 2 ANALYSIS","What the Unblinded Labels Revealed",C.amber);
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.4,y:0.72,w:4.5,h:2.25,fill:{color:C.redLt},rectRadius:0.08,shadow:mkSh(),line:{color:C.red,width:1.5}});
s.addText("22%",{x:0.4,y:0.82,w:4.5,h:1.0,fontSize:66,bold:true,color:C.red,fontFace:"Trebuchet MS",align:"center",valign:"middle",margin:0});
s.addText("of test compounds (pEC50 < 4.0, inactives)",{x:0.6,y:1.86,w:4.1,h:0.27,fontSize:11,color:"7F1D1D",fontFace:"Calibri",align:"center",margin:0});
s.addText("drove  53%  of total RAE",{x:0.6,y:2.14,w:4.1,h:0.33,fontSize:15,bold:true,color:C.red,fontFace:"Trebuchet MS",align:"center",margin:0});
s.addText("Average over-prediction: +0.99 pEC50 units",{x:0.6,y:2.5,w:4.1,h:0.28,fontSize:10.5,italic:true,color:"7F1D1D",fontFace:"Calibri",align:"center",margin:0});
s.addChart(pres.charts.BAR,[
  {name:"% of compounds",labels:["Inactive\n(<4.0)","Moderate\n(4-5.5)","Potent\n(>5.5)"],values:[22,63,15]},
  {name:"% of RAE",labels:["Inactive\n(<4.0)","Moderate\n(4-5.5)","Potent\n(>5.5)"],values:[53,33,14]},
],{x:5.0,y:0.72,w:4.65,h:2.55,barDir:"col",chartColors:["DC2626","028090"],chartArea:{fill:{color:C.lightBg},roundedCorners:true},catAxisLabelColor:C.navy,valAxisLabelColor:C.slate,valGridLine:{color:C.lightGray,size:0.5},catGridLine:{style:"none"},showValue:true,dataLabelColor:C.navy,dataLabelFormatCode:"0",showLegend:true,legendPos:"t",legendColor:C.navy});
s.addText("Root Cause & Phase 2 Response",{x:0.4,y:3.1,w:9.2,h:0.32,fontSize:13,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
const resp=[
  {title:"Root Cause",body:"Inactives share 2D scaffold topology with active training compounds (ECFP4 Tanimoto ≥ 0.5). A pure MSE regression loss has no mechanism to discriminate them — they look 'active' to the model.",color:C.red},
  {title:"Architectural Fix",body:"MultitaskMPNN with asymmetric BCE classification head trained simultaneously with regression. Penalises only false positives (inactives called active) — preserving the potency ceiling.",color:C.teal},
  {title:"Data Fix",body:"Added 300 confirmed sc_inactives (pseudo-pEC50=2.0, 3× weight in Chemprop) to anchor the low end. Added 244 secondary screen hits (pEC50≥5.5) to anchor the high end.",color:C.mint},
];
resp.forEach((r,i)=>{
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.4+i*3.17,y:3.5,w:3.0,h:1.7,fill:{color:C.cardBg},rectRadius:0.06,shadow:mkShC(),line:{color:r.color,width:1.5}});
  s.addText(r.title,{x:0.6+i*3.17,y:3.6,w:2.6,h:0.28,fontSize:11,bold:true,color:r.color,fontFace:"Trebuchet MS",margin:0});
  s.addText(r.body,{x:0.6+i*3.17,y:3.92,w:2.6,h:1.22,fontSize:9.5,color:C.darkSlate,fontFace:"Calibri",margin:0});
});
s.addNotes("Diagnosis: 22% of compounds (inactives) drove 53% of RAE (measured on unblinded Set 1). Two fixes: asymmetric BCE architecture and data augmentation with confirmed inactives and high-potency hits.");}

// SLIDE 8 — Asymmetric BCE
{const s=ls();
addHdr(s,"PHASE 2 ARCHITECTURE","MultitaskMPNN with Asymmetric BCE Head");
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.35,y:0.82,w:1.8,h:0.65,fill:{color:C.cardBg},rectRadius:0.06,line:{color:C.slate,width:1}});
s.addText("Molecule\n(SMILES)",{x:0.35,y:0.82,w:1.8,h:0.65,fontSize:10,color:C.navy,fontFace:"Calibri",align:"center",valign:"middle",margin:0});
s.addShape(pres.shapes.LINE,{x:2.15,y:1.145,w:0.45,h:0,line:{color:C.slate,width:1.5}});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:2.6,y:0.72,w:2.35,h:0.85,fill:{color:"D6EEF4"},rectRadius:0.06,line:{color:C.teal,width:1.5}});
s.addText("BondMessagePassing\n(D-MPNN, 6 steps)\n768-dim hidden",{x:2.6,y:0.72,w:2.35,h:0.85,fontSize:9.5,bold:true,color:C.teal,fontFace:"Calibri",align:"center",valign:"middle",margin:0});
s.addShape(pres.shapes.LINE,{x:4.95,y:1.145,w:0.45,h:0,line:{color:C.slate,width:1.5}});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.4,y:0.72,w:2.1,h:0.85,fill:{color:"D6EEF4"},rectRadius:0.06,line:{color:C.teal,width:1.5}});
s.addText("Shared MLP trunk\n(4 layers, dropout 0.2)",{x:5.4,y:0.72,w:2.1,h:0.85,fontSize:9.5,bold:true,color:C.teal,fontFace:"Calibri",align:"center",valign:"middle",margin:0});
s.addShape(pres.shapes.LINE,{x:7.5,y:0.88,w:0.28,h:0,line:{color:C.slate,width:1}});
s.addShape(pres.shapes.LINE,{x:7.78,y:0.88,w:0,h:0.54,line:{color:C.slate,width:1}});
s.addShape(pres.shapes.LINE,{x:7.78,y:0.88,w:0.32,h:0,line:{color:C.mint,width:1.2}});
s.addShape(pres.shapes.LINE,{x:7.78,y:1.42,w:0.32,h:0,line:{color:C.red,width:1.2}});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:8.1,y:0.67,w:1.55,h:0.52,fill:{color:"D6F5ED"},rectRadius:0.05,line:{color:C.mint,width:1}});
s.addText("reg_head → pEC50\n(MSE, all compounds)",{x:8.1,y:0.67,w:1.55,h:0.52,fontSize:8,bold:true,color:C.navy,fontFace:"Calibri",align:"center",valign:"middle",margin:0});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:8.1,y:1.22,w:1.55,h:0.52,fill:{color:C.redLt},rectRadius:0.05,line:{color:C.red,width:1}});
s.addText("clf_head → is_active\n(asymmetric BCE)",{x:8.1,y:1.22,w:1.55,h:0.52,fontSize:8,bold:true,color:C.navy,fontFace:"Calibri",align:"center",valign:"middle",margin:0});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.35,y:1.77,w:9.3,h:0.75,fill:{color:C.cardBg},rectRadius:0.06,line:{color:C.teal,width:1}});
s.addText("Joint Loss:",{x:0.55,y:1.83,w:1.4,h:0.62,fontSize:11,bold:true,color:C.navy,fontFace:"Trebuchet MS",valign:"middle",margin:0});
s.addText("total_loss  =  0.8 × MSE(reg_head, pEC50)  +  0.2 × BCE_asymmetric(clf_head, is_active)",{x:1.95,y:1.84,w:7.5,h:0.62,fontSize:13,bold:true,color:C.teal,fontFace:"Calibri",valign:"middle",margin:0});
s.addText("Why Asymmetric?",{x:0.35,y:2.68,w:9.3,h:0.32,fontSize:13,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
const asym=[
  {title:"Symmetric BCE — the problem",body:"Penalises both false positives (inactive→active) AND false negatives (active→inactive). The false-negative penalty drags ALL active embeddings downward — compressing the potency ceiling and worsening high-pEC50 predictions.",color:C.red,bg:C.redLt},
  {title:"Asymmetric BCE — the fix",body:"Classification loss computed ONLY for inactive compounds (pEC50 < 4.0). Active compounds contribute zero classification gradient. One explicit lesson: do not encode inactives like actives — without any pressure on the potent distribution.",color:C.mint,bg:"D6F5ED"},
];
asym.forEach((a,i)=>{
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.35+i*4.85,y:3.08,w:4.68,h:1.75,fill:{color:a.bg},rectRadius:0.07,shadow:mkShC(),line:{color:a.color,width:1.5}});
  s.addText(a.title,{x:0.55+i*4.85,y:3.17,w:4.28,h:0.3,fontSize:12,bold:true,color:a.color,fontFace:"Trebuchet MS",margin:0});
  s.addText(a.body,{x:0.55+i*4.85,y:3.52,w:4.28,h:1.25,fontSize:10,color:C.darkSlate,fontFace:"Calibri",margin:0});
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.35,y:4.93,w:9.3,h:0.4,fill:{color:"D6F5ED"},rectRadius:0.05,line:{color:C.mint,width:1}});
s.addText("Result: v4_13d asymmetric BCE achieved RAE 0.5636 vs 0.5755 (symmetric) · inactive bias reduced: +0.965 → +0.788 units",{x:0.55,y:4.93,w:9.0,h:0.4,fontSize:10,color:C.navy,fontFace:"Calibri",valign:"middle",margin:0});
s.addNotes("Asymmetric BCE: gradient only for inactive compounds. Symmetric BCE hurts potent predictions. This is the key Phase 2 architectural innovation.");}

// SLIDE 9 — Aug2
{const s=ss();
addHdr(s,"PHASE 2 — AUG2","Clean Retraining with Honest Holdout",C.amber);
s.addText("Aug2 Training Set Construction",{x:0.4,y:0.72,w:4.55,h:0.3,fontSize:13,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
const sources=[
  {lbl:"clean_train2.csv",n:"3,743",desc:"Phase 1 baseline (delta > 0)",c:C.teal},
  {lbl:"crude_nv_hi",n:"+244",desc:"Secondary hits pEC50 ≥ 5.5",c:C.mint},
  {lbl:"semi_nv",n:"+55",desc:"Semi-pure, purity-corrected",c:C.mint},
  {lbl:"Set 1 labels (222 of 253)",n:"+222",desc:"Unblinded analogs (30 held out)",c:C.amber},
  {lbl:"sc_inactives  (Chemprop only)",n:"+300",desc:"Pseudo-pEC50=2.0 · weight 3×",c:C.slate},
];
sources.forEach((src,i)=>{const y=1.1+i*0.65;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.4,y,w:4.55,h:0.55,fill:{color:C.white},rectRadius:0.05,line:{color:src.c,width:1}});
  s.addText(src.lbl,{x:0.6,y:y+0.03,w:2.1,h:0.5,fontSize:10.5,bold:true,color:C.navy,fontFace:"Calibri",valign:"middle",margin:0});
  s.addText(src.n,{x:2.72,y:y+0.03,w:0.62,h:0.5,fontSize:14,bold:true,color:src.c,fontFace:"Trebuchet MS",align:"center",valign:"middle",margin:0});
  s.addText(src.desc,{x:3.38,y:y+0.03,w:1.48,h:0.5,fontSize:9,italic:true,color:C.slate,fontFace:"Calibri",valign:"middle",margin:0});
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.4,y:4.45,w:4.55,h:0.55,fill:{color:C.navy},rectRadius:0.05,line:{color:C.navy,width:0}});
s.addText("Total: 4,262 compounds  (deduplicated · holdout-30 excluded)",{x:0.4,y:4.45,w:4.55,h:0.55,fontSize:11,bold:true,color:C.mint,fontFace:"Trebuchet MS",align:"center",valign:"middle",margin:0});
s.addText("Two Critical Fixes Before Training",{x:5.15,y:0.72,w:4.5,h:0.3,fontSize:13,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.15,y:1.1,w:4.5,h:1.32,fill:{color:C.amberLt},rectRadius:0.06,line:{color:C.amber,width:1.5}});
s.addText("1.  Data Leakage Fixed",{x:5.35,y:1.19,w:4.1,h:0.26,fontSize:11,bold:true,color:"78350F",fontFace:"Trebuchet MS",margin:0});
s.addText("First aug models included all 253 Set 1 labels in training — making holdout-30 RAE ~0.38 inflated and useless as a proxy. Fix: 30-compound stratified holdout completely excluded from all aug2 training.",{x:5.35,y:1.48,w:4.1,h:0.88,fontSize:10,color:"78350F",fontFace:"Calibri",margin:0});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.15,y:2.55,w:4.5,h:0.7,fill:{color:C.cardBg},rectRadius:0.06,line:{color:C.teal,width:1}});
s.addText("2.  Deduplication",{x:5.35,y:2.63,w:4.1,h:0.24,fontSize:11,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
s.addText("3 SMILES pairs had duplicate entries at different pEC50 values. Resolved by averaging → 4,265 → 4,262 rows.",{x:5.35,y:2.9,w:4.1,h:0.3,fontSize:10,color:C.slate,fontFace:"Calibri",margin:0});
s.addText("Aug2 Models — Holdout-30 RAE",{x:5.15,y:3.38,w:4.5,h:0.28,fontSize:12,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
s.addChart(pres.charts.BAR,[{name:"Holdout-30 RAE",labels:["UniMol aug2","p13d patience-25","p13d patience-50","p44 patience-25","pp50 patience-50 ★"],values:[0.5282,0.5463,0.5582,0.4646,0.4641]}],{x:5.1,y:3.7,w:4.6,h:1.6,barDir:"bar",chartColors:["028090","9DC5D3","B8D4DD","5DCAA5","02C39A"],chartArea:{fill:{color:C.lightBg},roundedCorners:true},catAxisLabelColor:C.navy,valAxisLabelColor:C.slate,valGridLine:{color:C.lightGray,size:0.5},catGridLine:{style:"none"},showValue:true,dataLabelColor:C.navy,dataLabelFormatCode:"0.0000",valAxisMinVal:0.43,valAxisMaxVal:0.58,showLegend:false});
s.addNotes("Two fixes: data leakage (exclude holdout-30) and deduplication. pp50 (patience=50) is best single model at 0.4641.");}

// SLIDE 10 — Three Models
{const s=ls();
addHdr(s,"FINAL BLEND","Three Models — Three Complementary Roles");
const m3=[
  {name:"pp50",full:"v4_4_aug2_p50",wt:"75%",rae:"0.4641",color:C.teal,ltColor:"D6EEF4",arch:"Chemprop D-MPNN · 10-fold scaffold CV · patience=50 · 61 PXR RDKit descriptors · 768-dim, 6 MPNN steps",prob:"General pEC50 regression across the full activity range. Strongest single predictor — carries dominant weight.",limit:"2D bond graph only — cannot directly access 3D conformer geometry (distances, angles, steric contacts)."},
  {name:"p13d",full:"v4_13d_aug2",wt:"15%",rae:"0.5463",color:C.amber,ltColor:C.amberLt,arch:"Chemprop MultitaskMPNN · shared D-MPNN trunk · parallel reg_head (MSE) + clf_head (asymmetric BCE) · same 768/6/4 config",prob:"Inactive over-prediction — dominant Phase 2 error mode. Explicit discriminative boundary for pEC50 < 4.0 without compressing potent predictions.",limit:"Joint loss splits gradient, making regression noisier than pp50 in all regions. Weight reduced from 36% (v2) to 15%."},
  {name:"UniMol",full:"aug2 · no sc_inactives",wt:"10%",rae:"0.5282",color:C.mint,ltColor:"D6F5ED",arch:"84M param SE(3)-invariant transformer · pre-trained 200M conformers · ETKDG v3 3D input · 8-fold scaffold CV on Kaggle T4×2",prob:"3D molecular geometry provides signal orthogonal to 2D graph. Most beneficial for the 65% moderate-activity compounds (pEC50 4-5.5) in the blinded test set.",limit:"Compressed output range. Over-predicts inactives +0.774 units on holdout-30. Diluted to 10% — bias contribution is only +0.046 per inactive."},
];
m3.forEach((m,i)=>{const x=0.28+i*3.25;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:0.65,w:3.12,h:4.72,fill:{color:C.white},rectRadius:0.08,shadow:mkSh(),line:{color:m.color,width:2}});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x+0.1,y:0.78,w:0.82,h:0.52,fill:{color:m.color},rectRadius:0.06,line:{color:m.color,width:0}});
  s.addText(m.wt,{x:x+0.1,y:0.78,w:0.82,h:0.52,fontSize:18,bold:true,color:C.white,fontFace:"Trebuchet MS",align:"center",valign:"middle",margin:0});
  s.addText(m.name,{x:x+1.04,y:0.83,w:2.0,h:0.42,fontSize:22,bold:true,color:m.color,fontFace:"Trebuchet MS",margin:0});
  s.addText(m.full,{x:x+0.12,y:1.35,w:2.88,h:0.2,fontSize:8.5,italic:true,color:C.slate,fontFace:"Calibri",margin:0});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:x+0.12,y:1.6,w:2.88,h:0.4,fill:{color:m.ltColor},rectRadius:0.04,line:{color:m.color,width:0.5}});
  s.addText("Holdout-30 RAE: "+m.rae,{x:x+0.12,y:1.6,w:2.88,h:0.4,fontSize:11,bold:true,color:C.navy,fontFace:"Trebuchet MS",align:"center",valign:"middle",margin:0});
  s.addText("Architecture",{x:x+0.12,y:2.08,w:2.88,h:0.2,fontSize:8,bold:true,color:m.color,fontFace:"Calibri",charSpacing:1,margin:0});
  s.addText(m.arch,{x:x+0.12,y:2.3,w:2.88,h:0.82,fontSize:9,color:C.darkSlate,fontFace:"Calibri",margin:0});
  s.addShape(pres.shapes.LINE,{x:x+0.12,y:3.15,w:2.88,h:0,line:{color:C.lightGray,width:0.5}});
  s.addText("Problem addressed",{x:x+0.12,y:3.23,w:2.88,h:0.2,fontSize:8,bold:true,color:m.color,fontFace:"Calibri",charSpacing:1,margin:0});
  s.addText(m.prob,{x:x+0.12,y:3.46,w:2.88,h:0.72,fontSize:9,color:C.darkSlate,fontFace:"Calibri",margin:0});
  s.addShape(pres.shapes.LINE,{x:x+0.12,y:4.22,w:2.88,h:0,line:{color:C.lightGray,width:0.5}});
  s.addText("Limitation",{x:x+0.12,y:4.3,w:2.88,h:0.2,fontSize:8,bold:true,color:C.slate,fontFace:"Calibri",charSpacing:1,margin:0});
  s.addText(m.limit,{x:x+0.12,y:4.52,w:2.88,h:0.8,fontSize:8.5,italic:true,color:C.slate,fontFace:"Calibri",margin:0});
});
s.addNotes("Three models: pp50 (general regression, 75%), p13d (inactive discrimination, 15%), UniMol (3D geometry, 10%).");}

// SLIDE 11 — Why 75/15/10
{const s=ss();
addHdr(s,"BLEND OPTIMIZATION","Why 75 / 15 / 10 is the Optimal Blend");
s.addChart(pres.charts.BAR,[{name:"Holdout-30 RAE",labels:["v2: 60/36/4","60/20/20","65/20/15","70/20/10","75/15/10 ★","80/10/10"],values:[0.4499,0.4523,0.4502,0.4481,0.4471,0.4475]}],{
  x:0.3,y:0.7,w:4.55,h:3.3,barDir:"bar",
  chartColors:["9DC5D3","E07B4F","9DC5D3","5DCAA5","02C39A","5DCAA5"],
  chartArea:{fill:{color:C.white},roundedCorners:true},catAxisLabelColor:C.navy,valAxisLabelColor:C.slate,
  valGridLine:{color:C.lightGray,size:0.5},catGridLine:{style:"none"},showValue:true,dataLabelColor:C.navy,dataLabelFormatCode:"0.0000",
  valAxisMinVal:0.444,valAxisMaxVal:0.456,showLegend:false,showTitle:true,title:"Grid Search — Holdout-30 RAE (lower = better)",
});
s.addChart(pres.charts.BAR,[
  {name:"n (blinded 260)",labels:["Inactive <4.0\n(n=27)","Moderate 4-5.5\n(n=172)","Potent >5.5\n(n=61)"],values:[27,172,61]},
  {name:"Total |error| saved vs pp50",labels:["Inactive <4.0\n(n=27)","Moderate 4-5.5\n(n=172)","Potent >5.5\n(n=61)"],values:[0.107,4.487,-0.732]},
],{
  x:5.0,y:0.7,w:4.65,h:3.3,barDir:"col",
  chartColors:["DC2626","028090"],chartArea:{fill:{color:C.white},roundedCorners:true},
  catAxisLabelColor:C.navy,valAxisLabelColor:C.slate,valGridLine:{color:C.lightGray,size:0.5},catGridLine:{style:"none"},
  showValue:true,dataLabelColor:C.navy,dataLabelFormatCode:"0.00",showLegend:true,legendPos:"t",showTitle:true,title:"Compound-level Δ|error| vs pp50 alone",
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.3,y:4.1,w:9.4,h:1.25,fill:{color:"D6F5ED"},rectRadius:0.06,line:{color:C.mint,width:1.5}});
s.addText("Why this blend works:",{x:0.55,y:4.18,w:2.2,h:1.1,fontSize:12,bold:true,color:C.navy,fontFace:"Trebuchet MS",valign:"top",margin:0});
const why=[
  "p13d under-performs pp50 in EVERY region despite its asymmetric BCE head — reducing its weight from 36% to 15% is definitively correct.",
  "172 moderate compounds (66% of blinded set) save 4.487 total error units — far outweighing the potent cost (0.732) or inactive saving (0.107).",
  "UniMol's inactive bias (+0.774 units) dilutes to only +0.046 per inactive at 10% weight — acceptable given the moderate-region gain.",
];
why.forEach((w,i)=>s.addText(`${i+1}.  ${w}`,{x:2.65,y:4.2+i*0.36,w:6.85,h:0.34,fontSize:9.5,color:C.darkSlate,fontFace:"Calibri",margin:0}));
s.addNotes("75/15/10 found by grid search. Reducing p13d from 36% to 15% is the key move. Moderate compounds (65%) dominate the net gain.");}

// SLIDE 12 — Phase 1 vs Phase 2
{const s=ls();
addHdr(s,"PREDICTION COMPARISON","Phase 1 vs Phase 2 — 260 Blinded Set 2 Compounds");
const ss2=[{lbl:"Pearson r",val:"0.952",sub:"high overall agreement"},{lbl:"Spearman ρ",val:"0.942",sub:"rank-order preserved"},{lbl:"Mean shift",val:"−0.026",sub:"P2 slightly lower overall"},{lbl:"|shift| > 0.5",val:"19 cpds",sub:"diverge significantly"}];
ss2.forEach((st,i)=>{
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.35+i*2.35,y:0.65,w:2.2,h:0.88,fill:{color:C.cardBg},rectRadius:0.06,shadow:mkSh(),line:{color:C.lightGray,width:0.5}});
  s.addText(st.val,{x:0.35+i*2.35,y:0.7,w:2.2,h:0.48,fontSize:18,bold:true,color:C.navy,fontFace:"Trebuchet MS",align:"center",valign:"middle",margin:0});
  s.addText(st.lbl,{x:0.35+i*2.35,y:1.12,w:2.2,h:0.18,fontSize:8.5,bold:true,color:C.teal,fontFace:"Calibri",align:"center",margin:0});
  s.addText(st.sub,{x:0.35+i*2.35,y:1.3,w:2.2,h:0.15,fontSize:8,color:C.slate,fontFace:"Calibri",align:"center",margin:0});
});
s.addChart(pres.charts.BAR,[
  {name:"Phase 1",labels:["Inactive\n(<4.0)","Moderate\n(4-5.5)","Potent\n(>5.5)","Very Potent\n(>6.0)"],values:[19,201,40,0]},
  {name:"Phase 2",labels:["Inactive\n(<4.0)","Moderate\n(4-5.5)","Potent\n(>5.5)","Very Potent\n(>6.0)"],values:[27,172,60,1]},
],{x:0.3,y:1.65,w:4.55,h:3.35,barDir:"col",chartColors:["D97706","028090"],chartArea:{fill:{color:C.lightBg},roundedCorners:true},catAxisLabelColor:C.navy,valAxisLabelColor:C.slate,valGridLine:{color:C.lightGray,size:0.5},catGridLine:{style:"none"},showValue:true,dataLabelColor:C.navy,dataLabelFormatCode:"0",showLegend:true,legendPos:"t",showTitle:true,title:"Prediction Counts by Activity Region"});
s.addText("Regional Shift Analysis  (P2 − P1 mean)",{x:5.1,y:1.65,w:4.55,h:0.3,fontSize:13,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
const shifts=[
  {reg:"Inactive  (<4.0, n=19 in P1)",p1:"3.604",p2:"3.229",sh:"−0.375",interp:"P2 pushes inactives lower in 17/19 compounds. Asymmetric BCE + aug2 data correctly identifies true inactives.",color:C.red},
  {reg:"Moderate  (4-5.5, n=201 in P1)",p1:"4.918",p2:"4.914",sh:"−0.004",interp:"Nearly identical — both phases agree well on the bulk 77% of the test set. Core predictions are stable.",color:C.slate},
  {reg:"Potent  (>5.5, n=40 in P1)",p1:"5.642",p2:"5.669",sh:"+0.027",interp:"P2 pushes potents slightly higher in 27/40 compounds. Aug2 training on Set 1 labels breaks the Phase 1 ceiling.",color:C.mint},
];
shifts.forEach((sh,i)=>{const y=2.05+i*1.2;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.1,y,w:4.55,h:1.1,fill:{color:C.cardBg},rectRadius:0.06,shadow:mkShC(),line:{color:sh.color,width:1.5}});
  s.addText(sh.reg,{x:5.28,y:y+0.08,w:2.8,h:0.26,fontSize:11,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
  s.addText("Avg: "+sh.sh,{x:8.35,y:y+0.08,w:1.2,h:0.26,fontSize:14,bold:true,color:sh.color,fontFace:"Trebuchet MS",align:"center",margin:0});
  s.addText("P1 mean: "+sh.p1+"  →  P2 mean: "+sh.p2,{x:5.28,y:y+0.37,w:4.2,h:0.2,fontSize:9.5,color:C.slate,fontFace:"Calibri",margin:0});
  s.addText(sh.interp,{x:5.28,y:y+0.59,w:4.2,h:0.46,fontSize:9,italic:true,color:C.darkSlate,fontFace:"Calibri",margin:0});
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.1,y:5.02,w:4.55,h:0.35,fill:{color:"D6F5ED"},rectRadius:0.05,line:{color:C.mint,width:1}});
s.addText("Dynamic range: P1 [3.07 – 5.80]  →  P2 [2.73 – 6.00]  ·  std: 0.567 → 0.714",{x:5.15,y:5.02,w:4.45,h:0.35,fontSize:9.5,bold:true,color:C.navy,fontFace:"Calibri",align:"center",valign:"middle",margin:0});
s.addNotes("Phase 2 expands prediction range both ways. 8 more inactives, 22 more potents identified. Moderate compounds unchanged.");}

// SLIDE 13 — Final Submission
{const s=ss();
addHdr(s,"FINAL SUBMISSION","Phase 2 — OpenADMET Tier 1 · Activity Track");
const fm=[{lbl:"OpenADMET Standing",val:"Tier 1",hi:true,sub:"43-entry top tier"},{lbl:"LB RAE",val:"0.5841",hi:false,sub:"Phase 2 leaderboard"},{lbl:"LB MAE",val:"0.4213",hi:false,sub:"Phase 2 leaderboard"},{lbl:"LB Spearman",val:"0.8028",hi:false,sub:"rank-order correlation"}];
fm.forEach((m,i)=>{
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.35+i*2.35,y:0.65,w:2.2,h:0.95,fill:{color:m.hi?"D6F5ED":C.white},rectRadius:0.07,shadow:mkSh(),line:{color:m.hi?C.mint:C.lightGray,width:m.hi?2:0.5}});
  s.addText(m.val,{x:0.35+i*2.35,y:0.7,w:2.2,h:0.55,fontSize:m.hi?20:15,bold:true,color:m.hi?C.teal:C.navy,fontFace:"Trebuchet MS",align:"center",valign:"middle",margin:0});
  s.addText(m.lbl,{x:0.35+i*2.35,y:1.19,w:2.2,h:0.18,fontSize:8.5,bold:true,color:C.teal,fontFace:"Calibri",align:"center",margin:0});
  s.addText(m.sub,{x:0.35+i*2.35,y:1.38,w:2.2,h:0.15,fontSize:8,color:C.slate,fontFace:"Calibri",align:"center",margin:0});
});
s.addChart(pres.charts.LINE,[{name:"RAE",labels:["Phase 1\n(on Set 1)","Aug2 baseline\n50/25/25","v2\n60/36/4","FINAL\n75/15/10 ★"],values:[0.5589,0.4811,0.4499,0.4471]}],{x:0.3,y:1.72,w:5.5,h:3.12,chartColors:["028090"],chartArea:{fill:{color:C.white},roundedCorners:true},catAxisLabelColor:C.navy,valAxisLabelColor:C.slate,valGridLine:{color:C.lightGray,size:0.5},catGridLine:{style:"none"},showValue:true,dataLabelColor:C.navy,dataLabelFormatCode:"0.0000",lineSize:3,lineSmooth:false,showLegend:false,valAxisMinVal:0.42,valAxisMaxVal:0.58,showTitle:true,title:"RAE Progression Through Phase 2 (Holdout-30)"});
s.addText("Submission Details",{x:6.05,y:1.72,w:3.65,h:0.3,fontSize:13,bold:true,color:C.navy,fontFace:"Trebuchet MS",margin:0});
const det=[["File","submission_blend_751510.csv"],["Compounds","513 total (253 Set 1 + 260 Set 2)"],["Blend","75% pp50 + 15% p13d + 10% UniMol"],["LB Standing","Tier 1, Activity Track (of 43)"],["LB MAE  ·  RAE","0.4213  ·  0.5841"],["LB R²","0.5528"],["LB Spearman  ·  Kendall τ","0.8028  ·  0.6221"],["Holdout-30 RAE","0.4471 (proxy, Set 1 labels)"]];
det.forEach((d,i)=>{const y=2.08+i*0.48;
  s.addShape(pres.shapes.RECTANGLE,{x:6.0,y,w:3.65,h:0.44,fill:{color:i%2===0?C.white:C.cardBg},line:{color:C.lightGray,width:0.5}});
  s.addText(d[0],{x:6.1,y,w:0.88,h:0.44,fontSize:9,bold:true,color:C.slate,fontFace:"Calibri",valign:"middle",margin:0});
  s.addText(d[1],{x:7.02,y,w:2.55,h:0.44,fontSize:9,color:C.darkSlate,fontFace:"Calibri",valign:"middle",margin:0});
});
s.addNotes("Final submission: OpenADMET Tier 1 (activity track). MAE 0.4213 · RAE 0.5841 · R² 0.5528 · Spearman 0.8028 · Kendall τ 0.6221. Holdout-30 proxy was 0.4471. 43 entries placed in Tier 1 — all statistically indistinguishable from rank #1.");}

// SLIDE 14 — Head-to-Head Comparison vs Rank #1
{const s=ls();
addHdr(s,"COMPETITION ANALYSIS","Open-Source vs. Rank #1 — Tier 1 Confirmed");

// Big p-value callout
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.3,y:0.72,w:4.55,h:1.3,fill:{color:"D6F5ED"},rectRadius:0.08,shadow:mkSh(),line:{color:C.mint,width:2}});
s.addText("p = 0.402",{x:0.3,y:0.78,w:4.55,h:0.72,fontSize:42,bold:true,color:C.teal,fontFace:"Trebuchet MS",align:"center",valign:"middle",margin:0});
s.addText("NOT statistically significant  ·  HB-adjusted threshold: 0.0001",{x:0.3,y:1.51,w:4.55,h:0.28,fontSize:10,bold:true,color:C.navy,fontFace:"Calibri",align:"center",margin:0});

// MAE comparison bar chart
s.addChart(pres.charts.BAR,[
  {name:"MAE",labels:["Gashaw  (Tier 1)","matcha-croissant  (#1)"],values:[0.4213,0.4061]},
],{x:0.3,y:2.12,w:4.55,h:1.85,barDir:"bar",
  chartColors:["028090","D97706"],
  chartArea:{fill:{color:C.white},roundedCorners:true},
  catAxisLabelColor:C.navy,valAxisLabelColor:C.slate,
  valGridLine:{color:C.lightGray,size:0.5},catGridLine:{style:"none"},
  showValue:true,dataLabelColor:C.navy,dataLabelFormatCode:"0.0000",
  valAxisMinVal:0.38,valAxisMaxVal:0.45,showLegend:false,
  showTitle:true,title:"Mean MAE (bootstrap)"
});
s.addText("± 0.0296",{x:3.88,y:2.52,w:0.95,h:0.25,fontSize:9,italic:true,color:C.slate,fontFace:"Calibri",margin:0});
s.addText("± 0.0280",{x:3.88,y:2.98,w:0.95,h:0.25,fontSize:9,italic:true,color:C.slate,fontFace:"Calibri",margin:0});

// Bootstrap proportion bar
s.addText("Bootstrap distribution: Gashaw equals or beats Rank #1 in 40% of samples",{x:0.3,y:4.06,w:4.55,h:0.22,fontSize:9.5,color:C.slate,fontFace:"Calibri",margin:0});
s.addShape(pres.shapes.RECTANGLE,{x:0.3,y:4.3,w:1.82,h:0.32,fill:{color:C.teal},line:{color:C.white,width:0}});
s.addShape(pres.shapes.RECTANGLE,{x:2.12,y:4.3,w:2.73,h:0.32,fill:{color:"4361A5"},line:{color:C.white,width:0}});
s.addText("40%  Gashaw ≤ #1",{x:0.3,y:4.3,w:1.82,h:0.32,fontSize:8.5,bold:true,color:C.white,fontFace:"Calibri",align:"center",valign:"middle",margin:0});
s.addText("60%  Gashaw > #1",{x:2.12,y:4.3,w:2.73,h:0.32,fontSize:8.5,bold:true,color:C.white,fontFace:"Calibri",align:"center",valign:"middle",margin:0});

// Bottom key insight
s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.3,y:4.72,w:4.55,h:0.65,fill:{color:C.amberLt},rectRadius:0.06,line:{color:C.amber,width:1.5}});
s.addText("Δ MAE = +0.0152  ·  < one bootstrap SD (0.029)",{x:0.45,y:4.79,w:4.25,h:0.26,fontSize:10,bold:true,color:"78350F",fontFace:"Trebuchet MS",margin:0});
s.addText("The rank gap is a leaderboard artifact of a 260-compound test set — not a real performance gap.",{x:0.45,y:5.05,w:4.25,h:0.22,fontSize:9,color:"78350F",fontFace:"Calibri",margin:0});

// Right: three insight cards
const h2h=[
  {title:"Official OpenADMET Tier 1 designation",body:"OpenADMET's sequential significance testing placed 43 activity-track entries in Tier 1 — all statistically indistinguishable from rank #1. This submission is one of them."},
  {title:"Where the remaining gap lives",body:"Inactives (pEC50 < 4.0): our asymmetric BCE reduced but did not eliminate over-prediction bias. This is the one region where further work would help."},
  {title:"Open-source achieves statistical parity",body:"Chemprop + UniMol + RDKit — no proprietary data, no private models — matches the rank #1 entry within the noise floor of the evaluation."},
];
h2h.forEach((ins,i)=>{const y=0.72+i*1.52;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:5.1,y,w:4.55,h:1.38,fill:{color:C.cardBg},rectRadius:0.06,shadow:mkShC(),line:{color:C.teal,width:1}});
  s.addText(ins.title,{x:5.28,y:y+0.1,w:4.2,h:0.3,fontSize:10.5,bold:true,color:C.teal,fontFace:"Trebuchet MS",margin:0});
  s.addText(ins.body,{x:5.28,y:y+0.44,w:4.2,h:0.86,fontSize:9.5,color:C.darkSlate,fontFace:"Calibri",margin:0});
});
s.addNotes("Bootstrap head-to-head: Gashaw MAE 0.4213±0.0296 vs matcha-croissant 0.4061±0.0280. p=0.402, not significant. Delta MAE only 0.015, smaller than 1 SD.");}

// SLIDE 15 — Conclusions
{const s=ds();
s.addText("Conclusions & Lessons Learned",{x:0.6,y:0.25,w:8.8,h:0.7,fontSize:30,bold:true,color:C.white,fontFace:"Trebuchet MS",margin:0});
s.addShape(pres.shapes.LINE,{x:0.6,y:1.0,w:3.5,h:0,line:{color:C.mint,width:2}});
const cols=[
  {title:"Achievements",color:C.mint,items:["OpenADMET Tier 1, activity track — statistically indistinguishable from rank #1 · MAE 0.4213 · Spearman 0.8028","Phase 1 rank #39 → Phase 2 Tier 1 — 27-rank improvement with open-source tools only","Asymmetric BCE reduces inactive over-prediction bias: +0.965 → +0.788 units","Phase 2 expands prediction range: floor 3.07→2.73, ceiling 5.80→6.00"]},
  {title:"Key Lessons",color:C.amber,items:["OOF cross-validation is unreliable for analog-expansion designs — blind test is the only real signal","External ChEMBL data degrades performance — one assay protocol per model, no mixing","Symmetric BCE hurts potent predictions — asymmetric (inactives only) is the correct design","Moderate compounds (65% of test set) drive net accuracy — never sacrifice them for edge cases"]},
  {title:"Future Directions",color:"5DCAA5",items:["Protein structure-aware models: PXR's flexible pocket calls for docking-based 3D features","Active learning: use potency gradients within analog series to guide synthesis","Uncertainty-aware training: weight loss by pEC50 std error to reduce the noise floor","Graph-transformer hybrid: combine 2D scaffold topology with 3D conformer geometry end-to-end"]},
];
cols.forEach((col,i)=>{const x=0.35+i*3.2;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:1.15,w:3.05,h:4.1,fill:{color:"0D4F6B"},rectRadius:0.08,line:{color:col.color,width:1.5}});
  s.addText(col.title,{x:x+0.15,y:1.28,w:2.75,h:0.35,fontSize:14,bold:true,color:col.color,fontFace:"Trebuchet MS",margin:0});
  col.items.forEach((item,j)=>{
    s.addText([{text:"› ",options:{color:col.color,bold:true}},{text:item,options:{color:"C8E8F4"}}],{x:x+0.15,y:1.72+j*0.84,w:2.75,h:0.8,fontSize:9.5,fontFace:"Calibri",margin:0});
  });
});
s.addText("OpenADMET PXR pEC50 Blind Challenge  ·  Gashaw  ·  June 2026",{x:0,y:5.31,w:10,h:0.3,fontSize:8.5,color:"3A6A80",fontFace:"Calibri",align:"center",margin:0});
s.addNotes("Closing: three achievements, four key lessons (OOF unreliability is #1), four future directions.");}

const outFile = process.env.PPTX_OUT || "D:/unimol_finetuning/pxr_challenge_presentation_v4.pptx";
pres.writeFile({fileName: outFile})
  .then(()=>console.log("DONE \u2014 saved " + outFile))
  .catch(err=>{console.error(err);process.exit(1);});
