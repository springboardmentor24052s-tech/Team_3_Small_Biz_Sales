import pandas as pd


def generate_business_analytics(df: pd.DataFrame):
    """
    Generate business analytics from sales data.
    """

    data = df.copy()

    # Convert date column
    data["Order_Date"] = pd.to_datetime(
        data["Order_Date"],
        errors="coerce"
    )

    # Convert sales amount
    data["Total_Amount"] = pd.to_numeric(
        data["Total_Amount"],
        errors="coerce"
    )

    # Remove invalid records
    data = data.dropna(
        subset=[
            "Order_Date",
            "Total_Amount"
        ]
    )

    # -----------------------------------------
    # Total Revenue
    # -----------------------------------------

    total_revenue = float(
        data["Total_Amount"].sum()
    )

    # -----------------------------------------
    # Total Orders
    # -----------------------------------------

    if "Invoice_ID" in data.columns:

        total_orders = int(
            data["Invoice_ID"].nunique()
        )

    else:

        total_orders = int(
            len(data)
        )

    # -----------------------------------------
    # Total Quantity
    # -----------------------------------------

    if "Quantity" in data.columns:

        data["Quantity"] = pd.to_numeric(
            data["Quantity"],
            errors="coerce"
        )

        total_quantity = int(
            data["Quantity"].sum()
        )

    else:

        total_quantity = 0

    # -----------------------------------------
    # Average Order Value
    # -----------------------------------------

    if total_orders > 0:

        average_order_value = (
            total_revenue / total_orders
        )

    else:

        average_order_value = 0

    # -----------------------------------------
    # Monthly Revenue
    # -----------------------------------------

    data["Month"] = (
        data["Order_Date"]
        .dt.to_period("M")
        .astype(str)
    )

    monthly_revenue = (
        data.groupby("Month")["Total_Amount"]
        .sum()
        .reset_index()
    )

    monthly_revenue_result = []

    for _, row in monthly_revenue.iterrows():

        monthly_revenue_result.append({
            "month": row["Month"],
            "revenue": round(
                float(row["Total_Amount"]),
                2
            )
        })

    # -----------------------------------------
    # Top Products
    # -----------------------------------------

    top_products = []

    if "Product_ID" in data.columns:

        products = (
            data.groupby("Product_ID")[
                "Total_Amount"
            ]
            .sum()
            .sort_values(
                ascending=False
            )
            .head(10)
        )

        for product, revenue in products.items():

            top_products.append({
                "product_id": str(product),
                "revenue": round(
                    float(revenue),
                    2
                )
            })

    # -----------------------------------------
    # Final Report
    # -----------------------------------------

    return {

        "total_revenue": round(
            total_revenue,
            2
        ),

        "total_orders": total_orders,

        "total_quantity": total_quantity,

        "average_order_value": round(
            average_order_value,
            2
        ),

        "monthly_revenue":
            monthly_revenue_result,

        "top_products":
            top_products
    }