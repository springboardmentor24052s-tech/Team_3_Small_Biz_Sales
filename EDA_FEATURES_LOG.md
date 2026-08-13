# EDA & Feature Engineering Log

```
Loaded transaction dataset: 110,197 rows, 93,358 customers, 96,478 orders.

Analysis reference date (max purchase date + 1 day): 2018-08-30
This date is fixed and used consistently for ALL recency calculations to avoid data leakage (no future information beyond the dataset's own snapshot is used).

Order-level table: 96,478 rows (should equal unique order count: 96,478)

--- EDA: Orders per customer ---
count    93358.000000
mean         1.033420
std          0.209097
min          1.000000
25%          1.000000
50%          1.000000
75%          1.000000
max         15.000000
Name: order_id, dtype: float64
Customers with exactly 1 order: 90,557 (97.00%)
Customers with 2+ orders (repeat customers): 2,801 (3.00%)

--- EDA: Order value distribution ---
count    96477.000000
mean       159.856357
std        218.813144
min          9.590000
25%         61.880000
50%        105.280000
75%        176.330000
max      13664.080000
Name: order_value, dtype: float64

--- EDA: Monthly order volume ---
order_purchase_timestamp
2016-09-30       1
2016-10-31     265
2016-11-30       0
2016-12-31       1
2017-01-31     750
2017-02-28    1653
2017-03-31    2546
2017-04-30    2303
2017-05-31    3546
2017-06-30    3135
2017-07-31    3872
2017-08-31    4193
2017-09-30    4150
2017-10-31    4478
2017-11-30    7289
2017-12-31    5513
2018-01-31    7069
2018-02-28    6555
2018-03-31    7003
2018-04-30    6798
2018-05-31    6749
2018-06-30    6099
2018-07-31    6159
2018-08-31    6351
Freq: ME

--- EDA: Day-of-week order volume ---
order_purchase_timestamp
Monday       15701
Tuesday      15503
Wednesday    15076
Thursday     14323
Friday       13685
Sunday       11635
Saturday     10555

--- EDA: Top 10 product categories by order-item count ---
product_category
bed_bath_table           10953
health_beauty             9465
sports_leisure            8431
furniture_decor           8160
computers_accessories     7644
housewares                6795
watches_gifts             5859
telephony                 4430
garden_tools              4268
auto                      4140

--- Repeat purchase behavior ---
Repeat customer rate: 3.00% (2,801 of 93,358)
Customers with computable purchase interval (2+ orders): 2,801
Average purchase interval across repeat customers: 80.6 days
Median purchase interval across repeat customers: 32.0 days

Note: purchase_frequency (orders/day) is only defined for customers with lifetime_days > 0 (i.e., repeat customers whose orders span multiple days). For one-time customers this is left as NaN rather than fabricated as 0 or 1, since a single order has no observable frequency.

--- Product/category engagement ---
       unique_products  unique_categories
count     93358.000000        93358.00000
mean          1.068843            1.02604
std           0.316919            0.17162
min           1.000000            1.00000
25%           1.000000            1.00000
50%           1.000000            1.00000
75%           1.000000            1.00000
max          14.000000            5.00000

--- Engagement score methodology ---
engagement_score = 100 * mean( minmax(total_orders), minmax(-recency_days), minmax(unique_categories) )
Equal weighting (1/3 each) chosen as a transparent, defensible default since no business-supplied weighting scheme was specified. Review-based signals excluded (data unavailable this run).
count    93358.000000
mean        22.552658
std          7.410014
min          0.000000
25%         17.340000
50%         23.330000
75%         28.240000
max         91.290000
Name: engagement_score, dtype: float64

Engagement category thresholds (tercile-based, project-defined): Low <= 19.92, Moderate <= 26.74, High > 26.74
engagement_category
Moderately Engaged    31706
Low Engagement        30884
Highly Engaged        30768

--- Customer value segments (median-split, project-defined rule) ---
Spend median: 107.78 | Order-count median: 1.0
value_segment
One-Time Customer           90557
High-Value Frequent          2467
High-Frequency Low-Value      334

--- Lifecycle stage rules (project-defined analytical categories, NOT an industry standard) ---
Inactive Customer: recency_days > 180 (regardless of order count)
Loyal/High-Activity Customer: total_orders >= 3 AND recency_days <= 180
Repeat Customer: total_orders == 2 AND recency_days <= 180
New Customer: total_orders == 1 AND recency_days <= 90
Active Customer: total_orders == 1 AND 90 < recency_days <= 180
lifecycle_stage
Inactive Customer                 55252
Active Customer                   19026
New Customer                      17845
Repeat Customer                    1110
Loyal / High-Activity Customer      125

Saved customer_behavior_engagement.csv: 93,358 rows (1 per customer_unique_id)
```
