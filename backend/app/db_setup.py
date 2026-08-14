import os
import sys
from datetime import datetime

# Set console output encoding to utf-8 for Windows compatibility
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from sqlalchemy import text
from app.core.database import engine, Base, SessionLocal
from app.models.user import User, Role, Permission, UserRole, RolePermission
from app.models.business import Customer, Product, Invoice, InvoiceItem
from app.models.ai import SalesForecast, AnomalyAlert, Recommendation
from app.services.seed import seed_database

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
        if drop_first or db.query(User).first() is None:
            print("[+] Seeding database with initial users, catalog, customers, and transactions...")
            seed_database(db)
        
        print("\n[+] Database Setup Summary:")
        print("-" * 40)
        print(f"  • Users:           {db.query(User).count()}")
        print(f"  • Roles:           {db.query(Role).count()}")
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
