"""Inspection Storage Service: MySQL relational persistence with data isolation."""
import logging
from typing import List, Optional, Dict
from ..schemas import InspectionResponse
from .db_service import db_service

logger = logging.getLogger(__name__)


class StorageService:
    """Manages inspection history using MySQL relational database as primary source of truth."""

    def __init__(self):
        self.db = db_service

    def save(self, inspection: InspectionResponse) -> InspectionResponse:
        data = inspection.model_dump()
        self.db.save_inspection(data)
        return inspection

    def get(self, inspection_id: str) -> Optional[InspectionResponse]:
        item = self.db.get_inspection(inspection_id)
        if item:
            try:
                return InspectionResponse(**item)
            except Exception as e:
                logger.error(f"Error deserializing inspection {inspection_id}: {e}")
                return None
        return None

    def list_all(self, officer_id: Optional[str] = None) -> List[dict]:
        """Return inspections sorted descending by creation timestamp.
        Strictly filters by officer_id if provided.
        """
        return self.db.list_inspections(officer_id=officer_id)

    def clear(self):
        self.db.clear_inspections()


storage_service = StorageService()
