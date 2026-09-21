import os
import copy
import base64
import uuid
import logging
from datetime import datetime
from typing import Optional
from PIL import Image

from ..schemas import (
    ProductData,
    ManufacturerInfo,
    QuantityInfo,
    MRPInfo,
    DateInfo,
    ConsumerCareInfo,
    EvidenceItem,
    InspectionResponse,
    ImageQualityInfo,
    OverallStatus,
)
from ..rules.rule_engine import rule_engine
from .ai_service import ai_service
from .storage_service import storage_service
from ..utils.image_utils import validate_and_inspect_image

logger = logging.getLogger(__name__)


def generate_inspection_id() -> str:
    """Generate official-looking inspection reference ID."""
    short_hash = uuid.uuid4().hex[:5].upper()
    year = datetime.now().year
    return f"LM-{year}-{short_hash}"


# Pre-configured Demo Data for reliable presentations and zero-API-key testing.
# All demo datasets MUST pass through the exact same deterministic rule engine.
DEMO_SAMPLES = {
    "sample_compliant": ProductData(
        product_name="Royal Butter Delight Biscuits",
        brand_name="Royal Treats",
        generic_name="Biscuits",
        category="Food",
        manufacturer=ManufacturerInfo(
            role="Manufactured by",
            name="ABC Foods & Confectioneries Pvt Ltd",
            address="Plot 45, Industrial Park, Nacharam, Hyderabad, Telangana - 500076",
        ),
        quantity=QuantityInfo(
            value="200",
            unit="g",
            raw_text="Net Wt. 200 g (7.05 oz)",
        ),
        mrp=MRPInfo(
            value="80.00",
            currency="INR",
            inclusive_of_taxes=True,
            raw_text="MRP ₹80.00 (Inclusive of all taxes)",
        ),
        dates=DateInfo(
            manufacture_date="07/2026",
            packing_date="07/2026",
            best_before="6 months from manufacture",
            use_by=None,
        ),
        consumer_care=ConsumerCareInfo(
            phone="1800-123-4567",
            email="care@abcfoods.example.in",
            address="Consumer Redressal Cell, Plot 45, Nacharam, Hyderabad - 500076",
        ),
        country_of_origin="India",
        package_type="normal",
        raw_evidence=[
            EvidenceItem(field="manufacturer", value="ABC Foods & Confectioneries Pvt Ltd", evidence="Manufactured by ABC Foods & Confectioneries Pvt Ltd, Plot 45, Industrial Park, Nacharam, Hyderabad, Telangana - 500076"),
            EvidenceItem(field="generic_name", value="Biscuits", evidence="Butter Delight Biscuits"),
            EvidenceItem(field="quantity", value="200 g", evidence="Net Wt. 200 g"),
            EvidenceItem(field="mrp", value="₹80.00", evidence="MRP ₹80.00 (Inclusive of all taxes)"),
            EvidenceItem(field="manufacture_date", value="07/2026", evidence="Mfg. Date: 07/2026"),
            EvidenceItem(field="best_before", value="6 months", evidence="Best before 6 months from packaging"),
            EvidenceItem(field="consumer_care", value="1800-123-4567", evidence="For complaints / feedback: Call Toll-Free 1800-123-4567 or email care@abcfoods.example.in"),
            EvidenceItem(field="country_of_origin", value="India", evidence="Made in India"),
        ],
    ),
    "sample_non_compliant": ProductData(
        product_name="Crunchy Masala Bites",
        brand_name="Crunchy",
        generic_name=None,  # Missing generic name
        category="Food",
        manufacturer=ManufacturerInfo(
            role="Manufactured by",
            name="XYZ Snack Hub",
            address=None,  # Missing address
        ),
        quantity=QuantityInfo(
            value="500",
            unit="g",
            raw_text="500g",
        ),
        mrp=MRPInfo(
            value="120.00",
            currency="INR",
            inclusive_of_taxes=False,  # Tax clause absent/unspecified
            raw_text="Price: Rs. 120",
        ),
        dates=DateInfo(
            manufacture_date=None,  # Missing mfg date
            packing_date=None,
            best_before=None,       # Missing best before for food category
            use_by=None,
        ),
        consumer_care=ConsumerCareInfo(
            phone=None,            # Missing consumer care contact
            email=None,
            address=None,
        ),
        country_of_origin=None,
        package_type="normal",
        raw_evidence=[
            EvidenceItem(field="manufacturer", value="XYZ Snack Hub", evidence="XYZ Snack Hub"),
            EvidenceItem(field="quantity", value="500 g", evidence="500g"),
            EvidenceItem(field="mrp", value="120", evidence="Price: Rs. 120"),
        ],
    ),
    "sample_cosmetics": ProductData(
        product_name="Botanical Glow Herbal Shampoo",
        brand_name="Botanica Herbals",
        generic_name="Shampoo",
        category="Cosmetics",
        manufacturer=ManufacturerInfo(
            role="Manufactured by",
            name="NatureCare Labs Pvt Ltd",
            address="Plot 12, Industrial Area, Sector 58, Mohali, Punjab - 160071",
        ),
        quantity=QuantityInfo(
            value="250",
            unit="ml",
            raw_text="Net Vol. 250 ml (8.45 fl oz)",
        ),
        mrp=MRPInfo(
            value="299.00",
            currency="INR",
            inclusive_of_taxes=True,
            raw_text="MRP ₹299.00 (Inclusive of all taxes)",
        ),
        dates=DateInfo(
            manufacture_date="05/2026",
            packing_date="05/2026",
            best_before="24 months from manufacture",
            use_by="05/2028",
        ),
        consumer_care=ConsumerCareInfo(
            phone="1800-888-9999",
            email="support@naturecare.example.in",
            address="Consumer Grievance Cell, Sector 58, Mohali - 160071",
        ),
        country_of_origin="India",
        package_type="normal",
        raw_evidence=[
            EvidenceItem(field="manufacturer", value="NatureCare Labs Pvt Ltd", evidence="Manufactured by NatureCare Labs Pvt Ltd, Mohali, Punjab - 160071"),
            EvidenceItem(field="generic_name", value="Shampoo", evidence="Herbal Hair Shampoo"),
            EvidenceItem(field="quantity", value="250 ml", evidence="Net Vol. 250 ml"),
            EvidenceItem(field="mrp", value="₹299.00", evidence="MRP ₹299.00 (Inclusive of all taxes)"),
            EvidenceItem(field="manufacture_date", value="05/2026", evidence="Mfg. Date: 05/2026"),
            EvidenceItem(field="use_by", value="05/2028", evidence="Expiry Date: 05/2028"),
            EvidenceItem(field="consumer_care", value="1800-888-9999", evidence="Customer Helpline: 1800-888-9999"),
            EvidenceItem(field="country_of_origin", value="India", evidence="Country of Origin: India"),
        ],
    ),
    "sample_electronics": ProductData(
        product_name="Smart Glow 9W LED Lamp",
        brand_name="Lumina Smart",
        generic_name="LED Bulb",
        category="Electronics",
        manufacturer=ManufacturerInfo(
            role="Manufactured & Packed by",
            name="Lumina Electronics India Pvt Ltd",
            address="Plot 88, Electronic City Phase 1, Bengaluru, Karnataka - 560100",
        ),
        quantity=QuantityInfo(
            value="1",
            unit="N",
            raw_text="Net Qty: 1 N (1 Unit)",
        ),
        mrp=MRPInfo(
            value="449.00",
            currency="INR",
            inclusive_of_taxes=True,
            raw_text="MRP ₹449.00 (Incl. of all taxes)",
        ),
        dates=DateInfo(
            manufacture_date="06/2026",
            packing_date="06/2026",
            best_before=None,
            use_by=None,
        ),
        consumer_care=ConsumerCareInfo(
            phone="1800-200-4455",
            email="care@luminasmart.example.in",
            address="Lumina Customer Care, Bengaluru - 560100",
        ),
        country_of_origin="India",
        package_type="normal",
        raw_evidence=[
            EvidenceItem(field="manufacturer", value="Lumina Electronics India Pvt Ltd", evidence="Manufactured & Packed by Lumina Electronics, Bengaluru - 560100"),
            EvidenceItem(field="generic_name", value="LED Bulb", evidence="Smart LED Lamp 9W B22"),
            EvidenceItem(field="quantity", value="1 N", evidence="Net Qty: 1 N"),
            EvidenceItem(field="mrp", value="₹449.00", evidence="MRP ₹449.00 (Incl. of all taxes)"),
            EvidenceItem(field="manufacture_date", value="06/2026", evidence="Date of Import/Manufacture: 06/2026"),
            EvidenceItem(field="consumer_care", value="1800-200-4455", evidence="Helpline: 1800-200-4455"),
            EvidenceItem(field="country_of_origin", value="India", evidence="Country of Origin: India"),
        ],
    ),
    "sample_household": ProductData(
        product_name="PowerClean Surface Sanitizer & Cleaner",
        brand_name="SparkleCare",
        generic_name="Surface Cleaner",
        category="Household",
        manufacturer=ManufacturerInfo(
            role="Manufactured by",
            name="ChemClean Products India Ltd",
            address="Plot 104, GIDC Industrial Estate, Ankleshwar, Gujarat - 393002",
        ),
        quantity=QuantityInfo(
            value="500",
            unit="ml",
            raw_text="Net Volume: 500 ml",
        ),
        mrp=MRPInfo(
            value="145.00",
            currency="INR",
            inclusive_of_taxes=True,
            raw_text="MRP ₹145.00 (Inclusive of all taxes)",
        ),
        dates=DateInfo(
            manufacture_date="04/2026",
            packing_date="04/2026",
            best_before="18 months from packaging",
            use_by=None,
        ),
        consumer_care=ConsumerCareInfo(
            phone="1800-456-7890",
            email="customercare@sparklecare.example.in",
            address="SparkleCare Grievance Cell, Ankleshwar, Gujarat - 393002",
        ),
        country_of_origin="India",
        package_type="normal",
        raw_evidence=[
            EvidenceItem(field="manufacturer", value="ChemClean Products India Ltd", evidence="Manufactured by ChemClean Products, Ankleshwar, Gujarat - 393002"),
            EvidenceItem(field="generic_name", value="Surface Cleaner", evidence="Multi-surface Disinfectant Cleaner"),
            EvidenceItem(field="quantity", value="500 ml", evidence="Net Volume: 500 ml"),
            EvidenceItem(field="mrp", value="₹145.00", evidence="MRP ₹145.00 (Inclusive of all taxes)"),
            EvidenceItem(field="manufacture_date", value="04/2026", evidence="Mfg. Date: 04/2026"),
            EvidenceItem(field="best_before", value="18 months", evidence="Best before 18 months"),
            EvidenceItem(field="consumer_care", value="1800-456-7890", evidence="Toll Free: 1800-456-7890"),
            EvidenceItem(field="country_of_origin", value="India", evidence="Made in India"),
        ],
    ),
}


