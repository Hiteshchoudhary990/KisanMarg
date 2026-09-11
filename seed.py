"""
Seed data generator for KisanMarg - Gujarat Centric APMC Mandis
Populates SQLite database and exports JSON for static frontend & Vercel deployment.
"""

import json
import os
import sqlite3
from datetime import datetime, timedelta

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DB_PATH = os.path.join(os.path.dirname(__file__), "mandi_data.sqlite")
FRONTEND_DATA_DIR = os.path.join(BASE_DIR, "frontend", "data")
FRONTEND_JSON_PATH = os.path.join(FRONTEND_DATA_DIR, "mandis_gujarat.json")

# 1. GUJARAT APMC MANDIS
GUJARAT_MANDIS = [
    {
        "id": "APMC-GDL",
        "name": "Gondal APMC Market Yard",
        "gujarati_name": "ગોંડલ માર્કેટિંગ યાર્ડ",
        "district": "Rajkot",
        "taluka": "Gondal",
        "state": "Gujarat",
        "latitude": 21.9619,
        "longitude": 70.7937,
        "contact_phone": "+91 2825 220033",
        "operating_hours": "07:00 AM - 04:00 PM",
        "avg_gate_wait_hours": 4.2,
        "current_queue_vehicles": 28,
        "apmc_cess_pct": 0.90,
        "trader_commission_pct": 1.5,
        "hamali_per_quintal": 26.0,
        "weighment_fee_per_vehicle": 120.0
    },
    {
        "id": "APMC-RJK",
        "name": "Rajkot APMC (Bedi Yard)",
        "gujarati_name": "રાજકોટ બેડી માર્કેટિંગ યાર્ડ",
        "district": "Rajkot",
        "taluka": "Rajkot",
        "state": "Gujarat",
        "latitude": 22.3524,
        "longitude": 70.8022,
        "contact_phone": "+91 281 2701401",
        "operating_hours": "06:30 AM - 05:00 PM",
        "avg_gate_wait_hours": 3.0,
        "current_queue_vehicles": 19,
        "apmc_cess_pct": 1.00,
        "trader_commission_pct": 1.75,
        "hamali_per_quintal": 28.0,
        "weighment_fee_per_vehicle": 150.0
    },
    {
        "id": "APMC-UNJ",
        "name": "Unjha APMC (Global Spice Hub)",
        "gujarati_name": "ઊંઝા ગંજ બજાર (મસાલા માર્કેટ)",
        "district": "Mehsana",
        "taluka": "Unjha",
        "state": "Gujarat",
        "latitude": 23.8038,
        "longitude": 72.3926,
        "contact_phone": "+91 2767 252123",
        "operating_hours": "08:00 AM - 06:00 PM",
        "avg_gate_wait_hours": 5.5,
        "current_queue_vehicles": 42,
        "apmc_cess_pct": 1.20,
        "trader_commission_pct": 2.0,
        "hamali_per_quintal": 32.0,
        "weighment_fee_per_vehicle": 180.0
    },
    {
        "id": "APMC-AMR",
        "name": "Amreli APMC Market",
        "gujarati_name": "અમરેલી માર્કેટ યાર્ડ",
        "district": "Amreli",
        "taluka": "Amreli",
        "state": "Gujarat",
        "latitude": 21.6032,
        "longitude": 71.2221,
        "contact_phone": "+91 2792 223145",
        "operating_hours": "07:30 AM - 03:30 PM",
        "avg_gate_wait_hours": 2.5,
        "current_queue_vehicles": 14,
        "apmc_cess_pct": 0.85,
        "trader_commission_pct": 1.4,
        "hamali_per_quintal": 24.0,
        "weighment_fee_per_vehicle": 110.0
    },
    {
        "id": "APMC-JND",
        "name": "Junagadh APMC Yard",
        "gujarati_name": "જૂનાગઢ ખેતીવાડી ઉત્પન્ન બજાર",
        "district": "Junagadh",
        "taluka": "Junagadh",
        "state": "Gujarat",
        "latitude": 21.5222,
        "longitude": 70.4579,
        "contact_phone": "+91 285 2650190",
        "operating_hours": "07:00 AM - 04:00 PM",
        "avg_gate_wait_hours": 3.8,
        "current_queue_vehicles": 22,
        "apmc_cess_pct": 0.95,
        "trader_commission_pct": 1.5,
        "hamali_per_quintal": 25.0,
        "weighment_fee_per_vehicle": 130.0
    },
    {
        "id": "APMC-JMN",
        "name": "Jamnagar APMC (Hapa Market)",
        "gujarati_name": "જામનગર હાપા માર્કેટિંગ યાર્ડ",
        "district": "Jamnagar",
        "taluka": "Jamnagar",
        "state": "Gujarat",
        "latitude": 22.4572,
        "longitude": 70.1284,
        "contact_phone": "+91 288 2571201",
        "operating_hours": "07:00 AM - 04:30 PM",
        "avg_gate_wait_hours": 2.8,
        "current_queue_vehicles": 16,
        "apmc_cess_pct": 0.90,
        "trader_commission_pct": 1.5,
        "hamali_per_quintal": 25.0,
        "weighment_fee_per_vehicle": 120.0
    },
    {
        "id": "APMC-BTD",
        "name": "Botad APMC Market Yard",
        "gujarati_name": "બોટાદ કપાસ અને અનાજ યાર્ડ",
        "district": "Botad",
        "taluka": "Botad",
        "state": "Gujarat",
        "latitude": 22.1706,
        "longitude": 71.6664,
        "contact_phone": "+91 2849 251034",
        "operating_hours": "07:30 AM - 04:00 PM",
        "avg_gate_wait_hours": 3.1,
        "current_queue_vehicles": 20,
        "apmc_cess_pct": 0.90,
        "trader_commission_pct": 1.5,
        "hamali_per_quintal": 25.0,
        "weighment_fee_per_vehicle": 120.0
    },
    {
        "id": "APMC-MSN",
        "name": "Mehsana APMC Yard",
        "gujarati_name": "મહેસાણા એ.પી.એમ.સી.",
        "district": "Mehsana",
        "taluka": "Mehsana",
        "state": "Gujarat",
        "latitude": 23.5880,
        "longitude": 72.3693,
        "contact_phone": "+91 2762 254122",
        "operating_hours": "08:00 AM - 05:00 PM",
        "avg_gate_wait_hours": 2.4,
        "current_queue_vehicles": 12,
        "apmc_cess_pct": 1.00,
        "trader_commission_pct": 1.6,
        "hamali_per_quintal": 27.0,
        "weighment_fee_per_vehicle": 140.0
    },
    {
        "id": "APMC-HMT",
        "name": "Himatnagar APMC",
        "gujarati_name": "હિંમતનગર ખેત બજાર",
        "district": "Sabarkantha",
        "taluka": "Himatnagar",
        "state": "Gujarat",
        "latitude": 23.5977,
        "longitude": 72.9698,
        "contact_phone": "+91 2772 241334",
        "operating_hours": "08:00 AM - 04:00 PM",
        "avg_gate_wait_hours": 2.1,
        "current_queue_vehicles": 10,
        "apmc_cess_pct": 0.90,
        "trader_commission_pct": 1.5,
        "hamali_per_quintal": 25.0,
        "weighment_fee_per_vehicle": 120.0
    },
    {
        "id": "APMC-DEA",
        "name": "Deesa APMC (Banaskantha)",
        "gujarati_name": "ડીસા માર્કેટ યાર્ડ",
        "district": "Banaskantha",
        "taluka": "Deesa",
        "state": "Gujarat",
        "latitude": 24.2586,
        "longitude": 72.1818,
        "contact_phone": "+91 2744 220199",
        "operating_hours": "07:00 AM - 05:00 PM",
        "avg_gate_wait_hours": 3.6,
        "current_queue_vehicles": 25,
        "apmc_cess_pct": 1.10,
        "trader_commission_pct": 1.7,
        "hamali_per_quintal": 28.0,
        "weighment_fee_per_vehicle": 130.0
    },
    {
        "id": "APMC-HLV",
        "name": "Halvad APMC (Morbi)",
        "gujarati_name": "હળવદ એ.પી.એમ.સી.",
        "district": "Morbi",
        "taluka": "Halvad",
        "state": "Gujarat",
        "latitude": 23.0134,
        "longitude": 71.1824,
        "contact_phone": "+91 2758 222110",
        "operating_hours": "07:30 AM - 03:30 PM",
        "avg_gate_wait_hours": 2.0,
        "current_queue_vehicles": 9,
        "apmc_cess_pct": 0.85,
        "trader_commission_pct": 1.4,
        "hamali_per_quintal": 24.0,
        "weighment_fee_per_vehicle": 110.0
    },
    {
        "id": "APMC-JAS",
        "name": "Jasdan APMC Yard",
        "gujarati_name": "જસદણ માર્કેટિંગ યાર્ડ",
        "district": "Rajkot",
        "taluka": "Jasdan",
        "state": "Gujarat",
        "latitude": 22.0336,
        "longitude": 71.2066,
        "contact_phone": "+91 2821 220055",
        "operating_hours": "07:30 AM - 03:30 PM",
        "avg_gate_wait_hours": 1.8,
        "current_queue_vehicles": 8,
        "apmc_cess_pct": 0.85,
        "trader_commission_pct": 1.4,
        "hamali_per_quintal": 23.0,
        "weighment_fee_per_vehicle": 100.0
    },
    {
        "id": "APMC-AND",
        "name": "Anand APMC Market",
        "gujarati_name": "આણંદ ખેતીવાડી યાર્ડ",
        "district": "Anand",
        "taluka": "Anand",
        "state": "Gujarat",
        "latitude": 22.5645,
        "longitude": 72.9289,
        "contact_phone": "+91 2692 250100",
        "operating_hours": "08:00 AM - 05:00 PM",
        "avg_gate_wait_hours": 2.5,
        "current_queue_vehicles": 15,
        "apmc_cess_pct": 1.00,
        "trader_commission_pct": 1.6,
        "hamali_per_quintal": 26.0,
        "weighment_fee_per_vehicle": 130.0
    },
    {
        "id": "APMC-DHD",
        "name": "Dahod APMC Grain Market",
        "gujarati_name": "દાહોદ અનાજ માર્કેટિંગ યાર્ડ",
        "district": "Dahod",
        "taluka": "Dahod",
        "state": "Gujarat",
        "latitude": 22.8360,
        "longitude": 74.2570,
        "contact_phone": "+91 2673 221045",
        "operating_hours": "08:00 AM - 04:30 PM",
        "avg_gate_wait_hours": 3.2,
        "current_queue_vehicles": 18,
        "apmc_cess_pct": 1.00,
        "trader_commission_pct": 1.5,
        "hamali_per_quintal": 24.0,
        "weighment_fee_per_vehicle": 120.0
    },
    {
        "id": "APMC-SRT",
        "name": "Surat APMC (APMC Sardar Yard)",
        "gujarati_name": "સુરત સરદાર માર્કેટ",
        "district": "Surat",
        "taluka": "Surat City",
        "state": "Gujarat",
        "latitude": 21.1959,
        "longitude": 72.8302,
        "contact_phone": "+91 261 2471555",
        "operating_hours": "05:00 AM - 06:00 PM",
        "avg_gate_wait_hours": 4.0,
        "current_queue_vehicles": 35,
        "apmc_cess_pct": 1.25,
        "trader_commission_pct": 2.0,
        "hamali_per_quintal": 30.0,
        "weighment_fee_per_vehicle": 160.0
    }
]

