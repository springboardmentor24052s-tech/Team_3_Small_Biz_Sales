import os
import sys
from datetime import datetime

# Set console output encoding to utf-8 for Windows compatibility
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy import text
from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, Role, Permission, UserRole, RolePermission
from app.models.business import Customer, Product, Invoice, InvoiceItem
from app.models.ai import SalesForecast, AnomalyAlert, Recommendation

def init_db(drop_first: bool = False):
    print("=" * 60)
    print("[MarketMind AI] Database Initialization & Setup")
    print("=" * 60)

    if drop_first:
        print("[+] Dropping existing database tables...")
        Base.metadata.drop_all(bind=engine)

    print("[+] Creating database tables from ORM metadata...")
    Base.metadata.create_all(bind=engine)
    print("[✓] Tables created successfully.")

    db = SessionLocal()
    try:
        # 1. Seed Roles & Permissions
        print("[+] Seeding Roles & Permissions...")
        roles_spec = [
            ("ADMIN", "Sole System Administrator — User management, RBAC, system config"),
            ("OWNER", "Business Owner — Full analytics, financial reports, AI insights"),
            ("MANAGER", "Store Manager — Product catalog, stock alerts, operational reports"),
            ("SALES", "Sales Executive — Transaction entry & basic customer view")
        ]
        
        role_objs = {}
        for role_name, desc in roles_spec:
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(name=role_name, description=desc)
                db.add(role)
                db.flush()
            role_objs[role_name] = role

        permissions_spec = [
            ("view_dashboard", "dashboard", "read"),
            ("view_sales", "sales", "read"),
            ("manage_inventory", "inventory", "write"),
            ("view_customers", "customers", "read"),
            ("manage_users", "users", "write"),
            ("view_ai", "ai_insights", "read")
        ]
        for p_name, res, act in permissions_spec:
            perm = db.query(Permission).filter(Permission.name == p_name).first()
            if not perm:
                perm = Permission(name=p_name, resource=res, action=act)
                db.add(perm)
                db.flush()
                # Assign all permissions to ADMIN & OWNER
                for r_name in ["ADMIN", "OWNER"]:
                    if perm not in role_objs[r_name].permissions:
                        role_objs[r_name].permissions.append(perm)

        # 2. Seed Default Users (Distinct Admin, Owner, Manager, Sales)
        print("[+] Seeding System Users (Single Admin, Owner, Manager, Sales)...")
        users_spec = [
            ("admin@marketmind.ai", "admin123", "System Administrator", ["ADMIN"]),
            ("owner@marketmind.ai", "owner123", "Business Owner", ["OWNER"]),
            ("manager@marketmind.ai", "manager123", "Store Manager", ["MANAGER"]),
            ("sales@marketmind.ai", "sales123", "Sales Executive", ["SALES"])
        ]
        for email, pwd, name, roles in users_spec:
            user = db.query(User).filter(User.email == email).first()
            if not user:
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

        # 3. Seed Products (UCI Online Retail StockCodes)
        print("[+] Seeding Products & Inventory Catalog...")
        products_spec = [
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
        for p_data in products_spec:
            if not db.query(Product).filter(Product.stock_code == p_data["stock_code"]).first():
                db.add(Product(**p_data))

        # 4. Seed Customers (RFM Profiles)
        print("[+] Seeding Customer Directory & RFM Profiles...")
        customers_spec = [
            {"customer_id": 17850, "country": "United Kingdom", "lifetime_value": 4287.0, "segment": "Champions", "rfm_score": "5-5-5"},
            {"customer_id": 13047, "country": "United Kingdom", "lifetime_value": 3650.0, "segment": "Champions", "rfm_score": "5-5-4"},
            {"customer_id": 14298, "country": "United Kingdom", "lifetime_value": 3200.0, "segment": "Champions", "rfm_score": "5-4-4"},
            {"customer_id": 14527, "country": "United Kingdom", "lifetime_value": 2980.0, "segment": "Loyal Customers", "rfm_score": "4-4-4"},
            {"customer_id": 15311, "country": "Germany", "lifetime_value": 2450.0, "segment": "Loyal Customers", "rfm_score": "4-4-3"},
            {"customer_id": 16227, "country": "Netherlands", "lifetime_value": 1920.0, "segment": "Potential Loyalists", "rfm_score": "4-3-3"},
            {"customer_id": 16029, "country": "France", "lifetime_value": 1800.0, "segment": "Potential Loyalists", "rfm_score": "5-2-3"},
            {"customer_id": 12583, "country": "United Kingdom", "lifetime_value": 950.0, "segment": "New Customers", "rfm_score": "5-1-2"},
            {"customer_id": 17548, "country": "EIRE", "lifetime_value": 3100.0, "segment": "At Risk", "rfm_score": "2-3-4"},
            {"customer_id": 13748, "country": "United Kingdom", "lifetime_value": 2650.0, "segment": "At Risk", "rfm_score": "1-3-3"},
            {"customer_id": 14688, "country": "United Kingdom", "lifetime_value": 1250.0, "segment": "Need Attention", "rfm_score": "3-2-2"},
            {"customer_id": 18102, "country": "Spain", "lifetime_value": 1100.0, "segment": "About to Sleep", "rfm_score": "2-2-2"},
            {"customer_id": 17809, "country": "United Kingdom", "lifetime_value": 800.0, "segment": "Hibernating", "rfm_score": "1-1-1"},
            {"customer_id": 12431, "country": "Belgium", "lifetime_value": 580.0, "segment": "Lost", "rfm_score": "1-1-1"},
            {"customer_id": 15764, "country": "Spain", "lifetime_value": 420.0, "segment": "Lost", "rfm_score": "1-1-1"}
        ]
        for c_data in customers_spec:
            if not db.query(Customer).filter(Customer.customer_id == c_data["customer_id"]).first():
                db.add(Customer(**c_data))

        # 5. Seed Invoices & Line Items
        print("[+] Seeding Transactions & Invoices...")
        invoices_spec = [
            {"invoice_no": "536365", "customer_id": 17850, "invoice_date": datetime(2011, 12, 1, 8, 26), "total_amount": 139.12, "item_count": 7, "country": "United Kingdom", "is_return": False, "status": "completed"},
            {"invoice_no": "536366", "customer_id": 17850, "invoice_date": datetime(2011, 12, 1, 8, 28), "total_amount": 22.20, "item_count": 2, "country": "United Kingdom", "is_return": False, "status": "completed"},
            {"invoice_no": "536367", "customer_id": 13047, "invoice_date": datetime(2011, 12, 1, 8, 34), "total_amount": 278.73, "item_count": 12, "country": "United Kingdom", "is_return": False, "status": "completed"},
            {"invoice_no": "536368", "customer_id": 13047, "invoice_date": datetime(2011, 12, 1, 9, 1), "total_amount": 70.05, "item_count": 4, "country": "United Kingdom", "is_return": False, "status": "completed"},
            {"invoice_no": "C536379", "customer_id": 14527, "invoice_date": datetime(2011, 12, 1, 9, 45), "total_amount": -19.50, "item_count": 1, "country": "United Kingdom", "is_return": True, "status": "returned"},
            {"invoice_no": "536384", "customer_id": 15311, "invoice_date": datetime(2011, 12, 1, 10, 3), "total_amount": 342.60, "item_count": 16, "country": "Germany", "is_return": False, "status": "completed"},
            {"invoice_no": "536386", "customer_id": 16029, "invoice_date": datetime(2011, 12, 1, 10, 18), "total_amount": 168.90, "item_count": 8, "country": "France", "is_return": False, "status": "completed"},
            {"invoice_no": "536389", "customer_id": 12583, "invoice_date": datetime(2011, 12, 1, 10, 30), "total_amount": 487.32, "item_count": 24, "country": "United Kingdom", "is_return": False, "status": "completed"},
            {"invoice_no": "536391", "customer_id": 17548, "invoice_date": datetime(2011, 12, 1, 10, 48), "total_amount": 89.75, "item_count": 5, "country": "EIRE", "is_return": False, "status": "completed"},
            {"invoice_no": "C536392", "customer_id": 13748, "invoice_date": datetime(2011, 12, 1, 11, 0), "total_amount": -45.60, "item_count": 3, "country": "United Kingdom", "is_return": True, "status": "returned"}
        ]
        for inv_data in invoices_spec:
            if not db.query(Invoice).filter(Invoice.invoice_no == inv_data["invoice_no"]).first():
                db.add(Invoice(**inv_data))

        # 6. Seed Anomaly Alerts & Recommendations
        print("[+] Seeding AI Output Tables (Forecasts, Anomaly Alerts, Recommendations)...")
        anomalies_spec = [
            {"reference_type": "INVOICE", "reference_id": "536414", "alert_type": "PRICE_ZERO", "description": "Invoice contains items priced at £0.00", "severity_score": 9.2, "is_resolved": False},
            {"reference_type": "PRODUCT", "reference_id": "85123A", "alert_type": "HIGH_RETURN", "description": "WHITE HANGING HEART T-LIGHT HOLDER: 15% return rate (5x above average)", "severity_score": 7.8, "is_resolved": False},
            {"reference_type": "INVOICE", "reference_id": "541431", "alert_type": "LARGE_ORDER", "description": "Unusually large order: 2,000 units of single product", "severity_score": 6.5, "is_resolved": True},
            {"reference_type": "DATE", "reference_id": "2011-11-14", "alert_type": "REVENUE_SPIKE", "description": "Daily revenue 340% above 30-day moving average", "severity_score": 5.8, "is_resolved": True}
        ]
        for a_data in anomalies_spec:
            if not db.query(AnomalyAlert).filter(AnomalyAlert.reference_id == a_data["reference_id"]).first():
                db.add(AnomalyAlert(**a_data))

        recs_spec = [
            {"customer_id": 17850, "recommended_stock_code": "22423", "confidence_score": 0.92, "recommendation_type": "Cross-sell"},
            {"customer_id": 17850, "recommended_stock_code": "47566", "confidence_score": 0.87, "recommendation_type": "Frequently Bought Together"},
            {"customer_id": 13047, "recommended_stock_code": "85123A", "confidence_score": 0.89, "recommendation_type": "Cross-sell"}
        ]
        for r_data in recs_spec:
            if not db.query(Recommendation).filter(Recommendation.customer_id == r_data["customer_id"], Recommendation.recommended_stock_code == r_data["recommended_stock_code"]).first():
                db.add(Recommendation(**r_data))

        db.commit()

        print("\n[+] Database Setup Summary:")
        print("-" * 40)
        print(f"  • Users:           {db.query(User).count()}")
        print(f"  • Roles:           {db.query(Role).count()}")
        print(f"  • Permissions:     {db.query(Permission).count()}")
        print(f"  • Products:        {db.query(Product).count()}")
        print(f"  • Customers:       {db.query(Customer).count()}")
        print(f"  • Invoices:        {db.query(Invoice).count()}")
        print(f"  • Anomalies:       {db.query(AnomalyAlert).count()}")
        print(f"  • Recommendations: {db.query(Recommendation).count()}")
        print("-" * 40)
        print("[✓] Database setup completed successfully!\n")

    except Exception as e:
        db.rollback()
        print(f"[X] Database setup error: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    drop_flag = "--reset" in sys.argv or "--recreate" in sys.argv
    init_db(drop_first=drop_flag)
