# Statistical Validation

                             count    mean     std  min     25%     50%     75%       max  skewness
recency                    93358.0  237.94  152.59  1.0  114.00  219.00  346.00    714.00      0.45
total_orders               93358.0    1.03    0.21  1.0    1.00    1.00    1.00     15.00     11.09
total_spend                93358.0  165.20  226.31  0.0   63.05  107.78  182.56  13664.08      9.21
average_order_value        93358.0  160.31  219.57  0.0   62.37  105.63  176.65  13664.08      9.42
average_purchase_interval   2801.0   80.60  107.92  0.0    0.00   32.00  125.00    608.00      1.68
customer_lifetime_days     93358.0    2.63   24.96  0.0    0.00    0.00    0.00    633.00     12.31
engagement_score           93358.0   22.55    7.41  0.0   17.34   23.33   28.24     91.29     -0.25

## Outlier check (IQR 1.5x) per feature

recency: outliers=26 (0.03%) bounds=(-234.00,694.00)
  -> DECISION: retained; monitored, not removed (Section 18 requires justification not auto-deletion)
total_orders: outliers=2801 (3.00%) bounds=(1.00,1.00)
  -> DECISION: retained; monitored, not removed (Section 18 requires justification not auto-deletion)
total_spend: outliers=7402 (7.93%) bounds=(-116.21,361.82)
  -> DECISION: retained (genuine high-value customers, not data errors)
average_order_value: outliers=7333 (7.85%) bounds=(-109.05,348.07)
  -> DECISION: retained (genuine high-value customers, not data errors)
average_purchase_interval: outliers=143 (5.11%) bounds=(-187.50,312.50)
  -> DECISION: retained; monitored, not removed (Section 18 requires justification not auto-deletion)
customer_lifetime_days: outliers=1993 (2.13%) bounds=(0.00,0.00)
  -> DECISION: retained (long-tenure repeat customers are a valid, meaningful segment)
engagement_score: outliers=211 (0.23%) bounds=(0.99,44.59)
  -> DECISION: retained; monitored, not removed (Section 18 requires justification not auto-deletion)

## Skew interpretation

total_spend and average_order_value are highly right-skewed (median well below mean); median/percentile-based summaries are used in the business narrative rather than the mean alone for these two features, per Section 18 guidance.