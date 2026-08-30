from typing import List

def analyze_risks(proposals: List[dict], requirements: dict = None) -> List[dict]:
    """
    Run risk rules against each proposal using dynamic requirements if available.
    """
    if not requirements:
        requirements = {}

    req_min_sla = requirements.get("min_sla_uptime")
    req_max_budget = requirements.get("max_budget")
    req_max_weeks = requirements.get("max_implementation_weeks")
    required_features = requirements.get("required_features", [])

    # Calculate average cost across proposals that have it
    costs = [p["total_cost"] for p in proposals if p.get("total_cost")]
    avg_cost = sum(costs) / len(costs) if costs else None

    for proposal in proposals:
        flags = []
        
        # 1. Missing SLA
        if proposal.get("sla_uptime") is None:
            flags.append({"risk_id": "MISSING_SLA", "severity": "HIGH", "description": "No SLA uptime guarantee found in this proposal. This is a critical gap."})
        elif req_min_sla and proposal["sla_uptime"] < req_min_sla:
            flags.append({"risk_id": "SLA_VIOLATION", "severity": "HIGH", "description": f"SLA uptime ({proposal['sla_uptime']}%) is below your required minimum of {req_min_sla}%."})
        elif not req_min_sla and proposal["sla_uptime"] < 99.5:
            flags.append({"risk_id": "LOW_SLA", "severity": "MEDIUM", "description": "SLA uptime is below 99.5%, which may result in significant downtime."})
            
        # 2. Missing Cost / Budget Violation
        if proposal.get("total_cost") is None:
            flags.append({"risk_id": "MISSING_COST", "severity": "HIGH", "description": "Total cost was not found or clearly stated in this proposal."})
        elif req_max_budget and proposal["total_cost"] > req_max_budget:
            flags.append({"risk_id": "BUDGET_VIOLATION", "severity": "HIGH", "description": f"Vendor cost (${proposal['total_cost']:,.2f}) exceeds your maximum budget of ${req_max_budget:,.2f}."})
        elif avg_cost and proposal["total_cost"] > avg_cost * 1.5:
            flags.append({"risk_id": "COST_OUTLIER", "severity": "MEDIUM", "description": "Vendor cost is more than 50% above the average of all proposals."})
            
        # 3. Missing Mandatory Features
        vendor_features = [f.get("feature_name") for f in (proposal.get("features") or []) if f.get("is_included")]
        for rf in required_features:
            if rf not in vendor_features:
                flags.append({"risk_id": "MISSING_FEATURE", "severity": "HIGH", "description": f"Missing mandatory feature: {rf}"})
                
        # 4. Implementation Time
        if req_max_weeks and proposal.get("implementation_time_weeks") and proposal["implementation_time_weeks"] > req_max_weeks:
            flags.append({"risk_id": "TIMELINE_VIOLATION", "severity": "HIGH", "description": f"Implementation time ({proposal['implementation_time_weeks']} weeks) exceeds your required {req_max_weeks} weeks."})
            
        # 5. Penalties
        if not proposal.get("penalties_clause", False):
            flags.append({"risk_id": "NO_PENALTY_CLAUSE", "severity": "MEDIUM", "description": "No penalty clause for SLA breach detected. Vendor is not accountable for downtime."})
            
        proposal["risk_flags"] = flags
        proposal["risk_summary"] = {
            "HIGH":   sum(1 for f in flags if f["severity"] == "HIGH"),
            "MEDIUM": sum(1 for f in flags if f["severity"] == "MEDIUM"),
            "LOW":    sum(1 for f in flags if f["severity"] == "LOW"),
        }

    return proposals
