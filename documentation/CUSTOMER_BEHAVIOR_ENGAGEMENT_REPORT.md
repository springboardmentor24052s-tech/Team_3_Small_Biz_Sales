# Customer Behavior & Engagement Report
**MarketMind AI — Milestone 2: Customer Segmentation & Sales Forecasting**
**Assigned responsibility: Customer Purchasing Behavior and Engagement Analysis**

---

## 1. Executive Summary

This report analyzes purchasing behavior and engagement for 93,358 unique customers in the Olist
Brazilian e-commerce dataset, building a validated, reproducible customer-level feature set ready
for the next milestone (K-Means/Hierarchical clustering). Key finding: 97.00% of customers purchase
only once, 59.18% are now Inactive (>180 days since last purchase), yet the small repeat-customer
segment (3.00% of the base) already contributes a disproportionate share of revenue — pointing
squarely at retention as the highest-leverage opportunity for this business.

## 2. Objective

Quantify customer purchasing behavior and engagement, produce customer profiling (value + lifecycle),
and engineer a clean, documented, segmentation-ready feature dataset. Clustering itself is explicitly
out of scope for this task — the deliverable is the validated input clustering will consume next.

## 3. Dataset

**Source:** Olist Brazilian E-Commerce Public Dataset (Kaggle: `olistbr/brazilian-ecommerce`).
**Files used:** `olist_customers_dataset.csv`, `olist_orders_dataset.csv`,
`olist_order_items_dataset.csv`, `olist_order_payments_dataset.csv`, `olist_products_dataset.csv`,
`product_category_name_translation.csv`. `olist_sellers_dataset.csv` was uploaded but not used
(seller-level analysis is out of scope for customer behavior).
**Not available:** `olist_order_reviews_dataset.csv` — upload did not complete in this session.
Every review-dependent field/section below is explicitly marked unavailable rather than estimated.

## 4. Dataset Structure

- Two customer identifiers exist: `customer_id` (99,441 unique, one per order) and
  `customer_unique_id` (96,096 unique, the true persistent customer). **`customer_unique_id` is used
  as the grain for every customer-level metric**; `customer_id` is used only to join orders↔customers.
- Order timestamps span **2016-09-04 to 2018-10-17**.
- `order_status` has 8 distinct values; 97.02% of orders are `delivered`.
- `order_items` and `order_payments` are not 1:1 with orders (multiple line items / installment rows
  per order) — this required pre-aggregation before joining (Section 6).
- Full per-file, per-column inventory (dtypes, missing %, uniqueness, duplicates) is in
  `../SCHEMA_MAPPING.md`.

## 5. Data Preparation

- All timestamp columns parsed to `datetime`; 0 unparseable values found.
- 0 exact-duplicate rows in customers/orders/products; 0 fully-duplicated `order_items` rows.
- `product_category_name` missing in 1.85% of products — filled with `'category_not_informed'`
  rather than dropped (price/order validity unaffected by a missing label).
- **Validity filter:** only `order_status == 'delivered'` orders are used for behavioral/RFM/monetary
  features (96,478 of 99,441 orders, 97.02%). Documented as a project-defined business rule.

## 6. Data Integration

Join sequence, each validated with `pandas.merge(validate=...)` to catch unintended row duplication:
1. `orders (delivered)` + `customers` on `customer_id` (m:1)
2. + `order_items` on `order_id` (1:m, inner) → expands to order-item grain
3. + `products` on `product_id` (m:1)
4. + `category_translation` (m:1)
5. + `order_payments`, **pre-aggregated to one row per order** (summed value, max installments, most
   frequent type) before joining, specifically to prevent many-to-many duplication against multiple
   payment-installment rows.

**Result:** `outputs/cleaned/olist_customer_transactions.csv` — 110,197 rows, 93,358 customers,
96,478 orders, zero unintended row inflation at any join step.

## 7. Exploratory Data Analysis

- **Orders per customer:** 97.00% of customers place exactly 1 order; 3.00% (2,801) are repeat.
- **Order value:** median R$105.63, mean R$162.64 — right-skewed (a handful of high-value orders
  pull the mean up).
- **Monthly volume:** steady growth from late 2016 through late 2017, peaking around November 2017
  (Black Friday effect visible), continuing through 2018.
- **Top categories by order-item volume:** bed_bath_table, health_beauty, sports_leisure,
  furniture_decor, computers_accessories.
- **Review/activity behavior:** not available this run (reviews file missing). This limitation is
  carried through every downstream section that would otherwise use review data.

## 8. Customer Purchasing Behavior

Computed per `customer_unique_id`, with reference date fixed at
`max(order_purchase_timestamp) + 1 day` (2018-10-18) applied consistently to avoid data leakage:

