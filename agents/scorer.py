from typing import List, Optional

def calculate_scores(proposals: List[dict], total_required_features: int = 10) -> List[dict]:
    """
    Deterministic scoring engine. Max score = 100 points.

    Weights:
      - Cost:             40%  (lower is better)
      - SLA Uptime:       30%  (higher is better)
      - Feature Coverage: 20%  (more features included = better)
      - Speed:            10%  (fewer implementation weeks = better)
    """

    # Filter out proposals with missing critical fields
    valid = [p for p in proposals if p.get("total_cost") and p.get("sla_uptime")]

    if not valid:
        return proposals  # Return as-is if nothing to compare

    # Reference values for relative scoring
    min_cost  = min(p["total_cost"] for p in valid)
    max_sla   = max(p["sla_uptime"] for p in valid)
    min_weeks = min(
        p["implementation_time_weeks"] for p in valid
        if p.get("implementation_time_weeks")
    ) if any(p.get("implementation_time_weeks") for p in valid) else 1

    for p in proposals:
        cost  = p.get("total_cost")
        sla   = p.get("sla_uptime")
        weeks = p.get("implementation_time_weeks")
        features_included = sum(
            1 for f in (p.get("features") or []) if f.get("is_included")
        )

        cost_score    = (min_cost / cost)   * 40 if cost  else 0
        sla_score     = (sla / max_sla)     * 30 if sla   else 0
        feature_ratio = min(features_included / total_required_features, 1.0)
        feature_score = feature_ratio * 20
        speed_score   = (min_weeks / weeks) * 10 if weeks else 0

        total = cost_score + sla_score + feature_score + speed_score
        
        # Hard cap the total score at 100 just in case
        total = min(total, 100)

        p["score"] = round(total, 2)
        p["score_breakdown"] = {
            "cost_score":    round(cost_score, 2),
            "sla_score":     round(sla_score, 2),
            "feature_score": round(feature_score, 2),
            "speed_score":   round(speed_score, 2),
        }
        p["features_included_count"] = features_included

    # Sort by score descending
    proposals.sort(key=lambda x: x.get("score", 0), reverse=True)

    # Mark the top scorer as recommended
    if proposals:
        proposals[0]["is_recommended"] = True
        for p in proposals[1:]:
            p["is_recommended"] = False

    return proposals


def get_recommendation_reason(proposals: List[dict]) -> Optional[str]:
    """Generate a plain-English reason for the top recommendation."""
    if not proposals:
        return None

    top = proposals[0]
    name = top.get("vendor_name", "This vendor")
    score = top.get("score", 0)
    breakdown = top.get("score_breakdown", {})

    strengths = []
    if breakdown.get("cost_score", 0) >= 35:
        strengths.append("competitive pricing")
    if breakdown.get("sla_score", 0) >= 28:
        strengths.append("strong SLA uptime")
    if breakdown.get("feature_score", 0) >= 18:
        strengths.append("high feature coverage")
    if breakdown.get("speed_score", 0) >= 8:
        strengths.append("fast implementation timeline")

    if strengths:
        reason = f"{name} scored {score}/100, leading on {', '.join(strengths)}."
    else:
        reason = f"{name} scored {score}/100 and is the best overall fit."

    return reason
