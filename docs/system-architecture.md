# MarketMind AI — System Architecture

## 1. High-Level Architecture Overview

MarketMind AI follows a **layered architecture** with clear separation of concerns between presentation, API, business logic, AI/ML, and data layers.

```mermaid
graph TB
    subgraph "Presentation Layer"
        WEB["🌐 ReactJS Frontend<br/>Notion-Inspired Design System"]
        MOBILE["📱 Responsive Web App"]
    end

    subgraph "API Gateway Layer"
        FASTAPI["⚡ FastAPI Backend<br/>RESTful API Endpoints"]
        AUTH_MW["🔐 Auth Middleware<br/>JWT + RBAC"]
    end

    subgraph "Business Logic Layer"
        SALES_SVC["💰 Sales Service"]
        INV_SVC["📦 Inventory Service"]
        CUST_SVC["👤 Customer Service"]
        INVOICE_SVC["🧾 Invoice Service"]
        UPLOAD_SVC["📁 Upload Service"]
    end

    subgraph "AI/ML Engine Layer"
        FORECAST["🔮 Forecasting Engine<br/>Prophet, XGBoost, RF"]
        SEGMENT["👥 Segmentation Module<br/>K-Means, Hierarchical"]
        CHURN["⚡ Churn Prediction<br/>RF, XGBoost, LogReg"]
        RECOMMEND["💡 Recommendation Engine<br/>Collaborative Filtering"]
        ANOMALY["🚨 Anomaly Detection<br/>Isolation Forest"]
    end

    subgraph "Data Layer"
        DB[(💾 PostgreSQL / SQLite)]
        CACHE["⚡ Cache Layer"]
        FILES["📁 File Storage<br/>CSV Uploads"]
    end

    WEB --> FASTAPI
    MOBILE --> FASTAPI
    FASTAPI --> AUTH_MW
    AUTH_MW --> SALES_SVC
    AUTH_MW --> INV_SVC
    AUTH_MW --> CUST_SVC
    AUTH_MW --> INVOICE_SVC
    AUTH_MW --> UPLOAD_SVC

    SALES_SVC --> FORECAST
    SALES_SVC --> ANOMALY
    CUST_SVC --> SEGMENT
    CUST_SVC --> CHURN
    CUST_SVC --> RECOMMEND
    INV_SVC --> ANOMALY

    SALES_SVC --> DB
    INV_SVC --> DB
    CUST_SVC --> DB
    INVOICE_SVC --> DB
    UPLOAD_SVC --> FILES
    FILES --> DB

    FORECAST --> DB
    SEGMENT --> DB
    CHURN --> DB
    RECOMMEND --> DB
    ANOMALY --> DB

    DB --> CACHE
```

---

## 2. Technology Stack

```mermaid
mindmap
  root((MarketMind AI))
    Frontend
      ReactJS
      Chart.js / Plotly
      Notion Design System
      Responsive CSS
    Backend
      Python 3.11+
      FastAPI
      Pydantic
      SQLAlchemy ORM
      Alembic Migrations
    Database
      SQLite - Dev
      PostgreSQL - Prod
    AI/ML
      Scikit-learn
      Prophet
      XGBoost
      TensorFlow
      Pandas / NumPy
    DevOps
      Docker
      Docker Compose
      GitHub Actions
      Render / Railway
    Tools
      VS Code
      Postman
      Git + GitHub
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | ReactJS | Component-based UI framework |
| **Styling** | CSS (Notion Design System) | Consistent, branded UI |
| **Charts** | Chart.js + Plotly | Interactive data visualizations |
| **Backend** | Python FastAPI | High-performance async API server |
| **ORM** | SQLAlchemy | Database abstraction layer |
| **Auth** | JWT + OAuth2 | Stateless authentication |
| **Database (Dev)** | SQLite | Lightweight local development |
| **Database (Prod)** | PostgreSQL | Production-grade relational DB |
| **ML - Forecasting** | Prophet, XGBoost, Random Forest | Time series & regression models |
| **ML - Clustering** | K-Means, Hierarchical | Customer segmentation |
| **ML - Classification** | RF, XGBoost, Logistic Regression | Churn prediction |
| **ML - Recommendations** | Collaborative Filtering, Apriori | Product suggestions |
| **ML - Anomaly** | Isolation Forest, Z-Score | Outlier detection |
| **Deployment** | Docker + Render/Railway | Containerized cloud deployment |
| **API Testing** | Postman | Endpoint validation |
| **Version Control** | Git + GitHub | Source code management |

---

## 3. Module Interaction Diagram

```mermaid
graph LR
    subgraph "User-Facing Modules"
        M1["👤 User Management<br/>Auth + RBAC"]
        M2["📁 Data Upload<br/>CSV Import"]
        M9["📊 Dashboard<br/>Analytics & Reports"]
    end

    subgraph "Core Business Modules"
        M3["💰 Sales Processing<br/>Aggregation + Revenue"]
        M4["📦 Inventory<br/>Tracking + Alerts"]
        M8["🧾 Invoice<br/>Management"]
    end

    subgraph "AI/ML Modules"
        M5["👥 Customer Segmentation<br/>Clustering + RFM"]
        M6["🔮 Forecasting Engine<br/>Revenue + Demand"]
        M7["⚡ Churn Prediction<br/>Retention Analysis"]
        M10["💡 Recommendations<br/>Cross-sell + Upsell"]
        M11["🚨 Anomaly Detection<br/>Fraud + Outliers"]
    end

    M1 --> M2
    M1 --> M9
    M2 --> M3
    M2 --> M4
    M3 --> M6
    M3 --> M11
    M3 --> M8
    M4 --> M11
    M3 --> M5
    M5 --> M7
    M5 --> M10
    M6 --> M9
    M7 --> M9
    M10 --> M9
    M11 --> M9
    M3 --> M9
    M4 --> M9
    M8 --> M9
