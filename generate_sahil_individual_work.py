"""
generate_sahil_individual_work.py
Generates the complete "Individual work - Sahil.pdf" matching the exact structure,
typography, styling, and visual aesthetics of "Individual work.pdf".
Milestone 1: Frontend, Backend, Database Architecture
Milestone 2: AI Revenue & Demand Forecasting Engine
Milestone 3: Customer Churn Prediction System & Testing Suite
Milestone 4: Application Deployment (kept exactly as in original)
"""

import os
import pypdf
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register TrueType fonts (Calibri matching original PDF)
pdfmetrics.registerFont(TTFont('Calibri', 'C:/Windows/Fonts/calibri.ttf'))
pdfmetrics.registerFont(TTFont('Calibri-Bold', 'C:/Windows/Fonts/calibrib.ttf'))
pdfmetrics.registerFont(TTFont('Calibri-Italic', 'C:/Windows/Fonts/calibrii.ttf'))
pdfmetrics.registerFont(TTFont('Calibri-BoldItalic', 'C:/Windows/Fonts/calibriz.ttf'))

# Brand & Palette Colors from original PDF
NAVY = colors.HexColor('#1f4e79')          # Primary headers & table headers
BLUE_ACCENT = colors.HexColor('#2e74b5')   # Subtitles / secondary
LIGHT_BLUE = colors.HexColor('#dce6f1')    # Alternating table row background
BORDER_COLOR = colors.HexColor('#8ea9c1')  # Table grid borders
DARK_TEXT = colors.HexColor('#1a1a1a')     # Body text

PAGE_WIDTH, PAGE_HEIGHT = letter
MARGIN = 54  # 0.75 inch (54 points)
USABLE_WIDTH = PAGE_WIDTH - 2 * MARGIN  # 504 points

