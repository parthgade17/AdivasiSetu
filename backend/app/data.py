"""Reference data: courses, document types, scheme seed data and baseline analytics.

Scheme amounts and deadlines are sample data for the prototype; verify them on the
official portals (scholarships.gov.in, tribal.nic.in, mahadbt.maharashtra.gov.in).
"""

COURSES = [
    "Class 1–5 (Pre-Primary)", "Class 6–8", "Class 9–10", "Class 11–12", "Diploma / ITI",
    "Bachelor's Degree (UG)", "Master's Degree (PG)", "Ph.D / Research", "Other",
]
POST_MATRIC = ["Class 11–12", "Diploma / ITI", "Bachelor's Degree (UG)", "Master's Degree (PG)", "Ph.D / Research"]

# key -> (name, description, mandatory)
DOC_TYPES = {
    "st_certificate": ("Scheduled Tribe (ST) Certificate", "Issued by Tehsildar or above", True),
    "income_certificate": ("Income Certificate", "Annual family income, issued by competent authority", True),
    "domicile": ("Domicile / Residence Certificate", "Proof of residence in the state", True),
    "marksheet": ("Previous Year Marksheet", "Last exam result certificate", True),
    "aadhaar": ("Aadhaar Card", "Valid Aadhaar card copy", True),
    "bank_passbook": ("Bank Passbook / Statement", "Account in student's name with IFSC, Aadhaar-seeded", True),
    "bonafide": ("College / School Bonafide", "Current enrollment certificate", True),
    "photo": ("Passport Size Photo", "Recent photograph (white background)", False),
    "itr": ("Income Tax Return / Form 16", "If annual income > ₹2.5 Lakh", False),
}
DIGILOCKER_DOCS = ["st_certificate", "domicile", "aadhaar"]

SCHEMES = [
    dict(
        name="Pre-Matric Scholarship for ST Students", deadline="2026-10-31", amount_value=6500,
        data=dict(ministry="Ministry of Tribal Affairs", amount="₹3,500 – ₹7,000", period="per year",
                  type="central", category="Pre-Matric", states="All States / UTs", link="https://scholarships.gov.in",
                  description="For ST students studying in Class 9 and 10. Monthly scholarship plus a yearly books and ad-hoc grant.",
                  criteria=["Class 9 or 10", "Annual family income ≤ ₹2.5 Lakh", "ST Certificate required"],
                  documents=["st_certificate", "income_certificate", "marksheet", "aadhaar", "bank_passbook", "bonafide"]),
        rules=dict(courses=["Class 9–10"], max_income=250000, states="all"),
    ),
    dict(
        name="Post-Matric Scholarship for ST Students", deadline="2026-11-15", amount_value=48000,
        data=dict(ministry="Ministry of Tribal Affairs", amount="Up to ₹1,50,000", period="per year",
                  type="central", category="Post-Matric", states="All States / UTs", link="https://scholarships.gov.in",
                  description="Covers compulsory fees and a monthly maintenance allowance for ST students in Class 11 and above, including professional courses.",
                  criteria=["Class 11 and above", "Annual family income ≤ ₹2.5 Lakh", "Recognised institution"],
                  documents=["st_certificate", "income_certificate", "marksheet", "aadhaar", "bank_passbook", "bonafide"]),
        rules=dict(courses=POST_MATRIC, max_income=250000, states="all"),
    ),
    dict(
        name="National Fellowship for ST Students", deadline="2026-12-15", amount_value=37000,
        data=dict(ministry="Ministry of Tribal Affairs", amount="JRF/SRF rates + HRA", period="per month",
                  type="central", category="Fellowship", states="All States / UTs", link="https://tribal.nic.in",
                  description="Fellowship for ST students enrolled in M.Phil or Ph.D programmes at recognised universities.",
                  criteria=["Enrolled in M.Phil or Ph.D", "Annual family income ≤ ₹6 Lakh", "Not employed full-time"],
                  documents=["st_certificate", "income_certificate", "marksheet", "aadhaar", "bank_passbook", "bonafide"]),
        rules=dict(courses=["Ph.D / Research"], max_income=600000, states="all"),
    ),
    dict(
        name="National Overseas Scholarship for ST Students", deadline="2027-02-28", amount_value=1500000,
        data=dict(ministry="Ministry of Tribal Affairs", amount="Full funding (abroad)", period="entire course",
                  type="central", category="Overseas", states="All States / UTs", link="https://tribal.nic.in",
                  description="Funding for ST students to pursue a Master's or Ph.D at recognised universities abroad.",
                  criteria=["Master's or Ph.D at a foreign university", "Annual family income ≤ ₹6 Lakh", "Age ≤ 35 years"],
                  documents=["st_certificate", "income_certificate", "marksheet", "aadhaar", "bank_passbook"]),
        rules=dict(courses=["Master's Degree (PG)", "Ph.D / Research"], max_income=600000, states="all"),
    ),
    dict(
        name="MahaDBT Scholarship – Maharashtra (Tribal Development)", deadline="2026-10-31", amount_value=18000,
        data=dict(ministry="Govt of Maharashtra", amount="₹5,000 – ₹80,000", period="per year",
                  type="state", category="State Scheme", states="Maharashtra only", link="https://mahadbt.maharashtra.gov.in",
                  description="State scholarships for ST students in Maharashtra, applied through the MahaDBT portal.",
                  criteria=["Maharashtra domicile", "Annual family income ≤ ₹8 Lakh", "Recognised institution in Maharashtra"],
                  documents=["st_certificate", "income_certificate", "domicile", "aadhaar", "bank_passbook", "bonafide"]),
        rules=dict(courses=["Class 9–10", "Class 11–12", "Diploma / ITI", "Bachelor's Degree (UG)", "Master's Degree (PG)"],
                   max_income=800000, states=["Maharashtra"]),
    ),
    dict(
        name="Post-Matric Scholarship for ST – Madhya Pradesh", deadline="2026-10-20", amount_value=25000,
        data=dict(ministry="Govt of Madhya Pradesh", amount="₹10,000 – ₹40,000", period="per year",
                  type="state", category="State Scheme", states="Madhya Pradesh only", link="https://scholarshipportal.mp.nic.in",
                  description="For ST students from Madhya Pradesh in professional and technical courses.",
                  criteria=["MP domicile", "UG or PG course", "Annual family income ≤ ₹6 Lakh"],
                  documents=["st_certificate", "income_certificate", "domicile", "aadhaar", "bank_passbook", "bonafide"]),
        rules=dict(courses=["Bachelor's Degree (UG)", "Master's Degree (PG)"], max_income=600000, states=["Madhya Pradesh"]),
    ),
]

