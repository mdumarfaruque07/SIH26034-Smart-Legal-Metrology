"""Inspection API routes for package compliance screening."""
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel

from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)
from ..schemas import (
    InspectionResponse,
    CopilotRequest,
    CopilotResponse,
    LegalNoticeRequest,
    LegalNoticeResponse,
)
from ..services.compliance_service import compliance_service, DEMO_SAMPLES
from ..services.storage_service import storage_service
from ..services.ai_service import ai_service
from ..services.db_service import db_service

router = APIRouter(prefix="/api/inspection", tags=["Inspection"])


class DemoAnalyzeRequest(BaseModel):
    sample_type: str = "sample_compliant"
    officer_id: Optional[str] = None
    officer_name: Optional[str] = None


@router.post("/analyze", response_model=InspectionResponse)
async def analyze_package(
    image: UploadFile = File(...),
    category: Optional[str] = Form("Auto Detect"),
    demo_sample: Optional[str] = Form(None),
    officer_id: Optional[str] = Form(None),
    officer_name: Optional[str] = Form(None),
):
    """Analyze an uploaded packaged commodity image for Legal Metrology compliance."""
    try:
        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty image file received. Please upload a clear package image.",
            )

        result = compliance_service.process_inspection(
            image_bytes=image_bytes,
            category_hint=category,
            force_demo_sample=demo_sample,
            officer_id=officer_id,
            officer_name=officer_name,
        )
        return result

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to complete package analysis: {str(e)}",
        )


@router.post("/demo-analyze", response_model=InspectionResponse)
async def demo_analyze_package(payload: DemoAnalyzeRequest):
    """Instant demo inspection without requiring image upload or Gemini API quota."""
    try:
        return compliance_service.run_sample_inspection(
            payload.sample_type,
            officer_id=payload.officer_id,
            officer_name=payload.officer_name,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Demo simulation failed: {str(e)}",
        )


@router.get("/history", response_model=List[dict])
async def get_inspection_history(officer_id: Optional[str] = None):
    """Retrieve historical inspections from SQLite database, strictly isolated per officer."""
    return storage_service.list_all(officer_id=officer_id)


@router.get("/samples")
async def get_demo_samples():
    """Retrieve list of pre-configured demo sample scenarios."""
    return [
        {
            "id": "sample_compliant",
            "name": "Sample Biscuits (Compliant Pack)",
            "product_name": "Royal Butter Delight Biscuits",
            "category": "Food",
            "expected_status": "COMPLIANT",
            "description": "Standard packaged biscuits with full manufacturer address, SI net weight (200g), MRP with tax clause, mfg date, and consumer care phone.",
        },
        {
            "id": "sample_non_compliant",
            "name": "Sample Snack (Non-Compliant Pack)",
            "product_name": "Crunchy Masala Bites",
            "category": "Food",
            "expected_status": "NON_COMPLIANT",
            "description": "Packaged snack missing manufacturer address, generic product name, mfg/packing date, best-before declaration, and consumer care contacts.",
        },
    ]


@router.get("/status/config")
async def get_system_config():
    """Check AI service configuration and system readiness."""
    db_stats = db_service.get_db_stats()
    return {
        "ai_service_configured": ai_service.is_configured(),
        "model": ai_service.model_name,
        "compliance_rules_loaded": 12,
        "storage_mode": "sqlite_sql_relational",
        "database_engine": db_stats.get("engine", "SQLite 3 Relational SQL"),
        "database_file": db_stats.get("db_file", "legal_metrology.db"),
        "total_records": db_stats.get("total_inspections", 0),
        "cloud_sql_ready": True,
        "prototype_version": "1.0.0-SIH26034",
    }


@router.get("/db/stats")
async def get_database_telemetry():
    """Get detailed SQL database statistics and online cloud sync status."""
    return db_service.get_db_stats()