```

---

## 4. Data Flow Architecture

```mermaid
flowchart TD
    subgraph "Data Ingestion"
        A["📁 CSV Upload"] --> B["✅ Schema Validation"]
        B --> C["🧹 Data Cleaning"]
        C --> D["💾 Database Storage"]
    end

    subgraph "Processing Pipeline"
        D --> E["📊 Sales Aggregation"]
        D --> F["📦 Inventory Updates"]
        D --> G["👤 Customer Profiling"]
    end

    subgraph "AI/ML Pipeline"
        E --> H["🔮 Forecasting Models"]
        E --> I["🚨 Anomaly Detection"]
        F --> I
        G --> J["👥 Segmentation"]
        G --> K["⚡ Churn Models"]
        G --> L["💡 Recommendation Engine"]
    end

    subgraph "Output Layer"
        H --> M["📈 Forecast Reports"]
        I --> N["🚨 Alert Dashboard"]
        J --> O["👥 Segment Profiles"]
        K --> P["⚡ Risk Scores"]
        L --> Q["💡 Product Suggestions"]
    end

    subgraph "Presentation"
        M --> R["📊 Analytics Dashboard"]
        N --> R
        O --> R
        P --> R
        Q --> R
        R --> S["📥 Downloadable Reports"]
    end
```

---

## 5. API Architecture

### 5.1 API Endpoint Structure

```
/api/v1/
├── auth/
│   ├── POST   /register          # User registration
│   ├── POST   /login             # JWT authentication
│   ├── POST   /logout            # Session invalidation
│   └── GET    /me                # Current user profile
│
├── users/
│   ├── GET    /                  # List users (Admin)
│   ├── GET    /{id}              # Get user details
│   ├── PUT    /{id}              # Update user
│   ├── DELETE /{id}              # Delete user (Admin)
│   └── PUT    /{id}/role         # Update role (Admin)
│
├── upload/
│   ├── POST   /sales             # Upload sales CSV
│   ├── POST   /inventory         # Upload inventory CSV
│   ├── POST   /customers         # Upload customer CSV
│   └── GET    /history           # Upload history
│
├── sales/
│   ├── GET    /                  # List transactions
│   ├── GET    /{id}              # Transaction details
│   ├── POST   /                  # Create transaction
│   ├── GET    /summary           # Sales aggregations
│   ├── GET    /trends            # Sales trends
│   └── GET    /by-category       # Category breakdown
│
├── inventory/
│   ├── GET    /                  # List inventory
│   ├── GET    /{id}              # Product stock details
│   ├── PUT    /{id}              # Update stock
│   ├── GET    /alerts            # Low-stock alerts
│   └── GET    /turnover          # Turnover analysis
│
├── customers/
│   ├── GET    /                  # List customers
│   ├── GET    /{id}              # Customer profile
│   ├── GET    /{id}/history      # Purchase history
│   └── GET    /segments          # Segment summary
│
├── invoices/
│   ├── GET    /                  # List invoices
│   ├── GET    /{id}              # Invoice details
│   ├── POST   /                  # Create invoice
│   ├── PUT    /{id}/status       # Update payment status
│   └── GET    /summary           # Invoice summary
│
├── ai/
│   ├── GET    /forecast/revenue  # Revenue forecast
│   ├── GET    /forecast/demand   # Demand forecast
│   ├── GET    /segments          # Customer segments
│   ├── GET    /churn/scores      # Churn probabilities
│   ├── GET    /churn/at-risk     # At-risk customers
│   ├── GET    /recommendations/{customer_id}  # Product recs
│   ├── GET    /anomalies         # Detected anomalies
│   └── POST   /retrain           # Retrain models (Admin)
│
└── reports/
    ├── GET    /sales              # Sales report
    ├── GET    /inventory          # Inventory report
    ├── GET    /customers          # Customer report
    ├── GET    /forecast           # Forecast report
    └── GET    /download/{type}    # Export as CSV/PDF
