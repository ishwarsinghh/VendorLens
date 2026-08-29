"""
VendorLens AI — Demo Vendor PDF Generator
Run: python demo_pdfs/create_demos.py
Requires: pip install reportlab
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

styles = getSampleStyleSheet()

def heading1(text):
    return Paragraph(text, ParagraphStyle(
        'H1', fontSize=20, fontName='Helvetica-Bold',
        textColor=colors.HexColor('#1A3C6E'), spaceAfter=6
    ))

def heading2(text):
    return Paragraph(text, ParagraphStyle(
        'H2', fontSize=14, fontName='Helvetica-Bold',
        textColor=colors.HexColor('#2563EB'), spaceAfter=4, spaceBefore=10
    ))

def body(text):
    return Paragraph(text, ParagraphStyle(
        'Body', fontSize=10, fontName='Helvetica',
        textColor=colors.HexColor('#1F2937'), spaceAfter=4, leading=14
    ))

def kv(label, value):
    return Paragraph(
        f"<b>{label}:</b> {value}",
        ParagraphStyle('KV', fontSize=10, fontName='Helvetica', spaceAfter=3, leading=14)
    )

def make_feature_table(features):
    data = [["Feature", "Included", "Notes"]]
    for name, included, notes in features:
        data.append([name, "✓ Yes" if included else "✗ No", notes or ""])
    t = Table(data, colWidths=[8*cm, 3*cm, 7*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1A3C6E')),
        ('TEXTCOLOR',  (0, 0), (-1, 0), colors.white),
        ('FONTNAME',   (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE',   (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F0F4FF')]),
        ('GRID',       (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),
        ('ALIGN',      (1, 0), (1, -1), 'CENTER'),
        ('VALIGN',     (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    return t

def make_cost_table(rows):
    t = Table(rows, colWidths=[10*cm, 8*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E8F0FE')),
        ('FONTNAME',   (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE',   (0, 0), (-1, -1), 10),
        ('GRID',       (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    return t

# ─────────────────────────────────────────────────────────────────────────────
# VENDOR A: TechSolve Inc — THE WINNER ($52,000, SLA 99.9%, 8 weeks)
# ─────────────────────────────────────────────────────────────────────────────
def create_techsolve():
    path = os.path.join(OUTPUT_DIR, "techsolve_inc.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm,
                             topMargin=2*cm, bottomMargin=2*cm)
    story = []

    story.append(heading1("TechSolve Inc."))
    story.append(body("Enterprise Software Solutions — Vendor Proposal"))
    story.append(body("Prepared for: Acme Procurement Department | Date: August 2026"))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#2563EB'), spaceAfter=10))

    story.append(heading2("1. Executive Summary"))
    story.append(body(
        "TechSolve Inc. is pleased to submit this proposal for the Enterprise CRM Platform "
        "implementation. With over 15 years of experience delivering enterprise solutions, "
        "we are confident in our ability to meet your organization's needs within budget and timeline. "
        "Our platform has been deployed across 200+ enterprises globally with a consistent track record."
    ))

    story.append(heading2("2. Commercial Terms & Pricing"))
    story.append(make_cost_table([
        ["Item", "Amount (USD)"],
        ["Platform License (Annual)", "$32,000"],
        ["Implementation & Setup", "$12,000"],
        ["Training (5 days on-site)", "$5,000"],
        ["First Year Support", "$3,000"],
        ["Total Cost", "$52,000"],
    ]))
    story.append(Spacer(1, 0.3*cm))
    story.append(kv("Payment Terms", "Net 30 days from invoice date"))
    story.append(kv("Contract Length", "12 months with annual renewal option"))
    story.append(kv("Warranty", "18 months post-implementation"))

    story.append(heading2("3. Service Level Agreement (SLA)"))
    story.append(kv("Guaranteed Uptime", "99.9% monthly uptime SLA"))
    story.append(kv("Planned Maintenance", "Sundays 02:00–04:00 UTC (excluded from SLA)"))
    story.append(kv("Support Level", "24/7 priority support via phone, email, and chat"))
    story.append(kv("Response Time", "P1 Critical: 30 minutes | P2 High: 2 hours | P3: 8 hours"))
    story.append(body(
        "⚠ Note: This proposal does not include a specific penalty clause for SLA breaches. "
        "Remediation will be handled through service credits negotiated at contract signing."
    ))

    story.append(heading2("4. Implementation Timeline"))
    story.append(kv("Total Duration", "8 weeks from project kickoff"))
    story.append(make_cost_table([
        ["Phase", "Duration"],
        ["Phase 1 — Discovery & Setup", "Week 1–2"],
        ["Phase 2 — Configuration & Integration", "Week 3–5"],
        ["Phase 3 — UAT & Training", "Week 6–7"],
        ["Phase 4 — Go-Live & Handover", "Week 8"],
    ]))

    story.append(heading2("5. Feature Availability"))
    story.append(make_feature_table([
        ("SSO Integration",      True,  "SAML 2.0 and OAuth 2.0 supported"),
        ("Mobile App",           False, "Web responsive only; native app in Q1 2027 roadmap"),
        ("API Access",           True,  "RESTful API with full OpenAPI docs"),
        ("24/7 Support",         True,  "Dedicated account manager included"),
        ("Data Export",          True,  "CSV, Excel, JSON export available"),
        ("Custom Reporting",     True,  "Drag-and-drop report builder"),
        ("Multi-tenant",         True,  "Department-level tenancy"),
        ("GDPR Compliance",      True,  "DPA available on request"),
        ("Audit Logs",           True,  "90-day retention, exportable"),
        ("Role-Based Access",    True,  "Granular RBAC with 20+ permission levels"),
    ]))

    story.append(heading2("6. About TechSolve Inc."))
    story.append(body(
        "Founded in 2009, TechSolve Inc. is a leading enterprise software vendor headquartered in "
        "Bengaluru, India with offices in Singapore and the UAE. We hold ISO 27001 and SOC 2 Type II "
        "certifications. Our client portfolio includes Fortune 500 companies across BFSI, healthcare, "
        "and manufacturing sectors."
    ))
    story.append(kv("Contact", "sales@techsolve.io | +91-80-4567-8900"))
    story.append(kv("Website", "https://www.techsolve.io"))

    doc.build(story)
    print(f"[OK] Created: {path}")


# ─────────────────────────────────────────────────────────────────────────────
# VENDOR B: GlobalSys Ltd — THE EXPENSIVE ONE ($88,000, SLA 99.99%, 14 weeks)
# ─────────────────────────────────────────────────────────────────────────────
def create_globalsys():
    path = os.path.join(OUTPUT_DIR, "globalsys_ltd.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm,
                             topMargin=2*cm, bottomMargin=2*cm)
    story = []

    story.append(heading1("GlobalSys Ltd."))
    story.append(body("Enterprise Digital Transformation — Commercial Proposal"))
    story.append(body("Submitted To: Acme Procurement | Reference: RFP-2026-087"))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#7C3AED'), spaceAfter=10))

    story.append(heading2("1. Proposal Overview"))
    story.append(body(
        "GlobalSys Ltd. is delighted to present our flagship Enterprise Suite for your digital "
        "transformation initiative. As a Gartner Magic Quadrant Leader for three consecutive years, "
        "our platform offers unmatched reliability, compliance coverage, and a comprehensive feature "
        "set tailored for large-scale enterprise deployments. We deliver premium quality with "
        "enterprise-grade SLAs that ensure maximum business continuity."
    ))

    story.append(heading2("2. Pricing & Commercial Terms"))
    story.append(make_cost_table([
        ["Item", "Amount (USD)"],
        ["Enterprise License (Year 1)", "$55,000"],
        ["Professional Implementation Services", "$18,000"],
        ["Change Management & Training", "$8,000"],
        ["Premium Support Pack (Year 1)", "$4,500"],
        ["Infrastructure & Hosting Setup", "$2,500"],
        ["Total Investment", "$88,000"],
    ]))
    story.append(Spacer(1, 0.3*cm))
    story.append(kv("Payment Terms", "50% upfront, 50% at go-live"))
    story.append(kv("Contract Length", "24 months minimum commitment"))
    story.append(kv("Warranty", "24 months full coverage"))

    story.append(heading2("3. Service Level Agreement"))
    story.append(kv("Uptime Guarantee", "99.99% (≤52 minutes downtime/year)"))
    story.append(kv("Support Level", "24/7 Premium Support with dedicated SRE team"))
    story.append(kv("Response Time", "P1 Critical: 15 minutes guaranteed"))
    story.append(kv("Penalty Clause", "SLA breach results in 10% credit of monthly invoice per hour"))
    story.append(body(
        "Financial penalty clause: In the event of SLA breach below 99.99%, GlobalSys Ltd. will "
        "provide service credits equivalent to 10% of the monthly subscription fee for each hour "
        "of downtime beyond the SLA threshold."
    ))

    story.append(heading2("4. Implementation Plan"))
    story.append(kv("Total Duration", "14 weeks from contract signing"))
    story.append(make_cost_table([
        ["Phase", "Duration"],
        ["Phase 1 — Enterprise Discovery & Architecture", "Week 1–3"],
        ["Phase 2 — Core Platform Setup", "Week 4–7"],
        ["Phase 3 — Integrations & Custom Workflows", "Week 8–10"],
        ["Phase 4 — UAT, Security Audit & Training", "Week 11–13"],
        ["Phase 5 — Hypercare Go-Live", "Week 14"],
    ]))

    story.append(heading2("5. Feature Matrix"))
    story.append(make_feature_table([
        ("SSO Integration",      True,  "SAML, OAuth, LDAP, Active Directory"),
        ("Mobile App",           True,  "iOS and Android native apps included"),
        ("API Access",           True,  "GraphQL + REST API, rate limit 10K req/min"),
        ("24/7 Support",         True,  "Dedicated SRE + TAM included"),
        ("Data Export",          True,  "Real-time streaming to S3/GCS available"),
        ("Custom Reporting",     True,  "AI-powered report generation"),
        ("Multi-tenant",         True,  "Full enterprise multi-tenancy"),
        ("GDPR Compliance",      True,  "Full GDPR, CCPA, SOC 2 Type II compliance"),
        ("Audit Logs",           True,  "Immutable 1-year retention with SIEM integration"),
        ("Role-Based Access",    True,  "Attribute-based access control (ABAC)"),
    ]))

    story.append(heading2("6. Company Profile"))
    story.append(body(
        "GlobalSys Ltd., founded in 2004, is an enterprise software company with 3,000+ employees "
        "across 18 countries. Headquartered in London with APAC HQ in Singapore. Gartner MQ Leader "
        "2023, 2024, 2025. ISO 27001, SOC 2 Type II, FedRAMP Moderate certified."
    ))
    story.append(kv("Enterprise Contact", "enterprise@globalsys.com | +65-6789-0000"))

    doc.build(story)
    print(f"[OK] Created: {path}")


# ─────────────────────────────────────────────────────────────────────────────
# VENDOR C: QuickBuild Co — THE RISKY ONE ($38,000, NO SLA, 5 weeks)
# ─────────────────────────────────────────────────────────────────────────────
def create_quickbuild():
    path = os.path.join(OUTPUT_DIR, "quickbuild_co.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm,
                             topMargin=2*cm, bottomMargin=2*cm)
    story = []

    story.append(heading1("QuickBuild Co."))
    story.append(body("Agile Software Delivery — Project Proposal"))
    story.append(body("Client: Acme Corp | Proposal Date: August 2026"))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#059669'), spaceAfter=10))

    story.append(heading2("1. Our Approach"))
    story.append(body(
        "QuickBuild Co. specializes in rapid, lean software deployments. We cut through enterprise "
        "bloat to deliver working software fast. Our agile methodology means you go live in weeks, "
        "not months. We believe in action over documentation — our track record speaks for itself "
        "with 50+ startups and mid-market companies deployed successfully."
    ))

    story.append(heading2("2. Pricing"))
    story.append(make_cost_table([
        ["Item", "Amount (USD)"],
        ["Software License (Annual)", "$22,000"],
        ["Rapid Implementation (fixed fee)", "$10,000"],
        ["Remote Training Sessions (3x2hr)", "$3,000"],
        ["Basic Support (email only)", "$3,000"],
        ["Total Project Cost", "$38,000"],
    ]))
    story.append(Spacer(1, 0.3*cm))
    story.append(kv("Payment Terms", "100% upfront on contract signing"))
    story.append(kv("Contract Length", "12 months"))
    story.append(kv("Warranty", "90 days post-deployment"))

    story.append(heading2("3. Availability & Support"))
    story.append(body(
        "QuickBuild Co. provides best-effort availability for our hosted platform. We target "
        "high availability but do not publish specific uptime figures, as our infrastructure "
        "is optimized dynamically based on demand. Support is provided via email tickets with "
        "a 48-hour response target during business hours (Mon–Fri, 9am–6pm IST)."
    ))
    story.append(body(
        "Note: No formal SLA document is included with this proposal. Uptime and support "
        "commitments are best-effort and subject to our standard terms of service."
    ))

    story.append(heading2("4. Delivery Timeline"))
    story.append(kv("Total Duration", "5 weeks from kickoff"))
    story.append(make_cost_table([
        ["Phase", "Duration"],
        ["Sprint 1 — Setup & Config", "Week 1"],
        ["Sprint 2 — Core Features", "Week 2–3"],
        ["Sprint 3 — Testing & Launch", "Week 4–5"],
    ]))

    story.append(heading2("5. Features Included"))
    story.append(make_feature_table([
        ("SSO Integration",      True,  "Google SSO via OAuth"),
        ("Mobile App",           False, "Not in current roadmap"),
        ("API Access",           True,  "Basic REST API, docs provided"),
        ("24/7 Support",         False, "Business hours only (Mon–Fri)"),
        ("Data Export",          True,  "CSV export available"),
        ("Custom Reporting",     False, "Standard reports only, no customization"),
        ("Multi-tenant",         False, "Single-tenant deployment"),
        ("GDPR Compliance",      True,  "Data residency in India region"),
        ("Audit Logs",           False, "Not available in base package"),
        ("Role-Based Access",    True,  "Admin/User/Viewer roles"),
    ]))

    story.append(heading2("6. About QuickBuild Co."))
    story.append(body(
        "QuickBuild Co. is a fast-growing startup founded in 2021, based in Pune, India. "
        "Our team of 45 engineers has delivered 50+ projects. We move fast and break barriers. "
        "Not ISO certified yet — pursuing certification in 2027."
    ))
    story.append(kv("Contact", "hello@quickbuild.co | +91-20-7654-3210"))

    doc.build(story)
    print(f"[OK] Created: {path}")


if __name__ == "__main__":
    print("[*] Generating demo vendor PDFs...")
    create_techsolve()
    create_globalsys()
    create_quickbuild()
    print("\n[OK] All 3 demo PDFs created in demo_pdfs/")
    print("   -> techsolve_inc.pdf  (Winner: $52K, SLA 99.9%, 8wks, 9/10 features)")
    print("   -> globalsys_ltd.pdf  (Expensive: $88K, SLA 99.99%, 14wks, 10/10 features)")
    print("   -> quickbuild_co.pdf  (Risky: $38K, NO SLA stated, 5wks, 6/10 features)")
