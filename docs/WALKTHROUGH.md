# MarketMind AI — Milestone 1 Walkthrough (Updated for UCI Dataset)

All 9 foundation tasks have been completed and fully adapted to the **UCI Online Retail Dataset** schema.

## ✅ Completed Deliverables (UCI Schema Aligned)

| # | Task | Deliverable | Status |
|---|------|-------------|--------|
| 1 | Project Objectives & Workflows | `docs/objectives-and-workflows.md` | ✅ |
| 2 | Collect Retail Datasets | `scripts/generate_datasets.py` → `data/raw/` | ✅ (run manually) |
| 3 | Dataset Structure Analysis | `docs/dataset-structure-analysis.md` | ✅ (Flat invoice structure) |
| 4 | Business Attributes Analysis | `docs/business-attributes-analysis.md` | ✅ (Country, RFM mapped) |
| 5 | System Architecture | `docs/system-architecture.md` | ✅ |
| 6 | Database Design | `docs/database-design.md` | ✅ (Normalized tables: Invoices, Products, Customers, Items) |
| 7 | UI Wireframes | `wireframes/` (5 pages + CSS) | ✅ (Using GBP £, StockCodes, Countries) |
| 8 | Dashboard Layout Plan | `docs/dashboard-layout-plan.md` | ✅ |
| 9 | Preprocess Transactions | `scripts/preprocess.py` → `data/processed/` | ✅ (run manually) |

## Run Scripts Manually

The synthetic data generator now perfectly mimics the UCI dataset structure (`online_retail.csv`). 

```powershell
cd c:\Users\ravi5\OneDrive\Desktop\marketmind

# 1. Generate the raw UCI-format data (data/raw/online_retail.csv)
python scripts\generate_datasets.py

# 2. Process into normalized tables (products, customers, invoices, items)
python scripts\preprocess.py
```

## Next Steps (Remaining Week 1-2 Tasks)

- Build initial analytics dashboard (React)
- Initialize FastAPI backend
- Implement authentication & RBAC
- Create frontend skeleton
