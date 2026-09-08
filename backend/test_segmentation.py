from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=== 1. Testing Summary Endpoint ===")
    r = client.get("/api/v1/segmentation/summary")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    sum_data = r.json()
    print("Summary:", sum_data)
    assert sum_data["total_customers"] > 0
    assert sum_data["selected_k"] >= 2
    assert sum_data["silhouette_score"] > 0

    print("\n=== 2. Testing Clusters Endpoint ===")
    r = client.get("/api/v1/segmentation/clusters")
    assert r.status_code == 200
    clusters = r.json()
    print(f"Retrieved {len(clusters)} clusters")
    for c in clusters:
        print(f"  Cluster #{c['segment_id']}: {c['segment_name']} ({c['customer_count']} custs, {c['percentage_of_customers']}%, {c['color']})")
    assert len(clusters) == sum_data["selected_k"]

    print("\n=== 3. Testing Customers Pagination & Filter ===")
    r = client.get("/api/v1/segmentation/customers?page=1&page_size=10&sort_by=total_spend&sort_order=desc")
    assert r.status_code == 200
    cust_data = r.json()
    print(f"Total customers: {cust_data['total']}, returned: {len(cust_data['customers'])}")
    first_cust = cust_data["customers"][0]
    print(f"Top spend customer: #{first_cust['customer_id']} ({first_cust['segment_name']}, Spend: GBP {first_cust['total_spend']})")

    print("\n=== 4. Testing Metrics Endpoint (Elbow Curve) ===")
    r = client.get("/api/v1/segmentation/metrics")
    assert r.status_code == 200
    metrics = r.json()
    print("Metrics optimal K:", metrics["selected_k"], "Silhouette:", metrics["silhouette_score"])
    print("Elbow curve points:")
    for pt in metrics["elbow_curve"]:
        print(f"  K={pt['k']}: Inertia={pt['inertia']}, Silhouette={pt['silhouette_score']}")

    print("\n=== 5. Testing Single Customer Profile ===")
    cid = first_cust["customer_id"]
    r = client.get(f"/api/v1/segmentation/customers/{cid}")
    assert r.status_code == 200
    profile = r.json()
    print(f"Customer #{cid} profile: {profile['segment_name']}, strategy: {profile['strategy'][:50]}...")

    print("\n=== 6. Testing Real-Time Prediction ===")
    r = client.post("/api/v1/segmentation/predict", json={
        "purchase_frequency": 12.0,
        "total_spend": 8500.0,
        "recency": 3,
        "average_order_value": 750.0,
        "customer_activity": 95.0
    })
    assert r.status_code == 200
    pred = r.json()
    print("Predicted Segment for VIP profile:", pred["segment_name"])

    print("\n=== 7. Testing Retrain Endpoint ===")
    r = client.post("/api/v1/segmentation/train?min_k=2&max_k=8")
    assert r.status_code == 200
    train_res = r.json()
    print("Retrain result:", train_res["message"])

    print("\n[OK] ALL AUTOMATED TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
