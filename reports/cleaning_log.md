# Data Cleaning Log

- Starting rows: 1,067,371
- Removed 34,335 duplicate rows -> 1,033,036 remaining
- Removed 19,104 cancelled invoice rows -> 1,013,932 remaining
- Removed 234,437 rows with missing CustomerID -> 779,495 remaining
- Removed 0 rows with quantity <= 0 -> 779,495 remaining
- Removed 70 rows with price <= 0 -> 779,425 remaining
- Filled 0 missing descriptions (StockCode lookup, fallback 'UNKNOWN PRODUCT')
- Confirmed InvoiceDate as datetime64 dtype
- Cast CustomerID/Invoice/StockCode to string types (CustomerID as clean integer-string ID)
- Index reset. Final clean row count: 779,425