# 2. KEY CROPS (GUJARAT SPECIALTY)
CROPS = [
    {
        "id": "CROP-WHT",
        "name": "Wheat (Tukdi/Sharbati)",
        "gujarati_name": "ઘઉં (ટુકડી / શરબતી)",
        "category": "Cereal Grain",
        "standard_unit": "Quintal",
        "base_moisture_pct": 12.0,
        "max_acceptable_moisture_pct": 18.0,
        "dockage_rate_pct": 1.2,
        "govt_msp": 2425.0,
        "typical_grade": "FAQ Grade-I"
    },
    {
        "id": "CROP-GND",
        "name": "Groundnut (Mungfali / Shing)",
        "gujarati_name": "મગફળી (જી-૨૦ / જાડી-ઝીણી)",
        "category": "Oilseed",
        "standard_unit": "Quintal",
        "base_moisture_pct": 8.0,
        "max_acceptable_moisture_pct": 15.0,
        "dockage_rate_pct": 1.5,
        "govt_msp": 6783.0,
        "typical_grade": "Bold / Runner FAQ"
    },
    {
        "id": "CROP-COT",
        "name": "Cotton (Kapas Shankar-6)",
        "gujarati_name": "કપાસ (શંકર-૬ / દેશી)",
        "category": "Fiber / Cash Crop",
        "standard_unit": "Quintal",
        "base_moisture_pct": 9.0,
        "max_acceptable_moisture_pct": 16.0,
        "dockage_rate_pct": 1.4,
        "govt_msp": 7521.0,
        "typical_grade": "Medium/Long Staple"
    },
    {
        "id": "CROP-CMN",
        "name": "Cumin Seeds (Jeera)",
        "gujarati_name": "જીરું (ઊંઝા સ્પેશ્યલ)",
        "category": "Spice",
        "standard_unit": "Quintal",
        "base_moisture_pct": 9.0,
        "max_acceptable_moisture_pct": 13.0,
        "dockage_rate_pct": 2.0,
        "govt_msp": 19500.0,
        "typical_grade": "Europe / Singapore Quality"
    },
    {
        "id": "CROP-MST",
        "name": "Mustard / Rapeseed (Rai)",
        "gujarati_name": "રાયડા / સરસવ",
        "category": "Oilseed",
        "standard_unit": "Quintal",
        "base_moisture_pct": 9.0,
        "max_acceptable_moisture_pct": 14.0,
        "dockage_rate_pct": 1.25,
        "govt_msp": 5950.0,
        "typical_grade": "FAQ 42% Oil content"
    },
    {
        "id": "CROP-CAS",
        "name": "Castor Seed (Divela / Eranda)",
        "gujarati_name": "દિવેલા / એરંડા",
        "category": "Industrial Oilseed",
        "standard_unit": "Quintal",
        "base_moisture_pct": 8.0,
        "max_acceptable_moisture_pct": 14.0,
        "dockage_rate_pct": 1.3,
        "govt_msp": 6050.0,
        "typical_grade": "FAQ Commercial"
    },
    {
        "id": "CROP-CHN",
        "name": "Gram / Chickpea (Chana)",
        "gujarati_name": "ચણા (કાબુલી / દેશી)",
        "category": "Pulse",
        "standard_unit": "Quintal",
        "base_moisture_pct": 11.0,
        "max_acceptable_moisture_pct": 16.0,
        "dockage_rate_pct": 1.1,
        "govt_msp": 5650.0,
        "typical_grade": "Desi FAQ"
    },
    {
        "id": "CROP-BJR",
        "name": "Pearl Millet (Bajra)",
        "gujarati_name": "બાજરી (દેશી)",
        "category": "Millet / Grain",
        "standard_unit": "Quintal",
        "base_moisture_pct": 12.0,
        "max_acceptable_moisture_pct": 17.0,
        "dockage_rate_pct": 1.0,
        "govt_msp": 2625.0,
        "typical_grade": "FAQ Standard"
    },
    {
        "id": "CROP-SOY",
        "name": "Soybean (Pili)",
        "gujarati_name": "સોયાબીન",
        "category": "Oilseed / Pulse",
        "standard_unit": "Quintal",
        "base_moisture_pct": 10.0,
        "max_acceptable_moisture_pct": 16.0,
        "dockage_rate_pct": 1.3,
        "govt_msp": 4892.0,
        "typical_grade": "Yellow FAQ"
    }
]