# Application pipeline: (stage key, label shown to user, note)
STAGES = [
    ("submitted", "Submitted", "Application submitted successfully"),
    ("institute_verified", "Verified by Institution", "Institution verified enrolment and fee details"),
    ("state_verified", "State Verification", "State tribal welfare department reviewed income and ST certificate"),
    ("approved", "Approved", "Scholarship sanctioned"),
    ("disbursed", "Disbursed", "Amount credited to your Aadhaar-seeded bank account via DBT"),
]
STAGE_KEYS = [s[0] for s in STAGES]

REJECTION_REASONS = [
    "Expired Income Certificate", "Blurry/Invalid Documents", "Income Limit Exceeded",
    "Duplicate Application", "Incomplete Form", "Ineligible Course", "Others",
]

# Baseline analytics (historic national figures for the demo). Live app data is added on top.
BASELINE = dict(
    kpis=dict(eligible=842300, applications=98720, approved=84300, disbursed_cr=68.1, registered=124380),
    monthly=[
        dict(month="Apr", apps=820, approved=690, rejected=130, disbursed=580),
        dict(month="May", apps=1240, approved=1020, rejected=220, disbursed=900),
        dict(month="Jun", apps=1580, approved=1290, rejected=290, disbursed=1100),
        dict(month="Jul", apps=2100, approved=1750, rejected=350, disbursed=1620),
        dict(month="Aug", apps=1890, approved=1520, rejected=370, disbursed=1400),
        dict(month="Sep", apps=2450, approved=2100, rejected=350, disbursed=1950),
        dict(month="Oct", apps=3100, approved=2650, rejected=450, disbursed=0),
    ],
    districts=[
        dict(name="Gadchiroli", eligible=4800, applied=3120, approved=2680, rejected=437),
        dict(name="Nashik", eligible=6200, applied=4890, approved=4300, rejected=587),
        dict(name="Bastar", eligible=5100, applied=2100, approved=1720, rejected=378),
        dict(name="Mandla", eligible=3800, applied=2650, approved=2310, rejected=345),
        dict(name="Melghat", eligible=2900, applied=980, approved=720, rejected=265),
        dict(name="Dindori", eligible=3400, applied=2890, approved=2610, rejected=289),
        dict(name="Dang", eligible=1800, applied=670, approved=530, rejected=141),
        dict(name="Nandurbar", eligible=4100, applied=2300, approved=1980, rejected=299),
        dict(name="Dhule", eligible=3600, applied=2160, approved=1880, rejected=240),
        dict(name="Chandrapur", eligible=2700, applied=1150, approved=950, rejected=170),
        dict(name="Palghar", eligible=3900, applied=1720, approved=1430, rejected=260),
    ],
    scheme_wise={
        "Pre-Matric": dict(applications=42000, approved=38000, disbursed=35000, amount_cr=14.7),
        "Post-Matric": dict(applications=31000, approved=27500, disbursed=25000, amount_cr=38.2),
        "Fellowship": dict(applications=4200, approved=3100, disbursed=2800, amount_cr=5.8),
        "Overseas": dict(applications=320, approved=150, disbursed=120, amount_cr=2.1),
        "State Scheme": dict(applications=18000, approved=14200, disbursed=12000, amount_cr=9.4),
    },
    rejections={
        "Expired Income Certificate": 1820, "Blurry/Invalid Documents": 1430, "Income Limit Exceeded": 1040,
        "Duplicate Application": 780, "Incomplete Form": 650, "Ineligible Course": 450, "Others": 330,
    },
)
