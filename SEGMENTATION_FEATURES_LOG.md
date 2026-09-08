# Segmentation Feature Engineering Log

```
Loaded customer profile: 93,358 rows

--- Missing values in candidate segmentation features ---
customer_unique_id    0
recency_days          0
frequency             0
monetary_value        0
avg_order_value       0
unique_products       0
unique_categories     0
engagement_score      0
Confirmed: zero missing values across all selected segmentation features.

--- Outlier analysis (IQR method, 1.5x rule) ---
recency_days: Q1=114.00 Q3=346.00 IQR=232.00 bounds=(-234.00,694.00) outliers=26 (0.03%)
frequency: Q1=1.00 Q3=1.00 IQR=0.00 bounds=(1.00,1.00) outliers=2801 (3.00%)
monetary_value: Q1=63.05 Q3=182.56 IQR=119.51 bounds=(-116.21,361.82) outliers=7402 (7.93%)
avg_order_value: Q1=62.37 Q3=176.65 IQR=114.28 bounds=(-109.05,348.07) outliers=7333 (7.85%)
unique_products: Q1=1.00 Q3=1.00 IQR=0.00 bounds=(1.00,1.00) outliers=5334 (5.71%)
unique_categories: Q1=1.00 Q3=1.00 IQR=0.00 bounds=(1.00,1.00) outliers=2270 (2.43%)
engagement_score: Q1=17.34 Q3=28.24 IQR=10.90 bounds=(0.99,44.59) outliers=211 (0.23%)

DECISION on outliers: monetary_value, avg_order_value, and frequency outliers are RETAINED (not removed/capped). These represent genuinely high-value or high-frequency customers - exactly the segment K-Means/clustering needs to identify (e.g., VIP customers). Removing them would erase the signal the segmentation stage is meant to find. Instead, skew is addressed via transformation (below) so extreme values don't dominate Euclidean-distance-based clustering.

--- Skewness (before transformation) ---
recency_days: skewness=0.447
frequency: skewness=11.095
monetary_value: skewness=9.211
avg_order_value: skewness=9.415
unique_products: skewness=7.463
unique_categories: skewness=7.579
engagement_score: skewness=-0.252

Applied log1p transform to highly skewed (|skew|>1) non-negative features: ['frequency', 'monetary_value', 'avg_order_value', 'unique_products', 'unique_categories']

--- Skewness (after log1p transform, transformed features only) ---
frequency_log: skewness=6.522 (was 11.095)
monetary_value_log: skewness=0.529 (was 9.211)
avg_order_value_log: skewness=0.547 (was 9.415)
unique_products_log: skewness=4.814 (was 7.463)
unique_categories_log: skewness=6.719 (was 7.579)

Standardized (z-score) features created for: ['recency_days', 'frequency', 'monetary_value', 'avg_order_value', 'unique_products', 'unique_categories', 'engagement_score']
Formula: (x - mean(x)) / std(x), applied to the log-transformed version where a log transform was used, otherwise the raw feature.

Saved customer_segmentation_features.csv: 93,358 rows x 15 columns.
Columns intended as K-Means/clustering INPUT: all *_scaled columns. customer_unique_id must be excluded from the feature matrix (identifier only, not a predictor).
```