class ComplianceService:
    """High-level orchestration service for package compliance inspections."""

    def __init__(self):
        self._seed_initial_history()

    def _seed_initial_history(self):
        """Seed demo historical inspections if storage is empty."""
        existing = storage_service.list_all()
        if not existing:
            # Seed Demo Sample Compliant
            p1 = DEMO_SAMPLES["sample_compliant"]
            checks1, sum1, status1, score1 = rule_engine.evaluate(p1)
            resp1 = InspectionResponse(
                inspection_id="LM-2026-DEMO1",
                status=status1,
                score=score1,
                category="Food",
                product=p1,
                checks=checks1,
                summary=sum1,
                image_metadata=ImageQualityInfo(
                    width=1280,
                    height=720,
                    format="JPEG",
                    file_size_kb=245.5,
                    quality_label="GOOD",
                    text_visibility="CLEAR",
                ),
                created_at="2026-08-28T10:15:30",
                is_demo=True,
                officer_id="LM-DEMO-2026",
                officer_name="Demo Inspection Officer",
            )
            storage_service.save(resp1)

            # Seed Demo Sample Non-Compliant
            p2 = DEMO_SAMPLES["sample_non_compliant"]
            checks2, sum2, status2, score2 = rule_engine.evaluate(p2)
            resp2 = InspectionResponse(
                inspection_id="LM-2026-DEMO2",
                status=status2,
                score=score2,
                category="Food",
                product=p2,
                checks=checks2,
                summary=sum2,
                image_metadata=ImageQualityInfo(
                    width=800,
                    height=600,
                    format="PNG",
                    file_size_kb=180.2,
                    quality_label="MODERATE",
                    text_visibility="READABLE",
                ),
                created_at="2026-08-28T14:40:12",
                is_demo=True,
                officer_id="LM-DEMO-2026",
                officer_name="Demo Inspection Officer",
            )
            storage_service.save(resp2)

    def process_inspection(
        self,
        image_bytes: bytes,
        category_hint: Optional[str] = None,
        force_demo_sample: Optional[str] = None,
        officer_id: Optional[str] = None,
        officer_name: Optional[str] = None,
    ) -> InspectionResponse:
        """Run full end-to-end inspection pipeline."""
        # 1. Pillow Image Validation & Dimension Inspection
        pil_image, img_meta = validate_and_inspect_image(image_bytes)

        is_demo = False
        product_data: ProductData

        # 2. Information Extraction (Gemini AI or Demo Fallback)
        if force_demo_sample and force_demo_sample in DEMO_SAMPLES:
            product_data = copy.deepcopy(DEMO_SAMPLES[force_demo_sample])
            is_demo = True
        elif ai_service.is_configured():
            # AI Extracts and structures product data from the live uploaded image.
            # If extraction fails, raise the error — do NOT silently fall back to
            # demo data, as that would show fabricated PASS results for the user's
            # actual image.
            product_data = ai_service.extract_product_data(pil_image, category_hint)
        else:
            # Gemini API key is not configured and this is a real image upload.
            # Raise an error instead of silently returning fabricated demo results.
            raise ValueError(
                "Gemini AI API key is not configured. Cannot analyze real package images. "
                "Please configure GEMINI_API_KEY in the backend .env file, or use a Demo Sample for testing."
            )

        # Override category if user provided explicit selection and not auto-detect
        if category_hint and category_hint.lower() not in ["auto detect", ""]:
            product_data.category = category_hint

        # 3. Deterministic Compliance Rule Engine
        # Pure algorithmic compliance evaluation
        checks, summary, overall_status, score = rule_engine.evaluate(product_data)

        # 4. Generate Response & Save
        inspection_id = generate_inspection_id()
        created_at = datetime.now().isoformat()

        # Convert image to Base64 Data URL for persistent database storage
        fmt = (img_meta.format or "JPEG").lower()
        if fmt == "jpg":
            fmt = "jpeg"
        b64_str = base64.b64encode(image_bytes).decode("utf-8")
        product_data.image_url = f"data:image/{fmt};base64,{b64_str}"

        # Also save physical image file to uploads folder
        uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        image_path = os.path.join(uploads_dir, f"{inspection_id}.{fmt}")
        try:
            with open(image_path, "wb") as f:
                f.write(image_bytes)
        except Exception as e:
            logger.warning("Could not save image to uploads directory: %s", e)

        response = InspectionResponse(
            inspection_id=inspection_id,
            status=overall_status,
            score=score,
            category=product_data.category or "Other",
            product=product_data,
            checks=checks,
            summary=summary,
            image_metadata=img_meta,
            created_at=created_at,
            is_demo=is_demo,
            officer_id=officer_id,
            officer_name=officer_name,
        )

        storage_service.save(response)
        return response

    def run_sample_inspection(self, sample_type: str, officer_id: Optional[str] = None, officer_name: Optional[str] = None) -> InspectionResponse:
        """Execute instant demo inspection for predefined sample.
        Must NOT bypass the deterministic compliance engine.
        """
        if sample_type not in DEMO_SAMPLES:
            sample_type = "sample_compliant"

        # 1. Fetch Demo Product Data (Deep copy to prevent mutation)
        product_data = copy.deepcopy(DEMO_SAMPLES[sample_type])

        # Attach sample package SVG image
        if sample_type == "sample_compliant":
            product_data.image_url = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="%230F2942"/><text x="50" y="80" fill="%23FFF" font-size="28">ROYAL TREATS</text><text x="50" y="130" fill="%23FFF" font-size="20">Butter Delight Biscuits</text><text x="50" y="200" fill="%23FCD34D" font-size="16">Net Wt: 200g | MRP: Rs. 80.00 (Incl taxes)</text><text x="50" y="250" fill="%23FFF" font-size="14">Mfg: 07/2026 | Best Before: 6 mos</text><text x="50" y="300" fill="%23CBD5E1" font-size="12">ABC Foods, Hyderabad - 500076</text></svg>'
        else:
            product_data.image_url = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="%237F1D1D"/><text x="50" y="80" fill="%23FFF" font-size="28">CRUNCHY BITES</text><text x="50" y="130" fill="%23FECACA" font-size="18">Price: Rs. 120 | Net: 500g</text><text x="50" y="200" fill="%23FCA5A5" font-size="14">[MISSING ADDRESS, MFG DATE &amp; CARE]</text></svg>'

        # 2. Pass through the EXACT same deterministic rule engine
        checks, summary, overall_status, score = rule_engine.evaluate(product_data)

        # 3. Formulate Inspection Response
        inspection_id = generate_inspection_id()
        created_at = datetime.now().isoformat()

        response = InspectionResponse(
            inspection_id=inspection_id,
            status=overall_status,
            score=score,
            category=product_data.category or "Food",
            product=product_data,
            checks=checks,
            summary=summary,
            image_metadata=ImageQualityInfo(
                width=1024,
                height=768,
                format="JPEG",
                file_size_kb=310.0,
                quality_label="GOOD",
                text_visibility="CLEAR",
            ),
            created_at=created_at,
            is_demo=True,
            officer_id=officer_id,
            officer_name=officer_name,
        )

        storage_service.save(response)
        return response


compliance_service = ComplianceService()
