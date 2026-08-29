from typing import List

RISK_RULES = [
    {
        "id": "MISSING_SLA",
        "severity": "HIGH",
        "check": lambda p, _avg: p.get("sla_uptime") is None,
        "description": "No SLA uptime guarantee found in this proposal. This is a critical gap."
    },
    {
        "id": "MISSING_COST",
        "severity": "HIGH",
        "check": lambda p, _avg: p.get("total_cost") is None,
        "description": "Total cost was not found or clearly stated in this proposal."
    },
    {
        "id": "NO_PENALTY_CLAUSE",
        "severity": "MEDIUM",
        "check": lambda p, _avg: not p.get("penalties_clause", False),
        "description": "No penalty clause for SLA breach detected. Vendor is not accountable for downtime."
    },
    {
        "id": "COST_OUTLIER",
        "severity": "MEDIUM",
        "check": lambda p, avg: p.get("total_cost") and avg and p["total_cost"] > avg * 1.5,
        "description": "Vendor cost is more than 50% above the average of all proposals."
    },
    {
        "id": "LOW_SLA",
        "severity": "MEDIUM",
        "check": lambda p, _avg: p.get("sla_uptime") and p["sla_uptime"] < 99.5,
        "description": "SLA uptime is below 99.5%, which may result in significant downtime (~43 hrs/year)."
    },
    {
        "id": "SHORT_WARRANTY",
        "severity": "LOW",
        "check": lambda p, _avg: p.get("warranty_months") and p["warranty_months"] < 12,
        "description": "Warranty period is less than 12 months, which is below industry standard."
    },
    {
        "id": "MISSING_SUPPORT_LEVEL",
        "severity": "LOW",
        "check": lambda p, _avg: p.get("support_level") is None,
        "description": "Support level (e.g. 24/7 or business hours) was not specified in the proposal."
    },
    {
        "id": "SLOW_IMPLEMENTATION",
        "severity": "LOW",
        "check": lambda p, _avg: p.get("implementation_time_weeks") and p["implementation_time_weeks"] > 24,
        "description": "Implementation timeline exceeds 24 weeks (6 months), which may delay business value."
    },
]

def analyze_risks(proposals: List[dict]) -> List[dict]:
    """
    Run all risk rules against each proposal.
    Attaches risk_flags list to each proposal dict.
    """
    # Calculate average cost across proposals that have it
    costs = [p["total_cost"] for p in proposals if p.get("total_cost")]
    avg_cost = sum(costs) / len(costs) if costs else None

    for proposal in proposals:
        flags = []
        for rule in RISK_RULES:
            try:
                triggered = rule["check"](proposal, avg_cost)
            except Exception:
                triggered = False

            if triggered:
                flags.append({
                    "risk_id":    rule["id"],
                    "severity":   rule["severity"],
                    "description": rule["description"]
                })

        proposal["risk_flags"] = flags
        proposal["risk_summary"] = {
            "HIGH":   sum(1 for f in flags if f["severity"] == "HIGH"),
            "MEDIUM": sum(1 for f in flags if f["severity"] == "MEDIUM"),
            "LOW":    sum(1 for f in flags if f["severity"] == "LOW"),
        }

    return proposals
