# KisanMarg (કિસાનમાર્ગ) - Smart APMC Mandi Intelligence & Net Profit Navigator
### Kalpvruksh 2.0 Mini Hackathon 2026 • Problem Statement P22
**Domain:** AgriTech | **Complexity:** Medium | **Focus Region:** Gujarat & Saurashtra Agricultural Grid

---

## 🌾 The Problem: Kalpvruksh 2.0 P22 Overview

> *"Published prices may be delayed, incomplete, expressed in different units, or represent an average that does not match a farmer's crop grade. A higher quoted price does not guarantee greater net income after transport, loading, tolls, commissions, waiting time, moisture deductions, and the risk of rejection are included. Farmers must make decisions before prices and queues are fully known, often with limited bargaining power and urgent cash needs."*  
> — **Official Dossier: Problem P22**

### Core Dilemmas Faced by Farmers:
1. **The Deceptive Quoted Price Trap**: A farmer is tempted by Mandi A quoting ₹2,550/Quintal 65 km away, unaware that local Mandi B quoting ₹2,420/Quintal 12 km away yields **₹18,500 more take-home cash** once transport fuel, vehicle detention, APMC market cess, and gate queues are deducted.
2. **Moisture & Grade Mismatch**: Published APMC averages assume FAQ (Fair Average Quality) grain at 12% moisture. A farmer arriving with 15% moisture suffers heavy weight dockages or gate rejection.
3. **Unit Confusion**: Regional spot mandis in Gujarat quote in **Mann (મણ = 20 kg)**, whereas electronic portals quote in **Quintals (100 kg)** or Bags (50 kg).
4. **Queue Blindness**: Farmers dispatch trucks blind to gate traffic, incurring driver detainment penalties (₹150/hr) and quality deterioration during 6-hour waits.
5. **Urgent Cash & Middleman Exploitation**: Farmers needing immediate liquidity succumb to local village moneylenders at 20% discounts without knowing about WDRA accredited electronic warehouse receipt loans (e-NWR).

---

## 🚀 The Solution: KisanMarg Platform

**KisanMarg** is an end-to-end full-stack AgriTech solution engineered specifically for Gujarat and Indian grain producers. It combines an **interactive geographic map**, a **scientific net-profit optimization engine**, and an **accessible sidebar feature suite**.

```
                        ┌────────────────────────────────────────┐
                        │      Farmer Harvest Input              │
                        │ (Crop, Quantity, Moisture, Location)   │
                        └──────────────────┬─────────────────────┘
                                           │
                                           ▼
                        ┌────────────────────────────────────────┐
                        │      KisanMarg Net Profit Engine       │
                        └──────┬───────────┬──────────────┬──────┘
                               │           │              │
           ┌───────────────────┘           │              └──────────────────┐
           ▼                               ▼                                 ▼
┌──────────────────────┐      ┌──────────────────────────┐      ┌──────────────────────────┐
│   Logistics Engine   │      │ Moisture & Dockage Cuts  │      │ Mandi Cess & Gate Detain │
│ • Road Detour 1.25x  │      │ • Base 12% FAQ threshold │      │ • APMC Market Fee        │
│ • Tractor/Bolero Rate│      │ • Weight reduction formula│     │ • Hamali (Loading/bag)   │
│ • Highway Tolls      │      │ • Gate rejection alert   │      │ • Queue wait cost (₹/hr) │
└──────────┬───────────┘      └────────────┬─────────────┘      └────────────┬─────────────┘
           │                               │                                 │
           └───────────────────┬───────────┴─────────────────────────────────┘
                               │
                               ▼
            ┌───────────────────────────────────────────────┐
            │   TRUE NET TAKE-HOME BOTTOM LINE RANKING      │
            │  "Real Cash in Pocket" vs "Deceptive Price"   │
            └───────────────────────────────────────────────┘
```

---

## 🏛️ Project Directory Structure

```
hackathon/
├── .gitignore                     # Git exclusion rules
├── README.md                      # Complete system documentation
├── VERCEL_DEPLOYMENT.md           # Step-by-step Vercel deployment guide
├── vercel.json                    # Vercel serverless & static routing config
│
├── frontend/                      # Client Application (Zero Setup / Instant Run)
│   ├── index.html                 # Semantic HTML5 with responsive dual-pane layout
│   ├── styles.css                 # Dark/Light theme, glassmorphism, mobile responsive
│   ├── app.js                     # Master frontend coordinator & state manager
│   ├── api_client.js              # Resilient client (FastAPI + Client fallback)
│   ├── components/
│   │   ├── sidebar.js             # Sidebar tab routing & i18n (English, ગુજરાતી, हिंदी)
│   │   ├── map.js                 # Interactive Leaflet map, custom pins, radius circles
│   │   ├── profit_calculator.js   # Problem P22 core take-home optimizer & alert banner
│   │   ├── queue_tracker.js       # Live APMC gate truck counts & wait turnaround
│   │   ├── trends_view.js         # 14-day price comparison curves vs Govt MSP
│   │   └── distress_advisor.js    # Distress sale vs WDRA warehouse pledge loan advisor
│   └── data/
│       └── mandis_gujarat.json    # Self-contained Gujarat APMC dataset bundle
│
├── backend/                       # Python FastAPI REST Backend
│   ├── app.py                     # Server endpoints & static file serving
│   ├── requirements.txt           # Backend dependencies (fastapi, uvicorn, pydantic)
│   ├── logic/
│   │   ├── profit_engine.py       # Exact formula calculation engine
│   │   ├── geospatial.py          # Haversine & 1.25x road detour factors
│   │   └── grade_dockage.py       # Moisture cut, foreign matter, and Mann conversions
│   └── models/
│       └── schemas.py             # Pydantic request & response definitions
│
├── database/                      # Data Management & Storage
│   ├── schema.sql                 # Relational schema (mandis, crops, prices, queues)
│   ├── db.py                      # SQLite database connection utilities
│   ├── seed.py                    # Seeding 15 major Gujarat APMC mandis & 9 crops
│   └── mandi_data.sqlite          # Portable SQLite database file
│
└── api/                           # API Specifications & Contracts
    ├── openapi.json               # Full OpenAPI 3.0 specification
    ├── endpoints.md               # API endpoint documentation & curl samples
    ├── client.js                  # Shared API client module
    └── index.py                   # Vercel Serverless entrypoint
```

