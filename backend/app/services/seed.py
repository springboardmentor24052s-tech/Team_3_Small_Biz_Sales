from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from app.core.security import get_password_hash
from app.models.user import User, Role, Permission
from app.models.business import Customer, Product, Invoice
from app.models.ai import AnomalyAlert, Recommendation

def seed_database(db: Session):
    if db.query(User).first() is not None:
        return

    # 1. Seed Roles & Permissions
    roles_data = [
        {"name": "ADMIN", "description": "Sole System Administrator — User management & RBAC"},
        {"name": "OWNER", "description": "Business Owner — Full analytics, financial reports & AI insights"},
        {"name": "MANAGER", "description": "Store Manager — Product catalog & stock alerts"},
        {"name": "SALES", "description": "Sales Executive — Transaction entry & basic viewing"}
    ]
    role_objs = {}
    for r in roles_data:
        role = Role(name=r["name"], description=r["description"])
        db.add(role)
        role_objs[r["name"]] = role
    db.commit()

    # 2. Seed Distinct Users (Only ONE Admin)
    users_data = [
        ("admin@marketmind.ai", "admin123", "System Administrator", ["ADMIN"]),
        ("owner@marketmind.ai", "owner123", "Business Owner", ["OWNER"]),
        ("manager@marketmind.ai", "manager123", "Store Manager", ["MANAGER"]),
        ("sales@marketmind.ai", "sales123", "Sales Executive", ["SALES"])
    ]
    for email, pwd, name, roles in users_data:
        user = User(
            email=email,
            password_hash=get_password_hash(pwd),
            full_name=name,
            is_active=True
        )
        for r_name in roles:
            if r_name in role_objs:
                user.roles.append(role_objs[r_name])
        db.add(user)
    db.commit()

    # 3. Seed Products
    products_data = [
        {"stock_code": "85123A", "description": "WHITE HANGING HEART T-LIGHT HOLDER", "derived_category": "Home Décor", "current_price": 2.55, "units_sold": 2028, "units_returned": 304, "revenue": 5171.40},
        {"stock_code": "71053", "description": "WHITE METAL LANTERN", "derived_category": "Home Décor", "current_price": 3.39, "units_sold": 856, "units_returned": 68, "revenue": 2901.84},
        {"stock_code": "84406B", "description": "CREAM CUPID HEARTS COAT HANGER", "derived_category": "Home Décor", "current_price": 2.75, "units_sold": 1120, "units_returned": 73, "revenue": 3080.00},
        {"stock_code": "22423", "description": "REGENCY CAKESTAND 3 TIER", "derived_category": "Kitchenware", "current_price": 11.00, "units_sold": 1724, "units_returned": 18, "revenue": 18964.00},
        {"stock_code": "47566", "description": "PARTY BUNTING", "derived_category": "Party Supplies", "current_price": 4.00, "units_sold": 1532, "units_returned": 22, "revenue": 6128.00},
        {"stock_code": "84879", "description": "ASSORTED COLOUR BIRD ORNAMENT", "derived_category": "Home Décor", "current_price": 1.69, "units_sold": 1418, "units_returned": 15, "revenue": 2396.42},
        {"stock_code": "22633", "description": "HAND WARMER UNION JACK", "derived_category": "Gifts", "current_price": 1.85, "units_sold": 780, "units_returned": 45, "revenue": 1443.00},
        {"stock_code": "20725", "description": "LUNCH BAG RED RETROSPOT", "derived_category": "Bags", "current_price": 3.90, "units_sold": 1380, "units_returned": 28, "revenue": 5382.00},
        {"stock_code": "22086", "description": "PAPER CHAIN KIT 50S CHRISTMAS", "derived_category": "Stationery", "current_price": 2.95, "units_sold": 735, "units_returned": 38, "revenue": 2168.25},
        {"stock_code": "21212", "description": "PACK OF 72 RETROSPOT CAKE CASES", "derived_category": "Kitchenware", "current_price": 0.85, "units_sold": 1645, "units_returned": 12, "revenue": 1398.25},
        {"stock_code": "22469", "description": "HEART OF WICKER SMALL", "derived_category": "Home Décor", "current_price": 1.65, "units_sold": 420, "units_returned": 8, "revenue": 693.00},
        {"stock_code": "21977", "description": "PACK OF 60 PINK PAISLEY CAKE CASES", "derived_category": "Kitchenware", "current_price": 0.85, "units_sold": 910, "units_returned": 5, "revenue": 773.50}
    ]
    for p in products_data:
        db.add(Product(**p))
    db.commit()

    # 4. Seed Diverse Customers
    customers_data = [
        # VIP Tier
        {"customer_id": 17850, "country": "United Kingdom", "lifetime_value": 7840.0, "segment": "VIP Customers", "rfm_score": "5-5-5"},
        {"customer_id": 13047, "country": "United Kingdom", "lifetime_value": 6420.0, "segment": "VIP Customers", "rfm_score": "5-5-4"},
        {"customer_id": 14298, "country": "United Kingdom", "lifetime_value": 5890.0, "segment": "VIP Customers", "rfm_score": "5-5-4"},
        {"customer_id": 14646, "country": "Netherlands", "lifetime_value": 9210.0, "segment": "VIP Customers", "rfm_score": "5-5-5"},
        {"customer_id": 18102, "country": "United Kingdom", "lifetime_value": 8450.0, "segment": "VIP Customers", "rfm_score": "5-5-5"},

        # Loyal Repeat Buyers
        {"customer_id": 14527, "country": "United Kingdom", "lifetime_value": 3480.0, "segment": "Loyal Customers", "rfm_score": "4-5-4"},
        {"customer_id": 15311, "country": "Germany", "lifetime_value": 3120.0, "segment": "Loyal Customers", "rfm_score": "4-4-4"},
        {"customer_id": 14911, "country": "EIRE", "lifetime_value": 3890.0, "segment": "Loyal Customers", "rfm_score": "4-4-4"},
        {"customer_id": 15039, "country": "United Kingdom", "lifetime_value": 2980.0, "segment": "Loyal Customers", "rfm_score": "4-4-3"},
        {"customer_id": 17511, "country": "United Kingdom", "lifetime_value": 3250.0, "segment": "Loyal Customers", "rfm_score": "4-4-4"},
        {"customer_id": 12415, "country": "Australia", "lifetime_value": 3670.0, "segment": "Loyal Customers", "rfm_score": "4-4-4"},

        # High-Value Occasional Buyers (Big Baskets, Infrequent)
        {"customer_id": 12346, "country": "United Kingdom", "lifetime_value": 4500.0, "segment": "High-Value Occasional Customers", "rfm_score": "3-2-5"},
        {"customer_id": 15769, "country": "United Kingdom", "lifetime_value": 3950.0, "segment": "High-Value Occasional Customers", "rfm_score": "3-2-4"},
        {"customer_id": 16684, "country": "United Kingdom", "lifetime_value": 4120.0, "segment": "High-Value Occasional Customers", "rfm_score": "3-2-5"},
        {"customer_id": 13694, "country": "United Kingdom", "lifetime_value": 3600.0, "segment": "High-Value Occasional Customers", "rfm_score": "3-2-4"},

        # Frequent Budget Buyers (Many orders, low spend per order)
        {"customer_id": 16227, "country": "Netherlands", "lifetime_value": 1120.0, "segment": "Frequent Budget Customers", "rfm_score": "4-4-2"},
        {"customer_id": 16029, "country": "France", "lifetime_value": 1280.0, "segment": "Frequent Budget Customers", "rfm_score": "4-4-2"},
        {"customer_id": 13408, "country": "United Kingdom", "lifetime_value": 1050.0, "segment": "Frequent Budget Customers", "rfm_score": "4-4-2"},
        {"customer_id": 13798, "country": "United Kingdom", "lifetime_value": 980.0, "segment": "Frequent Budget Customers", "rfm_score": "4-3-2"},
        {"customer_id": 16422, "country": "Germany", "lifetime_value": 1180.0, "segment": "Frequent Budget Customers", "rfm_score": "4-4-2"},

        # Potential Loyalists / Growth
        {"customer_id": 14096, "country": "United Kingdom", "lifetime_value": 1780.0, "segment": "Potential Loyalists", "rfm_score": "4-3-3"},
        {"customer_id": 17404, "country": "Spain", "lifetime_value": 1920.0, "segment": "Potential Loyalists", "rfm_score": "4-3-3"},
        {"customer_id": 15061, "country": "United Kingdom", "lifetime_value": 1650.0, "segment": "Potential Loyalists", "rfm_score": "4-3-3"},
        {"customer_id": 17381, "country": "France", "lifetime_value": 1540.0, "segment": "Potential Loyalists", "rfm_score": "4-3-3"},

        # New Customers (Recent 1-2 orders)
        {"customer_id": 12583, "country": "United Kingdom", "lifetime_value": 380.0, "segment": "New Customers", "rfm_score": "5-1-2"},
        {"customer_id": 12748, "country": "United Kingdom", "lifetime_value": 420.0, "segment": "New Customers", "rfm_score": "5-1-2"},
        {"customer_id": 12820, "country": "United Kingdom", "lifetime_value": 310.0, "segment": "New Customers", "rfm_score": "5-1-1"},
        {"customer_id": 13113, "country": "Germany", "lifetime_value": 490.0, "segment": "New Customers", "rfm_score": "5-1-2"},
        {"customer_id": 13263, "country": "Spain", "lifetime_value": 290.0, "segment": "New Customers", "rfm_score": "5-1-1"},

        # At-Risk Customers (High prior spend, long recency)
        {"customer_id": 17548, "country": "EIRE", "lifetime_value": 3100.0, "segment": "At-Risk Customers", "rfm_score": "2-3-4"},
        {"customer_id": 13748, "country": "United Kingdom", "lifetime_value": 2850.0, "segment": "At-Risk Customers", "rfm_score": "1-3-3"},
        {"customer_id": 14688, "country": "United Kingdom", "lifetime_value": 2450.0, "segment": "At-Risk Customers", "rfm_score": "2-3-3"},
        {"customer_id": 15838, "country": "United Kingdom", "lifetime_value": 3300.0, "segment": "At-Risk Customers", "rfm_score": "1-3-4"},
        {"customer_id": 16754, "country": "France", "lifetime_value": 2950.0, "segment": "At-Risk Customers", "rfm_score": "1-3-3"},

        # Low-Engagement / Hibernating
        {"customer_id": 17809, "country": "United Kingdom", "lifetime_value": 520.0, "segment": "Low-Engagement Customers", "rfm_score": "1-1-1"},
        {"customer_id": 12431, "country": "Belgium", "lifetime_value": 480.0, "segment": "Low-Engagement Customers", "rfm_score": "1-1-1"},
        {"customer_id": 15764, "country": "Spain", "lifetime_value": 350.0, "segment": "Low-Engagement Customers", "rfm_score": "1-1-1"},
        {"customer_id": 17949, "country": "United Kingdom", "lifetime_value": 280.0, "segment": "Low-Engagement Customers", "rfm_score": "1-1-1"},
        {"customer_id": 18283, "country": "United Kingdom", "lifetime_value": 410.0, "segment": "Low-Engagement Customers", "rfm_score": "1-1-1"},
        {"customer_id": 16843, "country": "Germany", "lifetime_value": 320.0, "segment": "Low-Engagement Customers", "rfm_score": "1-1-1"},
        {"customer_id": 17139, "country": "United Kingdom", "lifetime_value": 260.0, "segment": "Low-Engagement Customers", "rfm_score": "1-1-1"},
        {"customer_id": 17675, "country": "United Kingdom", "lifetime_value": 390.0, "segment": "Low-Engagement Customers", "rfm_score": "1-1-1"},
    ]
    for c in customers_data:
        db.add(Customer(**c))
    db.commit()

    # 5. Seed Invoices (Generate authentic transactional timeline for all customers)
    invoices = []
    base_ref = datetime(2011, 12, 10, 12, 0)
    inv_counter = 536365

    # Customer profile invoice rules:
    # VIP: 12-18 invoices, recency 2-15 days, amounts £300-£1200
    vip_ids = [17850, 13047, 14298, 14646, 18102]
    for cid in vip_ids:
        c_obj = next(c for c in customers_data if c["customer_id"] == cid)
        n_inv = random.randint(12, 18)
        for i in range(n_inv):
            days_ago = random.randint(2, 60)
            inv_date = base_ref - timedelta(days=days_ago, hours=random.randint(1, 10))
            amt = round(random.uniform(350.0, 950.0), 2)
            invoices.append({
                "invoice_no": str(inv_counter),
                "customer_id": cid,
                "invoice_date": inv_date,
                "total_amount": amt,
                "item_count": random.randint(8, 25),
                "country": c_obj["country"],
                "is_return": False,
                "status": "completed"
            })
            inv_counter += 1

    # Loyal: 8-14 invoices, recency 10-45 days, amounts £180-£450
    loyal_ids = [14527, 15311, 14911, 15039, 17511, 12415]
    for cid in loyal_ids:
        c_obj = next(c for c in customers_data if c["customer_id"] == cid)
        n_inv = random.randint(8, 13)
        for i in range(n_inv):
            days_ago = random.randint(8, 90)
            inv_date = base_ref - timedelta(days=days_ago, hours=random.randint(1, 10))
            amt = round(random.uniform(180.0, 420.0), 2)
            invoices.append({
                "invoice_no": str(inv_counter),
                "customer_id": cid,
                "invoice_date": inv_date,
                "total_amount": amt,
                "item_count": random.randint(5, 16),
                "country": c_obj["country"],
                "is_return": False,
                "status": "completed"
            })
            inv_counter += 1

    # High-Value Occasional: 2-4 large invoices, recency 20-80 days, amounts £900-£2200
    hvo_ids = [12346, 15769, 16684, 13694]
    for cid in hvo_ids:
        c_obj = next(c for c in customers_data if c["customer_id"] == cid)
        n_inv = random.randint(2, 4)
        for i in range(n_inv):
            days_ago = random.randint(15, 85)
            inv_date = base_ref - timedelta(days=days_ago, hours=random.randint(1, 10))
            amt = round(random.uniform(900.0, 2100.0), 2)
            invoices.append({
                "invoice_no": str(inv_counter),
                "customer_id": cid,
                "invoice_date": inv_date,
                "total_amount": amt,
                "item_count": random.randint(20, 60),
                "country": c_obj["country"],
                "is_return": False,
                "status": "completed"
            })
            inv_counter += 1

    # Frequent Budget: 10-18 small invoices, recency 5-40 days, amounts £40-£120
    budget_ids = [16227, 16029, 13408, 13798, 16422]
    for cid in budget_ids:
        c_obj = next(c for c in customers_data if c["customer_id"] == cid)
        n_inv = random.randint(9, 15)
        for i in range(n_inv):
            days_ago = random.randint(5, 75)
            inv_date = base_ref - timedelta(days=days_ago, hours=random.randint(1, 10))
            amt = round(random.uniform(45.0, 110.0), 2)
            invoices.append({
                "invoice_no": str(inv_counter),
                "customer_id": cid,
                "invoice_date": inv_date,
                "total_amount": amt,
                "item_count": random.randint(2, 8),
                "country": c_obj["country"],
                "is_return": False,
                "status": "completed"
            })
            inv_counter += 1

    # Potential Loyalists: 4-7 invoices, recency 10-50 days, amounts £200-£450
    pot_ids = [14096, 17404, 15061, 17381]
    for cid in pot_ids:
        c_obj = next(c for c in customers_data if c["customer_id"] == cid)
        n_inv = random.randint(4, 7)
        for i in range(n_inv):
            days_ago = random.randint(10, 60)
            inv_date = base_ref - timedelta(days=days_ago, hours=random.randint(1, 10))
            amt = round(random.uniform(190.0, 410.0), 2)
            invoices.append({
                "invoice_no": str(inv_counter),
                "customer_id": cid,
                "invoice_date": inv_date,
                "total_amount": amt,
                "item_count": random.randint(4, 12),
                "country": c_obj["country"],
                "is_return": False,
                "status": "completed"
            })
            inv_counter += 1

    # New Customers: 1-2 recent invoices, recency 1-14 days, amounts £120-£350
    new_ids = [12583, 12748, 12820, 13113, 13263]
    for cid in new_ids:
        c_obj = next(c for c in customers_data if c["customer_id"] == cid)
        n_inv = random.randint(1, 2)
        for i in range(n_inv):
            days_ago = random.randint(1, 14)
            inv_date = base_ref - timedelta(days=days_ago, hours=random.randint(1, 10))
            amt = round(random.uniform(120.0, 320.0), 2)
            invoices.append({
                "invoice_no": str(inv_counter),
                "customer_id": cid,
                "invoice_date": inv_date,
                "total_amount": amt,
                "item_count": random.randint(2, 6),
                "country": c_obj["country"],
                "is_return": False,
                "status": "completed"
            })
            inv_counter += 1

    # At-Risk: 5-8 invoices in early 2011, last order 130-260 days ago
    atrisk_ids = [17548, 13748, 14688, 15838, 16754]
    for cid in atrisk_ids:
        c_obj = next(c for c in customers_data if c["customer_id"] == cid)
        n_inv = random.randint(5, 8)
        for i in range(n_inv):
            days_ago = random.randint(130, 260)
            inv_date = base_ref - timedelta(days=days_ago, hours=random.randint(1, 10))
            amt = round(random.uniform(320.0, 750.0), 2)
            invoices.append({
                "invoice_no": str(inv_counter),
                "customer_id": cid,
                "invoice_date": inv_date,
                "total_amount": amt,
                "item_count": random.randint(6, 18),
                "country": c_obj["country"],
                "is_return": False,
                "status": "completed"
            })
            inv_counter += 1

    # Low-Engagement / Hibernating: 1-2 old invoices, last order 180-320 days ago, amounts £70-£250
    hib_ids = [17809, 12431, 15764, 17949, 18283, 16843, 17139, 17675]
    for cid in hib_ids:
        c_obj = next(c for c in customers_data if c["customer_id"] == cid)
        n_inv = random.randint(1, 2)
        for i in range(n_inv):
            days_ago = random.randint(180, 310)
            inv_date = base_ref - timedelta(days=days_ago, hours=random.randint(1, 10))
            amt = round(random.uniform(70.0, 240.0), 2)
            invoices.append({
                "invoice_no": str(inv_counter),
                "customer_id": cid,
                "invoice_date": inv_date,
                "total_amount": amt,
                "item_count": random.randint(1, 5),
                "country": c_obj["country"],
                "is_return": False,
                "status": "completed"
            })
            inv_counter += 1

    # Add a few return invoices for realism
    returns_spec = [
        {"customer_id": 14527, "amt": -25.50, "items": 1, "country": "United Kingdom", "days_ago": 15},
        {"customer_id": 13748, "amt": -65.00, "items": 2, "country": "United Kingdom", "days_ago": 140},
        {"customer_id": 17850, "amt": -42.80, "items": 1, "country": "United Kingdom", "days_ago": 8},
    ]
    for r in returns_spec:
        invoices.append({
            "invoice_no": f"C{inv_counter}",
            "customer_id": r["customer_id"],
            "invoice_date": base_ref - timedelta(days=r["days_ago"]),
            "total_amount": r["amt"],
            "item_count": r["items"],
            "country": r["country"],
            "is_return": True,
            "status": "returned"
        })
        inv_counter += 1

    for inv in invoices:
        db.add(Invoice(**inv))
    db.commit()

    # 6. Seed Anomalies & Recommendations
    anomalies_data = [
        {"reference_type": "INVOICE", "reference_id": "536414", "alert_type": "PRICE_ZERO", "description": "Invoice contains items priced at £0.00", "severity_score": 9.2, "is_resolved": False},
        {"reference_type": "PRODUCT", "reference_id": "85123A", "alert_type": "HIGH_RETURN", "description": "WHITE HANGING HEART T-LIGHT HOLDER: 15% return rate (5x above average)", "severity_score": 7.8, "is_resolved": False},
        {"reference_type": "INVOICE", "reference_id": "541431", "alert_type": "LARGE_ORDER", "description": "Unusually large order: 2,000 units of single product", "severity_score": 6.5, "is_resolved": True},
        {"reference_type": "DATE", "reference_id": "2011-11-14", "alert_type": "REVENUE_SPIKE", "description": "Daily revenue 340% above 30-day moving average", "severity_score": 5.8, "is_resolved": True}
    ]
    for a in anomalies_data:
        db.add(AnomalyAlert(**a))
    db.commit()

    recs_data = [
        {"customer_id": 17850, "recommended_stock_code": "22423", "confidence_score": 0.92, "recommendation_type": "Cross-sell"},
        {"customer_id": 17850, "recommended_stock_code": "47566", "confidence_score": 0.87, "recommendation_type": "Frequently Bought Together"},
        {"customer_id": 13047, "recommended_stock_code": "85123A", "confidence_score": 0.89, "recommendation_type": "Cross-sell"}
    ]
    for rec in recs_data:
        db.add(Recommendation(**rec))
    db.commit()
