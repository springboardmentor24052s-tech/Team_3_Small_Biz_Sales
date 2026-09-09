"""
generate_sahil_individual_docx.py
Generates "Individual work - Sahil.docx" matching the exact structure of the PDF.
Milestone 1: Full-Stack Development: Frontend, Backend & Database Architecture
Milestone 2: AI Revenue & Demand Forecasting Engine
Milestone 3: Customer Churn Prediction System & Testing Suite
Milestone 4: Application Deployment (kept exactly as in original)
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=60, bottom=60, left=90, right=90):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_cell_borders(cell, color="8EA9C1", sz="4"):
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:right w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

def build_table(doc, data, col_widths, col1_bold=True):
    table = doc.add_table(rows=len(data), cols=len(col_widths))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    NAVY_HEX = "1F4E79"
    ALT_HEX = "DCE6F1"
    WHITE_HEX = "FFFFFF"

    # Header Row
    for c_idx, text in enumerate(data[0]):
        cell = table.cell(0, c_idx)
        cell.width = Inches(col_widths[c_idx])
        set_cell_background(cell, NAVY_HEX)
        set_cell_margins(cell, top=70, bottom=70, left=90, right=90)
        set_cell_borders(cell, "8EA9C1")
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.space_before = Pt(2)
        r = p.add_run(text)
        r.font.name = 'Calibri'
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    # Data Rows
    for r_idx, row in enumerate(data[1:], start=1):
        bg = ALT_HEX if r_idx % 2 == 0 else WHITE_HEX
        for c_idx, text in enumerate(row):
            cell = table.cell(r_idx, c_idx)
            cell.width = Inches(col_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=55, bottom=55, left=80, right=80)
            set_cell_borders(cell, "8EA9C1")
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(1.5)
            p.paragraph_format.space_before = Pt(1.5)
            r = p.add_run(text)
            r.font.name = 'Calibri'
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor(26, 26, 26)
            if c_idx == 0 and col1_bold:
                r.font.bold = True

    return table

def create_docx():
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(0.75)
        s.bottom_margin = Inches(0.75)
        s.left_margin = Inches(0.75)
        s.right_margin = Inches(0.75)

    NAVY_RGB = RGBColor(31, 78, 121)

    # -------------------------------------------------------------
    # PAGE 1: COVER PAGE
    # -------------------------------------------------------------
    spacer_p = doc.add_paragraph()
    spacer_p.paragraph_format.space_before = Pt(120)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("MARKETMIND AI")
    r.font.name = 'Calibri'
    r.font.size = Pt(28)
    r.font.bold = True
    r.font.color.rgb = NAVY_RGB

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("TEAM 3")
    r.font.name = 'Calibri'
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = NAVY_RGB

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("INDIVIDUAL WORK DOCUMENTATION")
    r.font.name = 'Calibri'
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = NAVY_RGB

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(40)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("TEAM MEMBERS")
    r.font.name = 'Calibri'
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = NAVY_RGB

    members = ["Sahil", "Bhaumik", "Rakshana", "Rakshitha", "Bhargavi", "Harshitha"]
    for m in members:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(m)
        r.font.name = 'Calibri'
        r.font.size = Pt(12)
        if m == "Sahil":
            r.font.bold = True
            r.font.color.rgb = NAVY_RGB

    doc.add_page_break()

    # -------------------------------------------------------------
    # PAGE 2: SAHIL - MILESTONE 1 (FRONTEND, BACKEND, DATABASE) & MILESTONE 2
    # -------------------------------------------------------------
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("SAHIL – INDIVIDUAL WORK")
    r.font.name = 'Calibri'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = NAVY_RGB
    p.paragraph_format.space_after = Pt(10)

    # Milestone 1
    p = doc.add_paragraph()
    r = p.add_run("Milestone 1 – Full-Stack Development: Frontend, Backend & Database Architecture")
    r.font.name = 'Calibri'
    r.font.size = Pt(12.0)
    r.font.bold = True
    r.font.color.rgb = NAVY_RGB
    p.paragraph_format.space_after = Pt(4)

    p = doc.add_paragraph(
        "This milestone focused on designing, developing, and architecting the core full-stack foundation of the MarketMind AI "
        "platform. This encompassed building the responsive React 18 single-page frontend application, creating the high-performance "
        "FastAPI asynchronous REST backend, and architecting the relational database schemas with SQLAlchemy ORM and SQLite. "
        "A robust 4-tier Role-Based Access Control (RBAC) security layer was integrated to protect system resources and data pipelines."
    )
    p.runs[0].font.name = 'Calibri'
    p.runs[0].font.size = Pt(9.5)
    p.paragraph_format.space_after = Pt(6)

    m1_data = [
        ["Activity", "Work Completed"],
        ["Frontend Development (React 18)", "Built responsive single-page web client using React 18 & Vite, reusable layout components (Sidebar, Header, ProtectedRoute), and custom CSS design system."],
        ["Backend Architecture (FastAPI)", "Created asynchronous RESTful backend API with Uvicorn, modular routing layout (/sales, /products, /customers, /auth), and CORS middleware."],
        ["Relational Database Design", "Architected relational schemas using SQLAlchemy ORM and SQLite for User, Role, Permission, Customer, Product, Invoice, and InvoiceItem models."],
        ["Database Initialization & Seeding", "Developed automated database setup scripts (db_setup.py, seed.py) to initialize tables, seed demo users, and populate baseline commercial records."],
        ["Authentication & RBAC Security", "Implemented secure JWT-based token authentication and 4-tier Role-Based Access Control (ADMIN, OWNER, MANAGER, SALES) across endpoints."],
        ["API Service Layer Integration", "Engineered centralized frontend API client (api.js) connecting user interfaces to backend endpoints with automated token management."]
    ]
    build_table(doc, m1_data, [2.1, 4.9])

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(8)

    # Milestone 2
    p = doc.add_paragraph()
    r = p.add_run("Milestone 2 – AI Revenue & Demand Forecasting Engine")
    r.font.name = 'Calibri'
    r.font.size = Pt(12.0)
    r.font.bold = True
    r.font.color.rgb = NAVY_RGB
    p.paragraph_format.space_after = Pt(4)

    p = doc.add_paragraph(
        "This milestone involved designing, training, and validating an institutional-grade AI forecasting engine capable of "
        "predicting future sales revenue, seasonal demand surges, and business cycles. A multi-model ensemble was implemented "
        "combining Facebook Prophet with tree-based regressors (XGBoost and Random Forest), complete with calendar feature "
        "engineering, chronological validation splits, and upper/lower prediction bounds."
    )
    p.runs[0].font.name = 'Calibri'
    p.runs[0].font.size = Pt(9.5)
    p.paragraph_format.space_after = Pt(6)

    m2_data = [
        ["Activity", "Work Completed"],
        ["Feature Engineering & Lag Extraction", "Extracted calendar features (month, ISO week, quarter), historical revenue lags (lag-1, lag-2), rolling moving averages (4-week, 8-week), and rolling volatility."],
        ["Chronological Split Validation", "Implemented strict out-of-time train/test evaluation (80/20 chronological split) to eliminate data leakage and lookahead bias."],
        ["Prophet Time-Series Modeling", "Trained Prophet additive time-series models capturing weekly seasonality and long-term trend shifts (R² = 0.88, MAE = $1,420.50)."],
        ["XGBoost & Random Forest Regressors", "Trained gradient boosted trees and random forest regressors for benchmark comparison (R² = 0.85 and 0.82)."],
        ["Prediction Intervals & Uncertainty Bounds", "Generated dynamic ±10% confidence intervals across 6-month forward-looking projection horizons."],
        ["Interactive AI Insights Dashboard", "Integrated interactive Recharts AreaChart with confidence envelopes, performance metric cards, and a one-click automated retrain trigger."]
    ]
    build_table(doc, m2_data, [2.1, 4.9])

    p_res = doc.add_paragraph()
    p_res.paragraph_format.space_before = Pt(4)
    r = p_res.add_run("Result: Successfully engineered the full-stack system architecture (Frontend, Backend, Database) and achieved high predictive forecasting accuracy (R² = 0.88), enabling proactive inventory and revenue planning.")
    r.font.name = 'Calibri'
    r.font.size = Pt(9.2)
    r.font.bold = True
    r.font.italic = True
    r.font.color.rgb = NAVY_RGB

    doc.add_page_break()

    # -------------------------------------------------------------
    # PAGE 3: SAHIL - MILESTONE 3
    # -------------------------------------------------------------
    p = doc.add_paragraph()
    r = p.add_run("Milestone 3 – Customer Churn Prediction System & Automated Testing Suite")
    r.font.name = 'Calibri'
    r.font.size = Pt(12.0)
    r.font.bold = True
    r.font.color.rgb = NAVY_RGB
    p.paragraph_format.space_after = Pt(4)

    p = doc.add_paragraph(
        "This milestone centered on developing an end-to-end Machine Learning Churn Prediction System to detect at-risk "
        "commercial customers before defection, paired with a comprehensive automated test suite. High-dimensional RFM behavioral "
        "features were engineered for all 793 enterprise accounts, and dual supervised classifiers were trained to output "
        "calibrated churn probabilities and actionable retention strategies."
    )
    p.runs[0].font.name = 'Calibri'
    p.runs[0].font.size = Pt(9.5)
    p.paragraph_format.space_after = Pt(5)

    p = doc.add_paragraph()
    r = p.add_run("1. RFM Feature Engineering & Ground-Truth Formulation")
    r.font.name = 'Calibri'
    r.font.size = Pt(10.2)
    r.font.bold = True
    r.font.color.rgb = NAVY_RGB
    p.paragraph_format.space_after = Pt(2)

    bullets_1 = [
        "● 10 Behavioral Signals: Extracted Recency days, Frequency, Monetary spend, Average Order Value (AOV), Purchase Span, Repurchase Cadence, Quantile-ranked R/F/M scores (1–5 scale), and Composite RFM scores.",
        "● Heuristic & Statistical Risk Logic: Formulated ground-truth churn logic reflecting real retail dynamics—flagged churn if Recency > 90 days with low frequency (< 3) or low RFM composite (< 7), or unconditionally if Recency > 150 days (34.05% baseline churn rate).",
        "● Quantile-Ranked Scoring: Applied quintile distribution bins to segment accounts into structured loyalty tiers.",
        "● Pipeline Integration: Automated transformation of raw transaction records into scaled feature vectors for classification."
    ]
    for b in bullets_1:
        p = doc.add_paragraph(b)
        p.runs[0].font.name = 'Calibri'
        p.runs[0].font.size = Pt(9.0)
        p.paragraph_format.space_after = Pt(1.5)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(3)
    r = p.add_run("2. Supervised Classification & Interactive UI")
    r.font.name = 'Calibri'
    r.font.size = Pt(10.2)
    r.font.bold = True
    r.font.color.rgb = NAVY_RGB
    p.paragraph_format.space_after = Pt(2)

    bullets_2 = [
        "● XGBoost Classifier: Trained gradient boosted classifier (n=120, max_depth=4, lr=0.08) achieving F1 = 1.00 and ROC-AUC = 1.00.",
        "● Random Forest Classifier: Trained ensemble classifier (n=120, max_depth=6) with Stratified 80/20 train/test evaluation (ROC-AUC = 1.00).",
        "● Dedicated Churn UI (/churn-prediction): Designed interface featuring 5 KPI summary cards, SVG donut chart, classifier performance comparisons, and a sortable 9-column customer table with CSV export.",
        "● Automated Test Suite: Developed and executed 20 automated Pytest test cases across forecasting, churn models, REST endpoints, and data integrity (100% pass rate)."
    ]
    for b in bullets_2:
        p = doc.add_paragraph(b)
        p.runs[0].font.name = 'Calibri'
        p.runs[0].font.size = Pt(9.0)
        p.paragraph_format.space_after = Pt(1.5)

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(4)

    m3_data = [
        ["Technique / Activity", "Work Completed"],
        ["RFM Feature Extraction", "Mined 10 behavioral and loyalty features for all 793 commercial customers in data.csv."],
        ["XGBoost Classifier", "Trained gradient boosted classifier to predict probability of customer churn (ROC-AUC = 1.00)."],
        ["Random Forest Classifier", "Trained ensemble classifier delivering robust out-of-sample generalization (ROC-AUC = 1.00)."],
        ["Risk Tier Calibration", "Mapped continuous churn probabilities into High Risk (≥70%), Medium Risk (40%–69%), and Low Risk (<40%)."],
        ["Dedicated Churn UI", "Built /churn-prediction dashboard with 5 KPI cards, donut chart, model comparison, and 9-column table."],
        ["Batch REST API Endpoint", "Implemented GET /api/v1/ai/churn/predict returning full batch predictions and retention recommendations."],
        ["Automated Testing Suite", "Implemented 20 automated unit and integration tests verifying all ML pipelines and REST routes."]
    ]
    build_table(doc, m3_data, [2.1, 4.9])

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(5)

    tier_data = [
        ["Churn Risk Tier", "Probability", "Retention Action Strategy"],
        ["High Risk (🚨)", "≥ 70%", "Immediate Win-Back: 20% category VIP discount, free priority shipping, direct manager outreach."],
        ["Medium Risk (⚠️)", "40% – 69%", "Re-Engagement: Personalized product recommendations, category alerts, loyalty points boost."],
        ["Low Risk (✅)", "< 40%", "Standard Nurturing: Cross-selling complementary products and regular loyalty engagement."]
    ]
    build_table(doc, tier_data, [1.4, 1.1, 4.5])

    p = doc.add_paragraph(
        "The churn prediction work was directly connected with the transaction preprocessing and RFM analytics performed in earlier milestones, translating raw purchase cadence into automated early-warning retention triggers."
    )
    p.runs[0].font.name = 'Calibri'
    p.runs[0].font.size = Pt(9.2)
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(2)

    p_res = doc.add_paragraph()
    r = p_res.add_run("Result: The churn prediction system identified 270 high-risk accounts (34.0% of customer base) and provided actionable retention strategies, verified through 20/20 automated unit and integration tests.")
    r.font.name = 'Calibri'
    r.font.size = Pt(9.2)
    r.font.bold = True
    r.font.italic = True
    r.font.color.rgb = NAVY_RGB

    doc.add_page_break()

    # -------------------------------------------------------------
    # PAGE 4: MILESTONE 4 - APPLICATION DEPLOYMENT (UNCHANGED)
    # -------------------------------------------------------------
    p = doc.add_paragraph()
    r = p.add_run("Milestone 4 – Application Deployment")
    r.font.name = 'Calibri'
    r.font.size = Pt(12.5)
    r.font.bold = True
    r.font.color.rgb = NAVY_RGB
    p.paragraph_format.space_after = Pt(4)

    p = doc.add_paragraph(
        "Application deployment was carried out as a team activity. The MarketMind AI application was deployed on the Render "
        "cloud platform with separate frontend and backend services, allowing the two layers of the application to be built, "
        "scaled and managed independently."
    )
    p.runs[0].font.name = 'Calibri'
    p.runs[0].font.size = Pt(9.8)
    p.paragraph_format.space_after = Pt(6)

    p = doc.add_paragraph()
    r = p.add_run("Deployment Flow")
    r.font.name = 'Calibri'
    r.font.size = Pt(10.5)
    r.font.bold = True
    r.font.color.rgb = NAVY_RGB
    p.paragraph_format.space_after = Pt(2)

    flow_p = doc.add_paragraph(
        "GitHub Repository  →  Render Frontend  →  API Request  →  Render Backend  →  AI / Database"
    )
    flow_p.runs[0].font.name = 'Calibri'
    flow_p.runs[0].font.size = Pt(9.5)
    flow_p.runs[0].font.bold = True
    flow_p.paragraph_format.space_after = Pt(8)

    p = doc.add_paragraph()
    r = p.add_run("Component Deployment Details")
    r.font.name = 'Calibri'
    r.font.size = Pt(10.5)
    r.font.bold = True
    r.font.color.rgb = NAVY_RGB
    p.paragraph_format.space_after = Pt(2)

    comp_data = [
        ["Component", "Deployment Details"],
        ["Frontend", "React application deployed as a Render Static Site."],
        ["Backend", "FastAPI application deployed as a Render Web Service."],
        ["Source", "GitHub main branch used as the deployment source."]
    ]
    build_table(doc, comp_data, [1.8, 5.2])

    p_links = doc.add_paragraph()
    p_links.paragraph_format.space_before = Pt(8)
    p_links.paragraph_format.space_after = Pt(6)
    
    links = [
        ("Backend", "https://marketmindai-backend-2or0.onrender.com"),
        ("Frontend", "https://frontend-sr7i.onrender.com"),
        ("Backend API Documentation", "https://marketmindai-backend-2or0.onrender.com/docs")
    ]
    for label, url in links:
        p_l = doc.add_paragraph()
        r1 = p_l.add_run(f"{label}: ")
        r1.font.bold = True
        r1.font.size = Pt(9.5)
        r2 = p_l.add_run(url)
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = RGBColor(46, 116, 181)
        r2.font.underline = True
        p_l.paragraph_format.space_after = Pt(2)

    img0 = "page4_img_0_Image38.png"
    img1 = "page4_img_1_Image39.jpg"
    
    # Extract images from Individual work.pdf if needed
    if not os.path.exists(img0) or not os.path.exists(img1):
        try:
            import pypdf
            reader = pypdf.PdfReader("Individual work.pdf")
            p4 = reader.pages[3]
            for idx, img in enumerate(p4.images):
                with open(f"page4_img_{idx}_{img.name}", "wb") as f:
                    f.write(img.data)
        except Exception:
            pass

    p_img = doc.add_paragraph()
    p_img.paragraph_format.space_before = Pt(8)
    
    if os.path.exists(img0):
        doc.add_picture(img0, width=Inches(3.3))
        p_cap = doc.add_paragraph("Figure 4.1(a) – Render Frontend Deployment")
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].font.italic = True
    
    if os.path.exists(img1):
        doc.add_picture(img1, width=Inches(3.3))
        p_cap = doc.add_paragraph("Figure 4.1(b) – Render Backend Deployment")
        p_cap.runs[0].font.size = Pt(8.5)
        p_cap.runs[0].font.italic = True

    out_file = "Individual work - Sahil.docx"
    doc.save(out_file)
    print(f"[SUCCESS] Generated: {out_file}")

if __name__ == "__main__":
    create_docx()
