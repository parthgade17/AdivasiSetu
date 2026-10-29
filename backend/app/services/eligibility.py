"""Rule-based eligibility engine. Every scheme carries rules: courses, max_income, states."""


def _fmt_lakh(n: int) -> str:
    return f"₹{n / 100000:g} Lakh"


def evaluate(rules: dict, profile: dict) -> dict:
    profile = profile or {}
    reasons, failed = [], []
    category = (profile.get("category") or "ST").upper()
    if category == "ST":
        reasons.append("ST category confirmed")
    else:
        failed.append("Only for Scheduled Tribe students")

    course = profile.get("course") or ""
    courses = rules.get("courses")
    if courses:
        if course in courses:
            reasons.append("Your course matches")
        else:
            failed.append(f"Course not covered ({course or 'not given'})")

    max_income = rules.get("max_income")
    if max_income:
        try:
            income = int(float(str(profile.get("income") or 0).replace(",", "")))
        except ValueError:
            income = 0
        if income <= max_income:
            reasons.append(f"Income under {_fmt_lakh(max_income)}")
        else:
            failed.append(f"Family income above {_fmt_lakh(max_income)}")

    states = rules.get("states", "all")
    if states != "all":
        if profile.get("state") in states:
            reasons.append(f"{profile.get('state')} domicile")
        else:
            failed.append(f"Only for {', '.join(states)} residents")

    return {"eligible": not failed, "reasons": reasons, "failed": failed}