| Feature | Result |
|---|---|
| Repeat customer rate | 3.00% |
| Avg / median purchase interval (repeat customers, n=2,801) | 80.6 / 32.0 days |
| Avg order value (mean across customers) | R$160.31 |
| Customer lifetime (mean vs median) | 2.63 vs 0 days — heavily right-skewed by the 97% one-order base |

Also computed: recency, frequency (total_orders), monetary value, purchase_frequency (rate,
defined only for customers with lifetime_days > 0), total_items, unique_products, unique_categories.

## 9. Customer Engagement

**Inputs (measurable, available only):** frequency (total_orders), recency (inverted), category
breadth (unique_categories). **Review-based signals excluded** — data unavailable this run.

**Formula:**
```
engagement_score = 100 × mean( minmax(total_orders), minmax(-recency_days), minmax(unique_categories) )
```
Equal 1/3 weighting — a transparent default in the absence of a business-supplied weighting scheme.
Categorization uses a **tercile (33rd/67th percentile) split** — Low / Moderate / High Engagement —
a percentile-based rule, not an arbitrary fixed cutoff. Distribution: ~31k / ~32k / ~31k customers
across the three categories.

**Limitation:** engagement correlates more with order frequency (r≈0.21) than with total spend
(r≈0.03) — it captures activity pattern, not profitability. Read alongside Section 10, not in
place of it.

## 10. Customer Value Analysis

Median-split rule (spend median R$107.78, order-count median 1.0 — project-defined, documented):
- **One-Time Customer** (97.00%)
- **High-Value Frequent** — 2,467 customers (2.64%), avg spend R$339.19 — 2.1× the overall AOV
- **High-Frequency Low-Value**
- **Low-Value Occasional**

## 11. Customer Lifecycle

Project-defined rules (recency + frequency only; explicitly not an industry standard):

| Stage | Rule | Count | % |
|---|---|---|---|
| Inactive Customer | recency > 180 days | 55,252 | 59.18% |
| Active Customer | 1 order, 90 < recency ≤ 180 | 19,026 | 20.38% |
| New Customer | 1 order, recency ≤ 90 | 17,845 | 19.11% |
| Repeat Customer | 2 orders, recency ≤ 180 | 1,110 | 1.19% |
| Loyal / High-Activity Customer | 3+ orders, recency ≤ 180 | 125 | 0.13% |

## 12. Product/Category Analysis

`unique_products`, `unique_categories`, and `preferred_category` computed per customer. Given the
97% one-order base, diversity metrics are structurally 1 for most customers by construction — the
signal is only meaningful for the 3% repeat-customer subset (max observed: 14 unique products, 5
unique categories for a single customer). Top revenue category and full category rollups are in
`outputs/tableau/customer_category_analysis_tableau.csv` and the Excel "Product & Category
Analysis" sheet.

## 13. Visual Findings

20 visualizations generated in `outputs/visualizations/` covering distribution, temporal, product,
engagement, and lifecycle dimensions (full list in Section 19). Chart → Observation → Interpretation
→ Action write-ups for the most decision-relevant charts are in `outputs/VISUALIZATION_INSIGHTS.md`
and mirrored in `notebooks/07_customer_visual_analysis.ipynb`.

## 14. Key Insights

1. Repeat customers (3.00% of base) drive a disproportionate share of revenue relative to their size.
2. 59.18% of customers are Inactive — the single largest lifecycle segment.
3. High-Value Frequent segment (2.64% of customers) averages 2.1× the overall average order value.
4. Median repeat-purchase interval is 32 days — a concrete retention-timing benchmark.
5. Engagement score tracks activity pattern (frequency/recency), not spend — the two signals are
   complementary, not interchangeable.
6. The dataset's dominant trait — 97% single-purchase customers — is a structural property of this
   Olist snapshot, not a data-quality issue, and shapes every downstream feature.

## 15. Business Recommendations

- **Reactivation campaigns** for the 55,252 Inactive customers — the largest addressable segment by
  volume; sub-prioritize by historical `value_segment`.
- **Retention timing** around days 25–40 post-purchase, aligned with the observed 32-day median
  reorder interval.
- **VIP/loyalty tier** for the 2,467 High-Value Frequent customers.
- **Category-led promotion** on the top revenue categories identified in the Excel "Product &
  Category Analysis" sheet.
- These are hypotheses grounded in observed patterns, not guarantees of causal effect.

## 16. Feature Engineering

