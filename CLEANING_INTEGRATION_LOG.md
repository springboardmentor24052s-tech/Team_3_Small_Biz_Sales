# Data Cleaning & Integration Log

Raw row counts: customers=99441, orders=99441, order_items=112650, payments=103886, products=32951, cat_trans=71
Duplicate customer_id rows: 0
Duplicate order_id rows: 0
Fully duplicated order_item rows: 0
Duplicate product_id rows: 0

--- Missing value analysis (key fields) ---
orders.order_purchase_timestamp: missing=0 (0.00%)
orders.customer_id: missing=0 (0.00%)
orders.order_status: missing=0 (0.00%)
order_items.order_id: missing=0 (0.00%)
order_items.product_id: missing=0 (0.00%)
order_items.price: missing=0 (0.00%)
order_items.freight_value: missing=0 (0.00%)
payments.order_id: missing=0 (0.00%)
payments.payment_value: missing=0 (0.00%)
products.product_id: missing=0 (0.00%)
products.product_category_name: missing=610 (1.85%)
Dropped 0 orders with missing order_purchase_timestamp (0.000% of orders). Decision: these rows cannot support any temporal/RFM feature and are excluded rather than imputed, since a fabricated purchase date would bias recency and frequency metrics.
Filled missing product_category_name with 'category_not_informed' (kept the product/order rows since price and transaction validity are unaffected by a missing category label).

--- Order status distribution (before filtering) ---
  delivered: 96,478 (97.02%)
  shipped: 1,107 (1.11%)
  canceled: 625 (0.63%)
  unavailable: 609 (0.61%)
  invoiced: 314 (0.32%)
  processing: 301 (0.30%)
  created: 5 (0.01%)
  approved: 2 (0.00%)

DECISION: Using order_status == 'delivered' as the valid-purchase definition for all behavioral/RFM/monetary features. Rationale: 'delivered' is the only status confirming the transaction was fully completed and the customer received the product; canceled/unavailable orders never resulted in a real purchase, and in-transit statuses (shipped/invoiced/processing) are not yet finalized as of the dataset snapshot. Orders retained: 96,478 of 99,441 (97.02%).

--- Integration / joins ---
orders_valid (96478) + customers -> 96478 rows (expect equal; m:1 validated)
+ order_items -> 110197 rows (order-item grain; orders without items dropped via inner join)
Orders with no matching order_items (excluded by inner join): 0
+ products -> 110197 rows (row count unchanged; left join on product attributes)
+ category translation -> 110197 rows (row count unchanged)
Aggregated payments: 103886 raw rows -> 99440 order-level rows (summed payment_value per order_id to prevent many-to-many duplication when joined to order_items).
+ payments (aggregated) -> 110197 rows (row count unchanged; m:1 validated -> no duplication)
Order-items with no matching payment record: 3 (0.003%)
Negative price rows: 0 | Negative freight rows: 0

Final integrated transaction-level dataset: 110,197 rows, 93,358 unique customers, 96,478 unique orders.
Saved to outputs/cleaned/olist_customer_transactions.csv