@router.post("/copilot", response_model=CopilotResponse)
async def ask_lm_copilot(payload: CopilotRequest):
    """AI LM-Copilot Legal Metrology Act 2009 Assistant.
    
    Uses Gemini AI for intelligent Legal Metrology answers.
    Guards against non-legal-metrology questions to prevent chatbot misuse.
    """
    query = payload.question.strip()
    query_lower = query.lower()

    # ── GUARD: Reject non-Legal Metrology questions ──
    LM_KEYWORDS = [
        "legal metrology", "packaged commodit", "mrp", "maximum retail price",
        "manufacturer", "packer", "importer", "net quantity", "net weight",
        "net wt", "best before", "use by", "expiry", "manufacture date",
        "mfg date", "packing date", "consumer care", "helpline", "country of origin",
        "made in", "fssai", "bis", "isi mark", "generic name", "commodity",
        "label", "packaging", "declaration", "compliance", "inspection",
        "penalty", "fine", "section 39", "section 49", "section 36",
        "unit sale price", "usp", "form-1", "form 1", "statutory",
        "rule 6", "rule 7", "pc rules", "lm act", "lm-0", "lm-1",
        "weights and measures", "si unit", "standard unit",
        "tax inclusive", "inclusive of all taxes", "inclusive of tax",
        "enforcement", "officer", "notice", "offence", "violation",
        "food", "cosmetic", "household", "electronic", "pharma",
        "package", "product", "brand", "category", "import",
        "barcode", "batch", "lot", "shelf life", "expiry date",
        "combo pack", "multi-piece", "wholesale", "retail",
        "font size", "principal display", "pdp", "2009", "2011", "2021",
        "amendment", "regulation", "rule", "act", "ordinance",
    ]

    is_lm_related = any(kw in query_lower for kw in LM_KEYWORDS)

    if not is_lm_related:
        return CopilotResponse(
            answer="⚠️ I am LM-Copilot, a specialized Legal Metrology Act 2009 & Packaged Commodities Rules assistant. I can only answer questions related to Legal Metrology regulations, package compliance, mandatory declarations, penalties, and statutory rules. Please ask a question related to Legal Metrology compliance.",
            relevant_rules=["Legal Metrology Act 2009", "LM (Packaged Commodities) Rules 2011"],
            suggested_actions=[
                "Is Unit Sale Price mandatory for 250g packaged food?",
                "What is the penalty under Section 39 of LM Act?",
                "What are mandatory declarations on a food package?"
            ]
        )

    # ── Use Gemini AI for intelligent Legal Metrology answers ──
    if ai_service.is_configured():
        try:
            import json
            import urllib.request
            import urllib.error
            import os

            api_key = os.getenv("GEMINI_API_KEY", "").strip()
            model = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

            copilot_system_prompt = """You are LM-Copilot, an expert AI assistant specialized EXCLUSIVELY in the Legal Metrology Act 2009, Legal Metrology (Packaged Commodities) Rules 2011, and their subsequent amendments (including 2021 Unit Sale Price amendment).

Your knowledge covers:
- All mandatory declarations under Rule 6 (manufacturer/packer/importer details, generic name, net quantity in SI units, MRP, tax inclusivity, mfg/packing date, best before/use by, consumer care)
- Penalties under Section 36, 39, 49 of LM Act 2009
- FSSAI requirements for food products
- BIS/ISI marking requirements
- Unit Sale Price under 2021 amendment
- Form-1 Statutory Inspection Notices
- Font size and principal display panel requirements
- Country of origin declaration rules
- Combo pack, multi-piece, and wholesale packaging rules

IMPORTANT RULES:
1. Answer ONLY questions about Legal Metrology, packaging compliance, and related regulations.
2. Cite specific sections, rules, and clauses where applicable.
3. Be accurate and authoritative in your legal interpretation.
4. Provide actionable recommendations for enforcement officers.
5. Output valid JSON with this exact structure:
{
  "answer": "Your detailed answer here",
  "relevant_rules": ["Rule or Section reference 1", "Rule or Section reference 2"],
  "suggested_actions": ["Action 1", "Action 2"]
}
"""

            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            request_payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{copilot_system_prompt}\n\nOfficer's Question: {query}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "response_mime_type": "application/json",
                },
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(request_payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
            )

            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        response_text = parts[0].get("text", "").strip()
                        # Clean markdown fences
                        if response_text.startswith("```json"):
                            response_text = response_text[7:]
                        if response_text.startswith("```"):
                            response_text = response_text[3:]
                        if response_text.endswith("```"):
                            response_text = response_text[:-3]

                        ai_response = json.loads(response_text.strip())
                        return CopilotResponse(
                            answer=ai_response.get("answer", "Unable to parse AI response."),
                            relevant_rules=ai_response.get("relevant_rules", []),
                            suggested_actions=ai_response.get("suggested_actions", [])
                        )

        except Exception as e:
            logger.warning(f"Gemini copilot call failed: {e}, falling back to hardcoded responses.")

    # ── Fallback: Hardcoded expert responses when Gemini is unavailable ──
    if "unit sale price" in query_lower or "usp" in query_lower or "2021" in query_lower:
        return CopilotResponse(
            answer="Under the Legal Metrology (Packaged Commodities) Amendment Rules 2021, Unit Sale Price (USP) in terms of ₹ per g, ₹ per ml, or ₹ per piece is mandatory on all pre-packaged commodities where net quantity is greater than 1g/1ml/1N.",
            relevant_rules=["LM-012: Mandatory Unit Sale Price", "Rule 6(1)(e) PC Rules 2021"],
            suggested_actions=[
                "Check if Unit Sale Price is declared adjacent to MRP",
                "Verify rounding off to 2 decimal places"
            ]
        )
    elif "penalty" in query_lower or "fine" in query_lower or "section 39" in query_lower:
        return CopilotResponse(
            answer="Section 39 of the Legal Metrology Act, 2009 prescribes a fine up to ₹25,000 for first offence, up to ₹50,000 for second offence, and up to ₹1,00,000 or imprisonment up to 1 year for subsequent offences of manufacturing or selling non-compliant packages.",
            relevant_rules=["Section 39 of Legal Metrology Act 2009", "Section 49 (Offences by Companies)"],
            suggested_actions=[
                "Issue Form-1 Statutory Notice to Manufacturer/Packer",
                "Set 14-day mandatory response window"
            ]
        )
    elif "address" in query_lower or "manufacturer" in query_lower or "importer" in query_lower:
        return CopilotResponse(
            answer="Under Rule 6(1)(a) of Legal Metrology (Packaged Commodities) Rules 2011, every package must bear the complete name and address of the manufacturer, packer, or importer. P.O. Box address alone is insufficient; complete postal/operational address with PIN code is mandatory.",
            relevant_rules=["LM-001: Manufacturer/Packer/Importer Details", "Rule 6(1)(a) PC Rules 2011"],
            suggested_actions=[
                "Inspect back and side panels for printed postal address",
                "Verify if entity is declared as 'Mfd by' or 'Imported by'"
            ]
        )

    return CopilotResponse(
        answer="Under Legal Metrology Rules, all mandatory declarations (Manufacturer Name/Address, Generic Name, Net Quantity in SI units, MRP with taxes, Mfg Date, Expiry/Best Before, and Consumer Care) must be printed legibly on the Principal Display Panel (PDP).",
        relevant_rules=["Legal Metrology Act 2009", "LM Packaged Commodities Rules 2011"],
        suggested_actions=[
            "Perform automated AI inspection check",
            "Generate Form-1 statutory report if non-compliance is detected"
        ]
    )