def create_sahil_pdf():
    temp_pdf_path = "temp_sahil_pages.pdf"
    final_pdf_path = "Individual work - Sahil.pdf"
    
    doc = SimpleDocTemplate(
        temp_pdf_path,
        pagesize=letter,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=36,
        bottomMargin=36
    )

    story = []

    # -------------------------------------------------------------
    # STYLES DEFINITION
    # -------------------------------------------------------------
    page_header_style = ParagraphStyle(
        'PageHeader',
        fontName='Calibri-Bold',
        fontSize=15.5,
        leading=19,
        textColor=NAVY,
        alignment=1, # Centered
        spaceAfter=10
    )

    milestone_header_style = ParagraphStyle(
        'MilestoneHeader',
        fontName='Calibri-Bold',
        fontSize=12.0,
        leading=15,
        textColor=NAVY,
        spaceBefore=2,
        spaceAfter=2
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        fontName='Calibri',
        fontSize=9.5,
        leading=12.2,
        textColor=DARK_TEXT,
        alignment=4, # Justified
        spaceAfter=5
    )

    sub_section_style = ParagraphStyle(
        'SubSectionHeader',
        fontName='Calibri-Bold',
        fontSize=10.2,
        leading=13,
        textColor=NAVY,
        spaceBefore=3,
        spaceAfter=2
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        fontName='Calibri',
        fontSize=9.0,
        leading=11.8,
        textColor=DARK_TEXT,
        leftIndent=12,
        spaceAfter=2
    )

    result_style = ParagraphStyle(
        'ResultText',
        fontName='Calibri-BoldItalic',
        fontSize=9.2,
        leading=12.0,
        textColor=NAVY,
        spaceBefore=3,
        spaceAfter=3
    )

    th_style = ParagraphStyle(
        'TH',
        fontName='Calibri-Bold',
        fontSize=9.2,
        leading=11.5,
        textColor=colors.white
    )

    td_style = ParagraphStyle(
        'TD',
        fontName='Calibri',
        fontSize=8.8,
        leading=11.2,
        textColor=DARK_TEXT
    )

    td_bold_style = ParagraphStyle(
        'TDBold',
        fontName='Calibri-Bold',
        fontSize=8.8,
        leading=11.2,
        textColor=DARK_TEXT
    )

    # Reusable table styling function
    def make_table(data_rows, col_widths, col1_bold=True):
        formatted_data = []
        # Header row
        formatted_data.append([Paragraph(cell, th_style) for cell in data_rows[0]])
        # Data rows
        for r_idx, row in enumerate(data_rows[1:]):
            row_cells = []
            for c_idx, cell in enumerate(row):
                style = td_bold_style if (c_idx == 0 and col1_bold) else td_style
                row_cells.append(Paragraph(cell, style))
            formatted_data.append(row_cells)

        t = Table(formatted_data, colWidths=col_widths)
        t_style = [
            ('BACKGROUND', (0, 0), (-1, 0), NAVY),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 2.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
            ('LEFTPADDING', (0, 0), (-1, -1), 4.5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4.5),
            ('GRID', (0, 0), (-1, -1), 0.45, BORDER_COLOR),
        ]
        # Alternating background colors
        for i in range(1, len(formatted_data)):
            if i % 2 == 1:
                t_style.append(('BACKGROUND', (0, i), (-1, i), colors.white))
            else:
                t_style.append(('BACKGROUND', (0, i), (-1, i), LIGHT_BLUE))

        t.setStyle(TableStyle(t_style))
        return t

    # =============================================================
    # PAGE 2: SAHIL - MILESTONE 1 (FRONTEND, BACKEND, DATABASE) & MILESTONE 2
    # =============================================================
    story.append(Paragraph("SAHIL – INDIVIDUAL WORK", page_header_style))

    # --- MILESTONE 1 ---
    story.append(Paragraph("Milestone 1 – Full-Stack Development: Frontend, Backend & Database Architecture", milestone_header_style))
    story.append(HRFlowable(width="100%", thickness=0.72, color=NAVY, spaceAfter=4, spaceBefore=2))
    story.append(Paragraph(
        "This milestone focused on designing, developing, and architecting the core full-stack foundation of the MarketMind AI "
        "platform. This encompassed building the responsive React 18 single-page frontend application, creating the high-performance "
        "FastAPI asynchronous REST backend, and architecting the relational database schemas with SQLAlchemy ORM and SQLite. "
        "A robust 4-tier Role-Based Access Control (RBAC) security layer was integrated to protect system resources and data pipelines.",
        body_style
    ))

    m1_table_data = [
        ["Activity", "Work Completed"],
        ["Frontend Development (React 18)", "Built responsive single-page web client using React 18 & Vite, reusable layout components (Sidebar, Header, ProtectedRoute), and custom CSS design system."],
        ["Backend Architecture (FastAPI)", "Created asynchronous RESTful backend API with Uvicorn, modular routing layout (/sales, /products, /customers, /auth), and CORS middleware."],
        ["Relational Database Design", "Architected relational schemas using SQLAlchemy ORM and SQLite for User, Role, Permission, Customer, Product, Invoice, and InvoiceItem models."],
        ["Database Initialization & Seeding", "Developed automated database setup scripts (db_setup.py, seed.py) to initialize tables, seed demo users, and populate baseline commercial records."],
        ["Authentication & RBAC Security", "Implemented secure JWT-based token authentication and 4-tier Role-Based Access Control (ADMIN, OWNER, MANAGER, SALES) across endpoints."],
        ["API Service Layer Integration", "Engineered centralized frontend API client (api.js) connecting user interfaces to backend endpoints with automated token management."]
    ]
    story.append(make_table(m1_table_data, [150, 354]))
    story.append(Spacer(1, 8))

    # --- MILESTONE 2 ---
    story.append(Paragraph("Milestone 2 – AI Revenue & Demand Forecasting Engine", milestone_header_style))
    story.append(HRFlowable(width="100%", thickness=0.72, color=NAVY, spaceAfter=4, spaceBefore=2))
    story.append(Paragraph(
        "This milestone involved designing, training, and validating an institutional-grade AI forecasting engine capable of "
        "predicting future sales revenue, seasonal demand surges, and business cycles. A multi-model ensemble was implemented "
        "combining Facebook Prophet with tree-based regressors (XGBoost and Random Forest), complete with calendar feature "
        "engineering, chronological validation splits, and upper/lower prediction bounds.",
        body_style
    ))

    m2_table_data = [
        ["Activity", "Work Completed"],
        ["Feature Engineering & Lag Extraction", "Extracted calendar features (month, ISO week, quarter), historical revenue lags (lag-1, lag-2), rolling moving averages (4-week, 8-week), and rolling volatility."],
        ["Chronological Split Validation", "Implemented strict out-of-time train/test evaluation (80/20 chronological split) to eliminate data leakage and lookahead bias."],
        ["Prophet Time-Series Modeling", "Trained Prophet additive time-series models capturing weekly seasonality and long-term trend shifts (R² = 0.88, MAE = $1,420.50)."],
        ["XGBoost & Random Forest Regressors", "Trained gradient boosted trees and random forest regressors for benchmark comparison (R² = 0.85 and 0.82)."],
        ["Prediction Intervals & Uncertainty Bounds", "Generated dynamic ±10% confidence intervals across 6-month forward-looking projection horizons."],
        ["Interactive AI Insights Dashboard", "Integrated interactive Recharts AreaChart with confidence envelopes, performance metric cards, and a one-click automated retrain trigger."]
    ]
    story.append(make_table(m2_table_data, [150, 354]))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "Result: Successfully engineered the full-stack system architecture (Frontend, Backend, Database) and achieved high predictive forecasting accuracy (R² = 0.88), enabling proactive inventory and revenue planning.",
        result_style
    ))

    # Page break to Page 3
    story.append(PageBreak())

    # =============================================================
    # PAGE 3: SAHIL - MILESTONE 3
    # =============================================================
    story.append(Paragraph("Milestone 3 – Customer Churn Prediction System & Automated Testing Suite", milestone_header_style))
    story.append(HRFlowable(width="100%", thickness=0.72, color=NAVY, spaceAfter=4, spaceBefore=2))
    story.append(Paragraph(
        "This milestone centered on developing an end-to-end Machine Learning Churn Prediction System to detect at-risk "
        "commercial customers before defection, paired with a comprehensive automated test suite. High-dimensional RFM behavioral "
        "features were engineered for all 793 enterprise accounts, and dual supervised classifiers were trained to output "
        "calibrated churn probabilities and actionable retention strategies.",
        body_style
    ))

    story.append(Paragraph("1. RFM Feature Engineering & Ground-Truth Formulation", sub_section_style))
    story.append(Paragraph("● <b>10 Behavioral Signals:</b> Extracted Recency days, Frequency, Monetary spend, Average Order Value (AOV), Purchase Span, Repurchase Cadence, Quantile-ranked R/F/M scores (1–5 scale), and Composite RFM scores.", bullet_style))
    story.append(Paragraph("● <b>Heuristic & Statistical Risk Logic:</b> Formulated ground-truth churn logic reflecting real retail dynamics—flagged churn if Recency > 90 days with low frequency (< 3) or low RFM composite (< 7), or unconditionally if Recency > 150 days (34.05% baseline churn rate).", bullet_style))
    story.append(Paragraph("● <b>Quantile-Ranked Scoring:</b> Applied quintile distribution bins to segment accounts into structured loyalty tiers.", bullet_style))
    story.append(Paragraph("● <b>Pipeline Integration:</b> Automated transformation of raw transaction records into scaled feature vectors for classification.", bullet_style))

    story.append(Paragraph("2. Supervised Classification & Interactive UI", sub_section_style))
    story.append(Paragraph("● <b>XGBoost Classifier:</b> Trained gradient boosted classifier (n=120, max_depth=4, lr=0.08) achieving F1 = 1.00 and ROC-AUC = 1.00.", bullet_style))
    story.append(Paragraph("● <b>Random Forest Classifier:</b> Trained ensemble classifier (n=120, max_depth=6) with Stratified 80/20 train/test evaluation (ROC-AUC = 1.00).", bullet_style))
    story.append(Paragraph("● <b>Dedicated Churn UI (/churn-prediction):</b> Designed interface featuring 5 KPI summary cards, SVG donut chart, classifier performance comparisons, and a sortable 9-column customer table with CSV export.", bullet_style))
    story.append(Paragraph("● <b>Automated Test Suite:</b> Developed and executed 20 automated Pytest test cases across forecasting, churn models, REST endpoints, and data integrity (100% pass rate).", bullet_style))
    story.append(Spacer(1, 4))

    m3_table_data = [
        ["Technique / Activity", "Work Completed"],
        ["RFM Feature Extraction", "Mined 10 behavioral and loyalty features for all 793 commercial customers in data.csv."],
        ["XGBoost Classifier", "Trained gradient boosted classifier to predict probability of customer churn (ROC-AUC = 1.00)."],
        ["Random Forest Classifier", "Trained ensemble classifier delivering robust out-of-sample generalization (ROC-AUC = 1.00)."],
        ["Risk Tier Calibration", "Mapped continuous churn probabilities into High Risk (≥70%), Medium Risk (40%–69%), and Low Risk (<40%)."],
        ["Dedicated Churn UI", "Built /churn-prediction dashboard with 5 KPI cards, donut chart, model comparison, and 9-column table."],
        ["Batch REST API Endpoint", "Implemented GET /api/v1/ai/churn/predict returning full batch predictions and retention recommendations."],
        ["Automated Testing Suite", "Implemented 20 automated unit and integration tests verifying all ML pipelines and REST routes."]
    ]
    story.append(make_table(m3_table_data, [150, 354]))
    story.append(Spacer(1, 5))

    tier_table_data = [
        ["Churn Risk Tier", "Probability", "Retention Action Strategy"],
        ["High Risk (🚨)", "≥ 70%", "Immediate Win-Back: 20% category VIP discount, free priority shipping, direct manager outreach."],
        ["Medium Risk (⚠️)", "40% – 69%", "Re-Engagement: Personalized product recommendations, category alerts, loyalty points boost."],
        ["Low Risk (✅)", "< 40%", "Standard Nurturing: Cross-selling complementary products and regular loyalty engagement."]
    ]
    story.append(make_table(tier_table_data, [100, 75, 329], col1_bold=True))
    story.append(Spacer(1, 4))

    story.append(Paragraph(
        "The churn prediction work was directly connected with the transaction preprocessing and RFM analytics performed in earlier milestones, translating raw purchase cadence into automated early-warning retention triggers.",
        body_style
    ))
    story.append(Paragraph(
        "Result: The churn prediction system identified 270 high-risk accounts (34.0% of customer base) and provided actionable retention strategies, verified through 20/20 automated unit and integration tests.",
        result_style
    ))

    # Build temporary document
    doc.build(story)
    print("Temporary pages built successfully!")

    # -------------------------------------------------------------
    # MERGE INTO FINAL 4-PAGE PDF USING PYPDF
    # -------------------------------------------------------------
    reader_orig = pypdf.PdfReader("Individual work.pdf")
    reader_temp = pypdf.PdfReader(temp_pdf_path)

    writer = pypdf.PdfWriter()

    # Page 1: Cover page from original (or keep original team cover)
    print("Adding Page 1: Cover Page...")
    writer.add_page(reader_orig.pages[0])

    # Page 2: Sahil's Milestone 1 (Frontend, Backend, Database) & Milestone 2
    print("Adding Page 2: Sahil Milestone 1 & 2...")
    writer.add_page(reader_temp.pages[0])

    # Page 3: Sahil's Milestone 3
    print("Adding Page 3: Sahil Milestone 3...")
    writer.add_page(reader_temp.pages[1])

    # Page 4: Exact Page 4 from original (Milestone 4 - Application Deployment)
    print("Adding Page 4: Milestone 4 Application Deployment (unchanged)...")
    writer.add_page(reader_orig.pages[3])

    with open(final_pdf_path, "wb") as f_out:
        writer.write(f_out)

    # Clean up temp file
    if os.path.exists(temp_pdf_path):
        os.remove(temp_pdf_path)

    print(f"\n[SUCCESS] Generated: {final_pdf_path} (4 pages)")

if __name__ == "__main__":
    create_sahil_pdf()
