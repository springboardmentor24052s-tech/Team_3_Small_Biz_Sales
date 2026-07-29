# Feature Engineering Log

- Revenue = Quantity * Price
- OrderYear, OrderMonth, OrderDay extracted from InvoiceDate
- DayOfWeek (name) and WeekNumber (ISO) extracted from InvoiceDate
- Quarter extracted from InvoiceDate
- MonthName and YearMonth (YYYY-MM) convenience fields added
- CustomerPurchaseFrequency = count of distinct invoices per CustomerID
- CustomerTotalSpend = sum of Revenue per CustomerID
- AverageOrderValue = CustomerTotalSpend / CustomerPurchaseFrequency
- No prediction labels or target variables were created (out of scope for Milestone 1).