---

## 🗺️ Gujarat Centric Coverage

KisanMarg is configured with authentic Gujarat APMC Mandis, regional agricultural crops, and native units:

### 15 Seeded Gujarat APMC Mandis
- **Gondal APMC Market Yard** (Rajkot) — Asia's premier groundnut, chilli, and garlic hub
- **Rajkot APMC (Bedi Yard)** (Rajkot) — High-volume cotton, wheat, and oilseeds center
- **Unjha APMC (Ganj Bazaar)** (Mehsana) — World's largest cumin (Jeera) and fennel market
- **Amreli APMC Yard** (Amreli) — Cotton, groundnut, and sesame center
- **Junagadh APMC** (Junagadh) — Saurashtra groundnut and wheat hub
- **Jamnagar APMC (Hapa)** (Jamnagar) — Castor, groundnut, and garlic yard
- **Botad APMC** (Botad) — Premier cotton and grain auction yard
- **Mehsana APMC** (Mehsana) — Mustard and castor trading yard
- **Himatnagar APMC** (Sabarkantha) — North Gujarat agricultural center
- **Deesa APMC** (Banaskantha) — Potato, mustard, and groundnut market
- **Halvad APMC** (Morbi) — Cumin, cotton, and sesame yard
- **Jasdan APMC** (Rajkot) — Cotton and groundnut yard
- **Anand APMC** (Anand) — Central Gujarat grain market
- **Dahod APMC** (Dahod) — Tribal belt maize and pulse market
- **Surat Sardar APMC** (Surat) — South Gujarat terminal market

### Native Unit Support
- **1 Mann (મણ) = 20 kg** (Gujarat APMC standard)
- **1 Quintal = 5 Mann = 100 kg**
- **1 Bag (બોરી) = 50 kg = 2.5 Mann**

---

## 🧮 The True Net Profit Calculation Formula

$$\text{Excess Moisture \%} = \max(0, \text{Actual Moisture} - \text{Base Moisture})$$
$$\text{Moisture Deduction \%} = \text{Excess Moisture} \times \text{Dockage Rate}$$
$$\text{Payable Quintals} = \text{Gross Quintals} \times \left(1 - \frac{\text{Moisture Deduction \%}}{100}\right)$$
$$\text{Gross Revenue} = \text{Payable Quintals} \times \text{Quoted Mandi Rate}$$

$$\text{Transit Cost} = (\text{Distance km} \times 2 \times \text{Rate/km}) + \text{Highway Tolls}$$
$$\text{Handling Cost} = \text{Gross Quintals} \times \text{Hamali Rate} + \text{Weighment Fee}$$
$$\text{APMC Deductions} = \text{Gross Revenue} \times (\text{APMC Cess \%} + \text{Commission \%})$$
$$\text{Gate Detention Cost} = \max(0, \text{Gate Wait Hours} - 2.0) \times ₹150/\text{hr}$$

$$\mathbf{\text{True Net Take-Home}} = \text{Gross Revenue} - (\text{Transit} + \text{Handling} + \text{APMC Fees} + \text{Detention})$$

---

## ⚡ Quickstart Guide

### Option 1: Run Full-Stack with FastAPI
1. **Install dependencies** (already configured):
   ```bash
   python -m pip install fastapi uvicorn pydantic
   ```

2. **Initialize Database** (already generated):
   ```bash
   python database/seed.py
   ```

3. **Start FastAPI Backend**:
   ```bash
   python -m uvicorn backend.app:app --reload --port 8000
   ```
   - Access Web Application: [http://localhost:8000](http://localhost:8000)
   - Interactive Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Option 2: Run Frontend Directly (Zero Setup)
Simply open `frontend/index.html` in any web browser!  
The bundled `api_client.js` automatically detects offline status and executes the mathematical ranking algorithms directly inside the browser using the pre-packaged Gujarat APMC dataset.

---

## 🚀 How to Deploy on Vercel

See [VERCEL_DEPLOYMENT.md](file:///c:/Users/h6979/OneDrive/Desktop/hackathon/VERCEL_DEPLOYMENT.md) for full instructions.

### Instant 60-Second Deploy:
1. Push this folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Keep the default settings (the included `vercel.json` automatically configures both the Python serverless API and static assets).
4. Click **Deploy** — your live website will be accessible globally with HTTPS!