```

### 5.2 Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as FastAPI
    participant Auth as Auth Service
    participant DB as Database

    Client->>API: POST /auth/login {email, password}
    API->>Auth: Validate credentials
    Auth->>DB: Query user record
    DB-->>Auth: User + hashed password
    Auth->>Auth: Verify password hash
    Auth-->>API: Generate JWT token
    API-->>Client: {access_token, token_type, role}

    Client->>API: GET /sales (Authorization: Bearer <token>)
    API->>Auth: Validate JWT
    Auth->>Auth: Check role permissions
    Auth-->>API: Authorized (role: store_manager)
    API->>DB: Query sales data
    DB-->>API: Sales records
    API-->>Client: {sales: [...]}
```

---

## 6. Deployment Architecture

```mermaid
graph TB
    subgraph "Docker Compose"
        subgraph "Frontend Container"
            REACT["ReactJS App<br/>Port: 3000"]
        end

        subgraph "Backend Container"
            FAST["FastAPI Server<br/>Port: 8000"]
            UV["Uvicorn ASGI"]
        end

        subgraph "Database Container"
            PG["PostgreSQL<br/>Port: 5432"]
        end

        subgraph "Volumes"
            VOL_DATA["📁 data-volume"]
            VOL_MODELS["🤖 models-volume"]
        end
    end

    subgraph "Cloud Platform (Render/Railway)"
        LB["🌐 Load Balancer"]
        DNS["🔗 Custom Domain"]
    end

    DNS --> LB
    LB --> REACT
    REACT --> FAST
    FAST --> UV
    FAST --> PG
    FAST --> VOL_DATA
    FAST --> VOL_MODELS
```

### Docker Compose Configuration

```yaml
# docker-compose.yml (planned)
version: "3.9"
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/marketmind
      - JWT_SECRET=<secret>
    depends_on:
      - db
    volumes:
      - data-volume:/app/data
      - models-volume:/app/models

  db:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=marketmind
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
  data-volume:
  models-volume:
```

---

## 7. Project Directory Structure

```
marketmind/
├── frontend/                  # ReactJS Application
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level pages
│   │   ├── services/         # API client services
│   │   ├── context/          # React context (auth, theme)
│   │   ├── hooks/            # Custom hooks
│   │   ├── styles/           # CSS (Notion design tokens)
│   │   └── utils/            # Utility functions
│   ├── package.json
│   └── Dockerfile
│
├── backend/                   # FastAPI Application
│   ├── app/
│   │   ├── api/              # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── sales.py
│   │   │   ├── inventory.py
│   │   │   ├── customers.py
│   │   │   ├── invoices.py
│   │   │   ├── upload.py
│   │   │   ├── ai.py
│   │   │   └── reports.py
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   ├── ml/               # AI/ML modules
│   │   │   ├── forecasting.py
│   │   │   ├── segmentation.py
│   │   │   ├── churn.py
│   │   │   ├── recommendations.py
│   │   │   └── anomaly.py
│   │   ├── core/             # Config, security, deps
│   │   └── main.py           # FastAPI app entry
│   ├── requirements.txt
│   └── Dockerfile
│
├── data/
│   ├── raw/                  # Original CSV datasets
│   └── processed/            # Cleaned datasets
│
├── scripts/                  # Utility scripts
│   ├── generate_datasets.py
│   └── preprocess.py
│
├── docs/                     # Documentation
├── wireframes/               # UI wireframes
├── models/                   # Trained ML models
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 8. Security Architecture

### 8.1 Authentication
- **JWT (JSON Web Tokens)** with short-lived access tokens (15 min) and refresh tokens (7 days)
- **Password hashing** with bcrypt (12 rounds)
- **Rate limiting** on auth endpoints (5 attempts per minute)

### 8.2 Authorization (RBAC)
- Four predefined roles: `business_owner`, `store_manager`, `sales_executive`, `admin`
- Permission matrix enforced at API middleware level
- Role-based dashboard view filtering

### 8.3 Data Security
- HTTPS/TLS encryption in transit
- Database connection encryption
- Input validation with Pydantic schemas
- SQL injection prevention via ORM
- CORS policy configuration
- CSV upload size limits and type validation