# Baseline price matrix to generate realistic differences across mandis
# Demonstrating the core Problem P22: Mandi A quotes higher price, but mandi B is closer or has lower deduction!
BASE_PRICES = {
    "CROP-WHT": {"base": 2680.0, "spread": 120.0},
    "CROP-GND": {"base": 7150.0, "spread": 350.0},
    "CROP-COT": {"base": 7850.0, "spread": 280.0},
    "CROP-CMN": {"base": 26200.0, "spread": 1400.0},
    "CROP-MST": {"base": 6220.0, "spread": 240.0},
    "CROP-CAS": {"base": 6380.0, "spread": 210.0},
    "CROP-CHN": {"base": 6050.0, "spread": 190.0},
    "CROP-BJR": {"base": 2780.0, "spread": 90.0},
    "CROP-SOY": {"base": 4980.0, "spread": 160.0}
}

# 3. VERIFIED BUYERS
VERIFIED_BUYERS = [
    {
        "id": "BYR-01",
        "mandi_id": "APMC-GDL",
        "name": "Saurashtra Oil Millers FPO Ltd.",
        "buyer_type": "FPO Processor",
        "contact_phone": "+91 98251 12345",
        "verified_license_no": "APMC-GDL-A-2024-89",
        "rating": 4.9,
        "prompt_payment_terms": "Instant RTGS upon weighment",
        "preferred_crops": "Groundnut, Cotton, Mustard"
    },
    {
        "id": "BYR-02",
        "mandi_id": "APMC-UNJ",
        "name": "Unjha Spice Exporters Syndicate",
        "buyer_type": "Exporter / Institutional",
        "contact_phone": "+91 98790 45678",
        "verified_license_no": "APMC-UNJ-EXP-0112",
        "rating": 4.8,
        "prompt_payment_terms": "Same-day e-Transfer",
        "preferred_crops": "Cumin Seeds, Mustard"
    },
    {
        "id": "BYR-03",
        "mandi_id": "APMC-RJK",
        "name": "Patel Agri Agro Industries",
        "buyer_type": "Corporate Mill",
        "contact_phone": "+91 94260 78912",
        "verified_license_no": "APMC-RJK-TR-443",
        "rating": 4.7,
        "prompt_payment_terms": "Within 2 Hours (IMPS/Cash)",
        "preferred_crops": "Wheat, Groundnut, Gram"
    },
    {
        "id": "BYR-04",
        "mandi_id": "APMC-AMR",
        "name": "Gir Kesar & Cotton Ginning Co.",
        "buyer_type": "Ginning Mill",
        "contact_phone": "+91 97245 33445",
        "verified_license_no": "APMC-AMR-G-871",
        "rating": 4.6,
        "prompt_payment_terms": "Direct to Bank on same day",
        "preferred_crops": "Cotton, Groundnut"
    },
    {
        "id": "BYR-05",
        "mandi_id": "APMC-BTD",
        "name": "Botad Krishi Vikas Farmer Producer Co.",
        "buyer_type": "FPO Cooperative",
        "contact_phone": "+91 99092 66778",
        "verified_license_no": "FPO-GUJ-2021-99",
        "rating": 4.9,
        "prompt_payment_terms": "Direct FPO account transfer",
        "preferred_crops": "Cotton, Wheat, Gram"
    }
]