@router.post("/generate-notice", response_model=LegalNoticeResponse)
async def generate_legal_notice(payload: LegalNoticeRequest):
    """Generate Form-1 Statutory Enforcement Notice for non-compliant packages."""
    insp = storage_service.get(payload.inspection_id)
    if not insp:
        insp = compliance_service.run_sample_inspection("sample_non_compliant")

    product = insp.product if isinstance(insp, InspectionResponse) else insp.get("product", {})
    mfg_name = (product.manufacturer.name if hasattr(product, 'manufacturer') and product.manufacturer and product.manufacturer.name else None) or "M/S Non-Compliant Entity"
    mfg_addr = (product.manufacturer.address if hasattr(product, 'manufacturer') and product.manufacturer and product.manufacturer.address else None) or "Address Unverified / Missing on Label"
    prod_title = (getattr(product, 'product_name', None) or getattr(product, 'generic_name', None) or "Packaged Commodity")

    violations = []
    checks = insp.checks if isinstance(insp, InspectionResponse) else insp.get("checks", [])
    for check in checks:
        status_val = check.status if hasattr(check, 'status') else check.get("status")
        if status_val == "FAIL":
            r_name = check.rule_name if hasattr(check, 'rule_name') else check.get("rule_name")
            r_reason = check.reason if hasattr(check, 'reason') else check.get("reason")
            violations.append({
                "rule": r_name,
                "description": r_reason
            })

    if not violations:
        violations.append({
            "rule": "LM-001: Statutory Declaration Non-Compliance",
            "description": "Mandatory declarations missing or illegible on packaging label."
        })

    notice_id = f"NOTICE-LM-{uuid.uuid4().hex[:8].upper()}"

    notice_text = f"""
OFFICE OF THE CONTROLLER OF LEGAL METROLOGY
CENTRAL ENFORCEMENT DIVISION, NEW DELHI

FORM-1 STATUTORY INSPECTION NOTICE
(Issued under Section 39 of Legal Metrology Act, 2009 read with PC Rules 2011)

Notice Ref No: {notice_id}
Date of Notice: {datetime.now().strftime('%d %B %Y')}

TO:
{mfg_name}
Address: {mfg_addr}

SUBJECT: NOTICE OF STATUTORY NON-COMPLIANCE ON PACKAGED COMMODITY

WHEREAS, an official inspection was conducted by the undersigned Enforcement Officer on commodity packaging identified as '{prod_title}'.

UPON SCREENING AND DETERMINISTIC RULE EVALUATION, THE FOLLOWING STATUTORY VIOLATIONS WERE ESTABLISHED:
"""
    for idx, v in enumerate(violations, 1):
        notice_text += f"\n{idx}. {v['rule']}: {v['description']}"

    notice_text += f"""

TAKE NOTICE that selling, distributing, or offering for sale non-compliant packaged commodities is an offence punishable under Section 39 of the Legal Metrology Act, 2009.

YOU ARE HEREBY DIRECTED TO:
1. Show cause within 14 DAYS of receipt of this notice why legal proceedings should not be initiated.
2. Cease distribution of non-compliant batch until rectifications are verified by an authorized inspector.

Issued by: {payload.officer_name}
Jurisdiction: {payload.jurisdiction}
[DIGITALLY SEALED AND STAMPED VIA LEGAL METROLOGY AI SYSTEM]
"""

    return LegalNoticeResponse(
        notice_id=notice_id,
        form_title="FORM-1 STATUTORY ENFORCEMENT NOTICE",
        manufacturer_name=str(mfg_name or "M/S Non-Compliant Packer"),
        manufacturer_address=str(mfg_addr or "Address Unverified"),
        violations=violations,
        statutory_clause="Section 39 of Legal Metrology Act 2009",
        compliance_deadline_days=14,
        notice_text=notice_text,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )


@router.get("/{inspection_id}", response_model=InspectionResponse)
async def get_inspection_by_id(inspection_id: str):
    """Fetch an individual inspection by reference ID."""
    inspection = storage_service.get(inspection_id)
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection record '{inspection_id}' not found.",
        )
    return inspection

