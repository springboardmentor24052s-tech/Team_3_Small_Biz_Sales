# MarketMind AI — Milestone 1: Data Preparation & Preprocessing Report

**Project:** MarketMind AI – Small Business Sales Intelligence Platform
**Dataset:** Online Retail II (UCI Machine Learning Repository / Kaggle: `dvaser/online-retail-ii`)
**Scope:** Data preparation and preprocessing only. No forecasting, recommendation, segmentation,
anomaly detection, churn prediction, or model deployment was performed — those are reserved for
later milestones.

---

## 1. Dataset Overview

The raw dataset contains **1,067,371 transaction line items** across **8 columns**, covering
transactions from a UK-based online gift retailer between **01-Dec-2009 and 09-Dec-2011**.

| Column | Description |
|---|---|
| `Invoice` | 6-digit invoice number; prefix `C` indicates a cancellation |
| `StockCode` | Product/item code |
| `Description` | Product name |
| `Quantity` | Units per transaction line |
| `InvoiceDate` | Date and time of the transaction |
| `Price` | Unit price in GBP (£) |
| `CustomerID` | Customer identifier |
| `Country` | Customer's country |

> **Note:** the real UCI/Kaggle schema uses `Invoice`, `Price`, and `CustomerID` (not `InvoiceNo` /
> `UnitPrice`, as sometimes assumed). The pipeline uses the exact source column names.

---

## 2. Data Cleaning Process

Cleaning was applied as a sequential, logged pipeline so the effect of every rule is traceable:

| Step | Rows Removed | Rows Remaining |
|---|---:|---:|
| Start | — | 1,067,371 |
| Remove exact duplicate rows | 34,335 | 1,033,036 |
| Remove cancelled invoices (`Invoice` starts with `C`) | 19,104 | 1,013,932 |
| Remove rows with missing `CustomerID` | 234,437 | 779,495 |
| Remove invalid quantities (≤ 0) | 0 | 779,495 |
| Remove invalid prices (≤ 0) | 70 | 779,425 |
| **Final clean row count** | | **779,425** |

Additional cleaning actions:
- **Missing descriptions** (4,382 rows, 0.41%) were filled using the most frequent `Description`
  seen for that `StockCode` elsewhere in the data; any still unresolved were set to
  `"UNKNOWN PRODUCT"`.
- **`InvoiceDate`** was converted to proper `datetime64` type.
- **`CustomerID`, `Invoice`, `StockCode`** were cast to clean string/ID types (removing floating-point
  artifacts like `13085.0` → `"13085"`).
- The DataFrame index was reset after all filtering steps.

Note that cancelled invoices, rows with missing `CustomerID`, and non-positive quantities/prices are
removed together because — once cancellations are stripped — remaining rows already satisfy
`Quantity > 0`; the residual reduction seen is driven almost entirely by the 22.8% of rows lacking a
`CustomerID`, which cannot be attributed to a customer for analytics purposes.

---

## 3. Feature Engineering Process

The following business features were engineered on top of the cleaned transaction data.
**No prediction labels or ML targets were created** — all features are descriptive/derived only.

**Transaction-level features**
- `Revenue` = `Quantity × Price`
- `OrderYear`, `OrderMonth`, `OrderDay` — calendar components of `InvoiceDate`
- `DayOfWeek` — day name (Monday–Sunday)
- `WeekNumber` — ISO week number
- `Quarter` — calendar quarter (1–4)
- `MonthName`, `YearMonth` — convenience labels for charting/grouping

**Customer-level features (joined back onto each transaction row)**
- `CustomerPurchaseFrequency` — count of distinct invoices per customer
- `CustomerTotalSpend` — sum of `Revenue` per customer
- `AverageOrderValue` — `CustomerTotalSpend ÷ CustomerPurchaseFrequency`

---

## 4. Dataset Preparation Workflow

Three AI-ready datasets were produced from the single cleaned transaction table:

### 4.1 `clean_transactions.csv` (779,425 rows × 20 columns)
Row-level cleaned and feature-enriched transaction data — the base table for all downstream work.

### 4.2 `inventory_dataset.csv` (5,286 rows × 7 columns)
Product-level rollup, grouped by `StockCode` + `Description`:
`ProductCode`, `ProductName`, `QuantitySold`, `Revenue`, `AverageSellingPrice`,
`ProductDemandScore` (0–100 min-max normalized `QuantitySold`, a descriptive ranking metric —
**not** a forecast), `SalesFrequency` (distinct invoices containing the product).

### 4.3 `customer_dataset.csv` (5,878 rows × 7 columns)
Customer-level rollup, grouped by `CustomerID`:
`CustomerID`, `TotalOrders`, `TotalRevenue`, `AverageSpending`, `NumberOfPurchasedProducts`,
`PurchaseFrequency`, `Country` (customer's most frequent country on record).

---

## 5. Exploratory Data Analysis

Eight charts were generated (saved in `/charts`):

1. `01_monthly_sales_trend.png` — Monthly revenue trend, Dec 2009–Dec 2011
2. `02_top_10_products.png` — Top 10 products by revenue
3. `03_top_10_customers.png` — Top 10 customers by revenue
4. `04_country_wise_sales.png` — Top 10 countries by revenue
5. `05_revenue_distribution.png` — Transaction revenue distribution (99th-pct capped)
6. `06_quantity_distribution.png` — Transaction quantity distribution (99th-pct capped)
7. `07_sales_by_month.png` — Seasonality: revenue by calendar month across all years
8. `08_sales_by_weekday.png` — Revenue by day of week

---

## 6. Business Insights (descriptive only — no predictions)

- **Total revenue** across the cleaned dataset: **£17,374,804**.
- **Geographic concentration:** the United Kingdom accounts for **£14.39M (≈82.8%)** of total
  revenue — by far the dominant market; the business is currently highly UK-dependent.
- **Top product by revenue:** *REGENCY CAKESTAND 3 TIER* (**£277,656**), a strong flagship SKU
  worth prioritizing in inventory planning.
- **Peak sales month:** **November 2010** (**£1.17M**), consistent with pre-holiday-season buying —
  a useful signal for future inventory and staffing planning.
- **Customer base:** **5,878** unique customers purchasing across **5,286** distinct products.
- **Top customer:** Customer **18102**, contributing **£580,987** in total revenue — a candidate
  for VIP/wholesale account treatment.
- **Average order value** across all invoices: **≈£470**, suggesting a wholesale-leaning customer
  mix rather than pure retail.

These insights are descriptive summaries of the cleaned data and are intended to inform (not
replace) the AI/ML modules planned for later milestones.

---

## 7. Exported Files

| File | Location |
|---|---|
| Raw dataset | `data/raw/online_retail_II.csv` |
| Clean transactions | `data/processed/clean_transactions.csv` |
| Inventory dataset | `data/processed/inventory_dataset.csv` |
| Customer dataset | `data/processed/customer_dataset.csv` |
| Preprocessing notebook | `notebooks/data_preprocessing.ipynb` |
| EDA charts (×8) | `charts/` |
| Data quality report | `reports/data_quality_report.md` |
| Cleaning log | `reports/cleaning_log.md` |
| This report | `reports/preprocessing_report.md` |

---

## 8. Milestone 1 — Completion Checklist

- [x] Dataset loaded and inspected
- [x] Full data quality report generated
- [x] Data cleaned with every step logged
- [x] Business features engineered (no prediction labels)
- [x] Inventory dataset prepared
- [x] Customer dataset prepared
- [x] 8 professional EDA visualizations generated
- [x] Three processed datasets exported as CSV
- [x] Documentation completed

**No ML models, forecasting, recommendation systems, customer segmentation, anomaly detection,
churn prediction, or deployment work was performed in this milestone**, per scope.