# 4. WDRA WAREHOUSES (FOR DISTRESS SALE MITIGATION)
WAREHOUSES = [
    {
        "id": "WH-GDL",
        "name": "Gujarat State Warehousing Corp (GSWC) Gondal",
        "mandi_id": "APMC-GDL",
        "district": "Rajkot",
        "latitude": 21.9540,
        "longitude": 70.8010,
        "capacity_tonnes": 15000.0,
        "available_space_tonnes": 4200.0,
        "monthly_storage_rate_per_quintal": 10.5,
        "wdra_accredited": 1,
        "pledge_loan_ltv_pct": 75.0,
        "contact_number": "+91 2825 221190"
    },
    {
        "id": "WH-RJK",
        "name": "Central Warehousing Corporation (CWC) Rajkot",
        "mandi_id": "APMC-RJK",
        "district": "Rajkot",
        "latitude": 22.3380,
        "longitude": 70.8140,
        "capacity_tonnes": 25000.0,
        "available_space_tonnes": 7800.0,
        "monthly_storage_rate_per_quintal": 12.0,
        "wdra_accredited": 1,
        "pledge_loan_ltv_pct": 80.0,
        "contact_number": "+91 281 2704512"
    },
    {
        "id": "WH-UNJ",
        "name": "National Bulk Handling Corp (NBHC) Unjha",
        "mandi_id": "APMC-UNJ",
        "district": "Mehsana",
        "latitude": 23.8110,
        "longitude": 72.4010,
        "capacity_tonnes": 30000.0,
        "available_space_tonnes": 11500.0,
        "monthly_storage_rate_per_quintal": 15.0,
        "wdra_accredited": 1,
        "pledge_loan_ltv_pct": 75.0,
        "contact_number": "+91 2767 254889"
    },
    {
        "id": "WH-AMR",
        "name": "GSWC Agri Logistics Center Amreli",
        "mandi_id": "APMC-AMR",
        "district": "Amreli",
        "latitude": 21.5950,
        "longitude": 71.2310,
        "capacity_tonnes": 10000.0,
        "available_space_tonnes": 3100.0,
        "monthly_storage_rate_per_quintal": 10.0,
        "wdra_accredited": 1,
        "pledge_loan_ltv_pct": 75.0,
        "contact_number": "+91 2792 225601"
    }
]