Final customer-level features (see Section 12 of the earlier schema log and the CSV headers for the
authoritative list): recency, total_orders, total_spend, average_order_value, purchase_frequency,
average/median/min/max_purchase_interval, customer_lifetime_days, total_items, unique_products,
unique_categories, preferred_category, engagement_score, engagement_category, value_segment,
lifecycle_stage. `review_activity` / `average_review_score` are present as columns but populated as
null — documented as unavailable, not fabricated.

## 17. Segmentation Readiness

`outputs/customer_analysis/customer_segmentation_features.csv`:
- 0 missing values confirmed programmatically across 7 core features.
- IQR outlier check performed per feature (0.03%–7.93% flagged, depending on feature) — **retained**,
  since these represent genuine high-value/high-frequency customers, not data errors.
- `log1p` applied to features with `|skew| > 1` (reduced `monetary_value` skew from 9.21 → 0.53, for
  example).
- Z-score standardization applied to produce `*_scaled` columns — the intended clustering input.
- `customer_unique_id` retained only as a row identifier; **must be excluded** from the actual
  K-Means/clustering feature matrix.

## 18. Limitations

- Review data entirely unavailable this run — no review-informed engagement, no review/purchase
  correlation analysis.
- 97% single-purchase-customer rate limits frequency-based signal; recency/monetary/engagement carry
  more differentiating power for this dataset.
- Lifecycle/value thresholds are project-defined analytical rules, explicitly not externally
  validated industry benchmarks.
- Purchase-interval statistics apply only to the 2,801 repeat customers (3.00% of the base).
- Seller/geolocation data not incorporated (out of scope for customer-level behavior).
- Notebooks were hand-authored with real, previously-executed computation results embedded as
  outputs (no `jupyter`/`nbconvert` execution environment was available in this session) — re-running
  the code cells against the data in `data/raw/` will reproduce identical results, since the pipeline
  is fully deterministic.

## 19. Generated Files

```
project/
├── data/
│   ├── raw/                                (8 raw Olist CSVs)
│   └── processed/                          (cleaned + customer-level CSVs)
├── notebooks/
│   ├── 01_data_understanding.ipynb
│   ├── 02_data_cleaning.ipynb
│   ├── 03_data_integration.ipynb
│   ├── 04_customer_behavior_eda.ipynb
│   ├── 05_customer_engagement_analysis.ipynb
│   ├── 06_customer_feature_engineering.ipynb
│   └── 07_customer_visual_analysis.ipynb
├── outputs/
│   ├── cleaned/olist_customer_transactions.csv
│   ├── customer_analysis/
│   │   ├── customer_behavior_engagement.csv
│   │   └── customer_segmentation_features.csv
│   ├── visualizations/                     (20 PNG files, 01-20)
│   ├── reports/customer_behavior_engagement_report.xlsx   (10 sheets)
│   ├── tableau/
│   │   ├── customer_behavior_engagement_tableau.csv
│   │   ├── customer_monthly_trends_tableau.csv
│   │   └── customer_category_analysis_tableau.csv
│   ├── STATISTICAL_VALIDATION.md
│   └── VISUALIZATION_INSIGHTS.md
├── documentation/
│   └── CUSTOMER_BEHAVIOR_ENGAGEMENT_REPORT.md   (this file)
├── SCHEMA_MAPPING.md
├── CLEANING_INTEGRATION_LOG.md
├── EDA_FEATURES_LOG.md
├── SEGMENTATION_FEATURES_LOG.md
└── requirements.txt
```

## 20. Next Step

Feed `outputs/customer_analysis/customer_segmentation_features.csv` (the `*_scaled` columns) into
K-Means/Hierarchical clustering for the customer segmentation stage. Given the 97% single-purchase
base, expect frequency-based features to contribute limited cluster separation; recency, monetary
value, and engagement dimensions are likely to drive the more informative clusters — to be validated
with elbow/silhouette analysis once clustering actually runs, not assumed in advance.

---

## Tableau Dashboard Recommendations

Tableau was not available in this workspace — no dashboard was built, only the recommended structure
below (per the spec's own instruction not to claim a dashboard exists without Tableau access).

**Dashboard 1 — Customer Overview:** KPI tiles (customers, revenue, repeat rate); state-level customer
distribution; spending distribution.

**Dashboard 2 — Purchasing Behavior:** orders-per-customer, monthly trend, AOV distribution,
purchase-interval histogram (repeat customers).

**Dashboard 3 — Customer Engagement:** engagement_score histogram; engagement_category donut;
engagement vs. total_spend scatter, colored by value_segment.

**Dashboard 4 — Customer Lifecycle:** lifecycle_stage bar chart; lifecycle × value_segment heatmap;
recency histogram colored by lifecycle stage.

Import `outputs/tableau/*.csv` directly — clean column names, correct types, no index columns, one
row per customer in the customer-level file.
