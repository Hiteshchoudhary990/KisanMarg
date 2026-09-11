-- KisanMarg Gujarat-Centric Database Schema
-- Kalpvruksh 2.0 Hackathon Problem P22: Limited Visibility Into Profitable Grain Market Choices

CREATE TABLE IF NOT EXISTS mandis (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gujarati_name TEXT,
    district TEXT NOT NULL,
    taluka TEXT,
    state TEXT DEFAULT 'Gujarat',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    contact_phone TEXT,
    operating_hours TEXT,
    avg_gate_wait_hours REAL DEFAULT 3.5,
    current_queue_vehicles INTEGER DEFAULT 15,
    apmc_cess_pct REAL DEFAULT 1.0, -- APMC Market Fee % (usually 0.8% - 1.5% in Gujarat)
    trader_commission_pct REAL DEFAULT 1.5, -- Commission agent fee %
    hamali_per_quintal REAL DEFAULT 25.0, -- Loading/unloading charges (₹/quintal)
    weighment_fee_per_vehicle REAL DEFAULT 120.0 -- Weighbridge fee
);

CREATE TABLE IF NOT EXISTS crops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gujarati_name TEXT NOT NULL,
    category TEXT NOT NULL, -- Oilseed, Grain, Cash Crop, Spice, Pulse
    standard_unit TEXT DEFAULT 'Quintal',
    base_moisture_pct REAL DEFAULT 12.0, -- Standard safe moisture % (dockage begins above this)
    max_acceptable_moisture_pct REAL DEFAULT 20.0, -- Above this, mandi may reject
    dockage_rate_pct REAL DEFAULT 1.0, -- Weight deduction % per 1% excess moisture
    govt_msp REAL, -- Government Minimum Support Price (₹/Quintal for 2025-26)
    typical_grade TEXT DEFAULT 'FAQ (Fair Average Quality)'
);

CREATE TABLE IF NOT EXISTS daily_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mandi_id TEXT NOT NULL,
    crop_id TEXT NOT NULL,
    price_date DATE NOT NULL,
    min_price REAL NOT NULL, -- ₹/Quintal
    max_price REAL NOT NULL, -- ₹/Quintal
    modal_price REAL NOT NULL, -- ₹/Quintal (Most frequent traded rate)
    price_per_mann REAL NOT NULL, -- ₹/20kg (Gujarat standard 1 Mann = 20kg)
    arrivals_tonnes REAL NOT NULL,
    price_trend TEXT DEFAULT 'STABLE', -- RISING, FALLING, STABLE
    FOREIGN KEY(mandi_id) REFERENCES mandis(id),
    FOREIGN KEY(crop_id) REFERENCES crops(id)
);

CREATE TABLE IF NOT EXISTS live_gate_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mandi_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    trucks_in_queue INTEGER NOT NULL,
    estimated_wait_hours REAL NOT NULL,
    unloading_bays_active INTEGER NOT NULL,
    congestion_level TEXT NOT NULL, -- 'LOW', 'MODERATE', 'HIGH', 'SEVERE'
    gate_advisory TEXT,
    FOREIGN KEY(mandi_id) REFERENCES mandis(id)
);

CREATE TABLE IF NOT EXISTS verified_buyers (
    id TEXT PRIMARY KEY,
    mandi_id TEXT NOT NULL,
    name TEXT NOT NULL,
    buyer_type TEXT NOT NULL, -- 'APMC Commission Agent', 'FPO Processor', 'Corporate Mill', 'Exporter'
    contact_phone TEXT NOT NULL,
    verified_license_no TEXT NOT NULL,
    rating REAL DEFAULT 4.5,
    prompt_payment_terms TEXT DEFAULT 'Same-day RTGS/Cash',
    preferred_crops TEXT,
    FOREIGN KEY(mandi_id) REFERENCES mandis(id)
);

CREATE TABLE IF NOT EXISTS warehouses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mandi_id TEXT NOT NULL,
    district TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    capacity_tonnes REAL NOT NULL,
    available_space_tonnes REAL NOT NULL,
    monthly_storage_rate_per_quintal REAL DEFAULT 12.0,
    wdra_accredited INTEGER DEFAULT 1, -- 1 = Yes (Eligible for e-NWR Bank Pledge Loans)
    pledge_loan_ltv_pct REAL DEFAULT 75.0, -- Loan to Value % (instant bank liquidity up to 75%)
    contact_number TEXT
);