def seed():
    """Generates SQLite data and exports JSON bundle for web app."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    os.makedirs(FRONTEND_DATA_DIR, exist_ok=True)

    # Clean previous DB
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    schema_file = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_file, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.executescript(schema_sql)

    # Insert Mandis
    for m in GUJARAT_MANDIS:
        cur.execute("""
            INSERT INTO mandis (id, name, gujarati_name, district, taluka, state, latitude, longitude,
                                contact_phone, operating_hours, avg_gate_wait_hours, current_queue_vehicles,
                                apmc_cess_pct, trader_commission_pct, hamali_per_quintal, weighment_fee_per_vehicle)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            m["id"], m["name"], m["gujarati_name"], m["district"], m["taluka"], m["state"],
            m["latitude"], m["longitude"], m["contact_phone"], m["operating_hours"],
            m["avg_gate_wait_hours"], m["current_queue_vehicles"], m["apmc_cess_pct"],
            m["trader_commission_pct"], m["hamali_per_quintal"], m["weighment_fee_per_vehicle"]
        ))

    # Insert Crops
    for c in CROPS:
        cur.execute("""
            INSERT INTO crops (id, name, gujarati_name, category, standard_unit, base_moisture_pct,
                               max_acceptable_moisture_pct, dockage_rate_pct, govt_msp, typical_grade)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            c["id"], c["name"], c["gujarati_name"], c["category"], c["standard_unit"],
            c["base_moisture_pct"], c["max_acceptable_moisture_pct"], c["dockage_rate_pct"],
            c["govt_msp"], c["typical_grade"]
        ))

    # Generate daily prices for each mandi & crop (today + last 14 days history)
    today = datetime.now()
    all_daily_prices = []
    
    for m_idx, m in enumerate(GUJARAT_MANDIS):
        mandi_id = m["id"]
        for c_idx, c in enumerate(CROPS):
            crop_id = c["id"]
            base_info = BASE_PRICES[crop_id]
            
            # Deterministic variation per mandi to reflect authentic market conditions
            # E.g. Gondal has top groundnut price; Unjha has highest cumin price; Botad high cotton
            bonus = 0.0
            if crop_id == "CROP-GND" and mandi_id == "APMC-GDL":
                bonus = 180.0
            elif crop_id == "CROP-CMN" and mandi_id == "APMC-UNJ":
                bonus = 950.0
            elif crop_id == "CROP-COT" and mandi_id == "APMC-BTD":
                bonus = 160.0
            elif crop_id == "CROP-WHT" and mandi_id == "APMC-RJK":
                bonus = 90.0

            mandi_offset = ((m_idx * 7 + c_idx * 13) % 15 - 7) * (base_info["spread"] / 14.0)
            center_price = base_info["base"] + mandi_offset + bonus

            # Generate 14 days of historical trend
            for d in range(14, -1, -1):
                p_date = (today - timedelta(days=d)).strftime("%Y-%m-%d")
                # minor daily walk
                day_delta = ((d * 3 + m_idx) % 5 - 2) * (base_info["spread"] * 0.04)
                modal = round(center_price + day_delta, 1)
                min_p = round(modal - (base_info["spread"] * 0.4), 1)
                max_p = round(modal + (base_info["spread"] * 0.5), 1)
                price_per_mann = round(modal / 5.0, 1) # 1 Quintal = 5 Mann (20kg)
                arrivals = round(20.0 + ((m_idx * 11 + d * 7) % 65), 1)
                trend = "RISING" if day_delta > 5 else ("FALLING" if day_delta < -5 else "STABLE")

                cur.execute("""
                    INSERT INTO daily_prices (mandi_id, crop_id, price_date, min_price, max_price,
                                              modal_price, price_per_mann, arrivals_tonnes, price_trend)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (mandi_id, crop_id, p_date, min_p, max_p, modal, price_per_mann, arrivals, trend))

                if d == 0:
                    all_daily_prices.append({
                        "mandi_id": mandi_id,
                        "crop_id": crop_id,
                        "price_date": p_date,
                        "min_price": min_p,
                        "max_price": max_p,
                        "modal_price": modal,
                        "price_per_mann": price_per_mann,
                        "arrivals_tonnes": arrivals,
                        "price_trend": trend
                    })

    # Live gate statuses
    for m in GUJARAT_MANDIS:
        cur.execute("""
            INSERT INTO live_gate_status (mandi_id, trucks_in_queue, estimated_wait_hours,
                                          unloading_bays_active, congestion_level, gate_advisory)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            m["id"],
            m["current_queue_vehicles"],
            m["avg_gate_wait_hours"],
            6 if m["current_queue_vehicles"] > 25 else 4,
            "HIGH" if m["current_queue_vehicles"] > 30 else ("MODERATE" if m["current_queue_vehicles"] > 15 else "LOW"),
            "Peak arrivals expected between 9AM-11AM. Unloading turnaround approx 4 hours."
        ))

    # Buyers & Warehouses
    for b in VERIFIED_BUYERS:
        cur.execute("""
            INSERT INTO verified_buyers (id, mandi_id, name, buyer_type, contact_phone,
                                         verified_license_no, rating, prompt_payment_terms, preferred_crops)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (b["id"], b["mandi_id"], b["name"], b["buyer_type"], b["contact_phone"],
              b["verified_license_no"], b["rating"], b["prompt_payment_terms"], b["preferred_crops"]))

    for w in WAREHOUSES:
        cur.execute("""
            INSERT INTO warehouses (id, name, mandi_id, district, latitude, longitude,
                                    capacity_tonnes, available_space_tonnes, monthly_storage_rate_per_quintal,
                                    wdra_accredited, pledge_loan_ltv_pct, contact_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (w["id"], w["name"], w["mandi_id"], w["district"], w["latitude"], w["longitude"],
              w["capacity_tonnes"], w["available_space_tonnes"], w["monthly_storage_rate_per_quintal"],
              w["wdra_accredited"], w["pledge_loan_ltv_pct"], w["contact_number"]))

    conn.commit()
    conn.close()
    print(f"[OK] SQLite database successfully generated at: {DB_PATH}")

    # Build comprehensive combined JSON package for frontend and Vercel serverless deployment
    bundle = {
        "metadata": {
            "title": "KisanMarg Gujarat Agricultural Market Intelligence",
            "region": "Gujarat, India",
            "default_center": {"lat": 22.3039, "lng": 70.8022, "name": "Rajkot Region (Saurashtra / Gujarat)"},
            "generated_at": datetime.now().isoformat(),
            "regional_unit": "1 Mann (મણ) = 20 kg | 1 Quintal = 5 Mann = 100 kg"
        },
        "mandis": GUJARAT_MANDIS,
        "crops": CROPS,
        "todays_prices": all_daily_prices,
        "buyers": VERIFIED_BUYERS,
        "warehouses": WAREHOUSES
    }

    with open(FRONTEND_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(bundle, f, indent=2, ensure_ascii=False)
    print(f"[OK] Frontend standalone fallback JSON exported to: {FRONTEND_JSON_PATH}")

if __name__ == "__main__":
    seed()
