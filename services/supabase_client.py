import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# ─────────────────────────────────────────────
# VENDORS
# ─────────────────────────────────────────────

def upsert_vendor(name: str, contact_email: str = None) -> dict:
    """Insert or fetch existing vendor by name."""
    existing = supabase.table("vendors").select("*").eq("name", name).execute()
    if existing.data:
        return existing.data[0]
    result = supabase.table("vendors").insert({
        "name": name,
        "contact_email": contact_email
    }).execute()
    return result.data[0]


# ─────────────────────────────────────────────
# PROPOSALS
# ─────────────────────────────────────────────

def safe_num(val):
    """Convert a value to float if possible, else return None."""
    if val is None:
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None  # Vague strings like "We strive for maximum availability" become None

def safe_int(val):
    """Convert a value to int if possible, else return None."""
    if val is None:
        return None
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return None

def insert_proposal(vendor_id: str, data: dict, raw_text: str, confidence: float) -> dict:
    """Insert a new proposal record."""
    result = supabase.table("proposals").insert({
        "vendor_id":                vendor_id,
        "total_cost":               safe_num(data.get("total_cost")),
        "implementation_time_weeks": safe_int(data.get("implementation_time_weeks")),
        "sla_uptime":               safe_num(data.get("sla_uptime")),
        "payment_terms":            data.get("payment_terms"),
        "warranty_months":          safe_int(data.get("warranty_months")),
        "support_level":            data.get("support_level"),
        "contract_length_months":   safe_int(data.get("contract_length_months")),
        "penalties_clause":         bool(data.get("penalties_clause", False)),
        "raw_text":                 raw_text[:5000],
        "extraction_confidence":    confidence
    }).execute()
    return result.data[0]


def get_all_proposals() -> list:
    """Fetch all proposals with their vendor name and features."""
    proposals = supabase.table("proposals").select(
        "*, vendors(name, contact_email)"
    ).execute().data

    for p in proposals:
        # Attach vendor name at top level for convenience
        p["vendor_name"] = p.get("vendors", {}).get("name") if p.get("vendors") else None

        # Fetch features for this proposal
        features = supabase.table("feature_sets").select("*").eq(
            "proposal_id", p["id"]
        ).execute().data
        p["features"] = features

    return proposals


def delete_proposal(proposal_id: str) -> bool:
    """Delete a proposal and its features (cascade handled by DB)."""
    supabase.table("proposals").delete().eq("id", proposal_id).execute()
    return True


# ─────────────────────────────────────────────
# FEATURES
# ─────────────────────────────────────────────

def insert_features(proposal_id: str, features: list) -> None:
    """Bulk insert extracted features for a proposal."""
    if not features:
        return
    rows = [
        {
            "proposal_id":   proposal_id,
            "feature_name":  f.get("feature_name", "Unknown"),
            "is_included":   f.get("is_included", False),
            "notes":         f.get("notes")
        }
        for f in features
    ]
    supabase.table("feature_sets").insert(rows).execute()


# ─────────────────────────────────────────────
# REQUIREMENTS
# ─────────────────────────────────────────────

def upsert_requirements(session_id: str, data: dict) -> dict:
    """Save or overwrite requirements for this session."""
    # Delete existing for this session first
    supabase.table("requirements").delete().eq("session_id", session_id).execute()

    rows = []

    # Insert feature requirements
    for feature in data.get("required_features", []):
        rows.append({
            "session_id":   session_id,
            "feature_name": feature,
            "is_mandatory": True,
            "max_budget":   data.get("max_budget"),
            "min_sla_uptime": data.get("min_sla_uptime"),
            "max_implementation_weeks": data.get("max_implementation_weeks")
        })

    if rows:
        supabase.table("requirements").insert(rows).execute()

    return {"session_id": session_id, "saved": len(rows)}


def get_requirements(session_id: str) -> dict:
    """Fetch requirements for a session."""
    rows = supabase.table("requirements").select("*").eq(
        "session_id", session_id
    ).execute().data

    if not rows:
        return {}

    return {
        "max_budget":               rows[0].get("max_budget"),
        "min_sla_uptime":           rows[0].get("min_sla_uptime"),
        "max_implementation_weeks": rows[0].get("max_implementation_weeks"),
        "required_features":        [r["feature_name"] for r in rows]
    }
