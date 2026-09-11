# KisanMarg REST API Catalog
### Kalpvruksh 2.0 Hackathon Problem P22: Limited Visibility Into Profitable Grain Market Choices

Base Local URL: `http://localhost:8000/api`  
Base Production (Vercel): `https://your-project.vercel.app/api`

---

## 1. Calculate True Net Take-Home Profit
**Endpoint:** `POST /api/calculate-net-profit`  
**Description:** Primary algorithm that solves Problem P22 by translating deceptive quoted prices into true in-pocket profit after deducting transport, hamali, mandi fees, waiting detention, and moisture dockage.

### Request Payload:
```json
{
  "crop_id": "CROP-GND",
  "gross_quantity": 100,
  "unit": "quintal",
  "farmer_lat": 22.0500,
  "farmer_lng": 70.8200,
  "actual_moisture_pct": 11.5,
  "foreign_matter_pct": 1.2,
  "vehicle_type": "tractor_trolley",
  "bypass_commission": false,
  "max_radius_km": 150
}
```

### Response (Excerpts):
```json
{
  "crop_id": "CROP-GND",
  "crop_name": "Groundnut (Mungfali / Shing)",
  "gross_quantity_quintals": 100.0,
  "gross_quantity_mann": 500.0,
  "best_mandi_id": "APMC-GDL",
  "best_mandi_name": "Gondal APMC Market Yard",
  "max_take_home_profit": 702580.0,
  "total_mandis_compared": 12,
  "rankings": [
    {
      "mandi_id": "APMC-GDL",
      "mandi_name": "Gondal APMC Market Yard",
      "rank": 1,
      "quoted_price_per_quintal": 7330.0,
      "quoted_price_per_mann": 1466.0,
      "distance_km": 14.5,
      "total_transit_cost": 1015.0,
      "moisture_loss_rupees": 38482.5,
      "hamali_cost": 2600.0,
      "apmc_cess_cost": 6251.0,
      "commission_cost": 10418.0,
      "net_take_home_profit": 702580.0,
      "effective_realized_rate_per_quintal": 7025.8,
      "effective_realized_rate_per_mann": 1405.16,
      "profit_difference_vs_best": 0.0,
      "is_deceptive_winner": false
    }
  ]
}
```

---

## 2. Get Registered APMC Mandis
**Endpoint:** `GET /api/mandis?district=Rajkot`

### Response:
```json
{
  "count": 3,
  "mandis": [
    {
      "id": "APMC-GDL",
      "name": "Gondal APMC Market Yard",
      "gujarati_name": "ગોંડલ માર્કેટિંગ યાર્ડ",
      "district": "Rajkot",
      "latitude": 21.9619,
      "longitude": 70.7937,
      "current_queue_vehicles": 28
    }
  ]
}
```

---

## 3. Get Live Gate & Queue Status
**Endpoint:** `GET /api/queues`

### Response:
```json
{
  "queues": [
    {
      "mandi_id": "APMC-UNJ",
      "mandi_name": "Unjha APMC (Global Spice Hub)",
      "trucks_in_queue": 42,
      "estimated_wait_hours": 5.5,
      "congestion_level": "HIGH",
      "gate_advisory": "Peak arrivals expected between 9AM-11AM. Unloading turnaround approx 4 hours."
    }
  ]
}
```

---

## 4. Get Price Trends & MSP Signals
**Endpoint:** `GET /api/trends/APMC-GDL/CROP-GND`

### Response:
```json
{
  "history": [
    {
      "price_date": "2026-09-01",
      "modal_price": 7250.0,
      "price_per_mann": 1450.0,
      "govt_msp": 6783.0,
      "arrivals_tonnes": 45.0
    }
  ]
}
```

---

## 5. Warehouse & e-NWR Loan Direct Liquidity
**Endpoint:** `GET /api/warehouses`
Returns WDRA accredited warehouses near mandis with up to 80% pledge financing so cash-strapped farmers can avoid distress selling.
