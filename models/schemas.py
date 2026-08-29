from pydantic import BaseModel
from typing import List, Optional

class RequirementsInput(BaseModel):
    session_id: str = "default"
    max_budget: Optional[float] = None
    min_sla_uptime: Optional[float] = None
    max_implementation_weeks: Optional[int] = None
    required_features: List[str] = []

class FeatureItem(BaseModel):
    feature_name: str
    is_included: bool
    notes: Optional[str] = None

class ScoreBreakdown(BaseModel):
    cost_score: float
    sla_score: float
    feature_score: float
    speed_score: float

class RiskFlag(BaseModel):
    risk_id: str
    severity: str  # HIGH | MEDIUM | LOW
    description: str

class RiskSummary(BaseModel):
    HIGH: int
    MEDIUM: int
    LOW: int

class VendorComparison(BaseModel):
    proposal_id: str
    vendor_name: Optional[str]
    total_cost: Optional[float]
    implementation_time_weeks: Optional[int]
    sla_uptime: Optional[float]
    payment_terms: Optional[str]
    support_level: Optional[str]
    score: Optional[float]
    score_breakdown: Optional[ScoreBreakdown]
    features: List[FeatureItem] = []
    risk_flags: List[RiskFlag] = []
    risk_summary: Optional[RiskSummary]
    is_recommended: bool = False
    features_included_count: int = 0

class CompareResponse(BaseModel):
    vendors: List[VendorComparison]
    recommended_vendor: Optional[str]
    recommendation_reason: Optional[str]
