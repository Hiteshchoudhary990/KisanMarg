"""
FastAPI application for KisanMarg (AgriTech Market Intelligence).
Solves Kalpvruksh 2.0 Hackathon Problem P22: Limited Visibility Into Profitable Grain Market Choices.
"""

import os
import sys
from typing import List, Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Ensure package root is in path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from database.db import query_all, query_one
from backend.models.schemas import ProfitCalculationRequest, ProfitCalculationResponse
from backend.logic.profit_engine import rank_all_mandis
from backend.logic.grade_dockage import normalize_quantity_to_quintals, convert_quintals_to_mann

app = FastAPI(
    title="KisanMarg API",
    description="Smart Mandi Intelligence & Net Profit Navigator for Gujarat and Indian Farmers",
    version="2.0.0"
)

# Enable CORS for cross-origin requests & Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "KisanMarg Engine",
        "region": "Gujarat, India",
        "version": "2.0.0"
    }

@app.get("/api/mandis")
def get_mandis(district: Optional[str] = None):
    """Returns all registered APMC mandis."""
    if district:
        rows = query_all("SELECT * FROM mandis WHERE district = ?", (district,))
    else:
        rows = query_all("SELECT * FROM mandis")
    return {"count": len(rows), "mandis": rows}

@app.get("/api/crops")
def get_crops():
    """Returns list of supported crops and their APMC FAQ standards."""
    crops = query_all("SELECT * FROM crops")
    return {"count": len(crops), "crops": crops}

@app.get("/api/prices/today")
def get_today_prices(crop_id: Optional[str] = None):
    """Returns latest modal prices across all mandis."""
    if crop_id:
        rows = query_all("""
            SELECT dp.*, m.name as mandi_name, m.district, c.name as crop_name, c.govt_msp
            FROM daily_prices dp
            JOIN mandis m ON dp.mandi_id = m.id
            JOIN crops c ON dp.crop_id = c.id
            WHERE dp.crop_id = ? AND dp.price_date = (SELECT MAX(price_date) FROM daily_prices)
        """, (crop_id,))
    else:
        rows = query_all("""
            SELECT dp.*, m.name as mandi_name, m.district, c.name as crop_name, c.govt_msp
            FROM daily_prices dp
            JOIN mandis m ON dp.mandi_id = m.id
            JOIN crops c ON dp.crop_id = c.id
            WHERE dp.price_date = (SELECT MAX(price_date) FROM daily_prices)
        """)
    return {"count": len(rows), "prices": rows}

@app.post("/api/calculate-net-profit", response_model=ProfitCalculationResponse)
def calculate_net_profit(req: ProfitCalculationRequest):
    """
    Core Problem P22 Solution:
    Calculates true take-home cash across all mandis after logistics,
    moisture dockage, mandi cess, and gate wait costs.
    """
    crop = query_one("SELECT * FROM crops WHERE id = ?", (req.crop_id,))
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    mandis = query_all("SELECT * FROM mandis")
    if not mandis:
        raise HTTPException(status_code=500, detail="No mandis registered in database")
        
    # Get latest prices for this crop
    latest_prices = query_all("""
        SELECT * FROM daily_prices 
        WHERE crop_id = ? AND price_date = (SELECT MAX(price_date) FROM daily_prices)
    """, (req.crop_id,))
    
    prices_map = {p["mandi_id"]: p for p in latest_prices}
    
    rankings = rank_all_mandis(
        mandis=mandis,
        prices_map=prices_map,
        crop=crop,
        farmer_lat=req.farmer_lat,
        farmer_lng=req.farmer_lng,
        gross_quantity=req.gross_quantity,
        unit=req.unit,
        actual_moisture_pct=req.actual_moisture_pct,
        foreign_matter_pct=req.foreign_matter_pct,
        vehicle_type=req.vehicle_type,
        bypass_commission=req.bypass_commission,
        max_radius_km=req.max_radius_km
    )
    
    if not rankings:
        raise HTTPException(status_code=404, detail="No mandis found within specified parameters")
        
    gross_quintals = normalize_quantity_to_quintals(req.gross_quantity, req.unit)
    gross_mann = convert_quintals_to_mann(gross_quintals)
    best = rankings[0]
    
    return {
        "crop_id": req.crop_id,
        "crop_name": crop["name"],
        "gross_quantity_quintals": gross_quintals,
        "gross_quantity_mann": gross_mann,
        "best_mandi_id": best["mandi_id"],
        "best_mandi_name": best["mandi_name"],
        "max_take_home_profit": best["net_take_home_profit"],
        "total_mandis_compared": len(rankings),
        "rankings": rankings
    }

@app.get("/api/trends/{mandi_id}/{crop_id}")
def get_price_trends(mandi_id: str, crop_id: str):
    """Returns 14-day price trajectory vs Government MSP."""
    rows = query_all("""
        SELECT dp.price_date, dp.modal_price, dp.min_price, dp.max_price, dp.price_per_mann, 
               dp.arrivals_tonnes, dp.price_trend, c.govt_msp, c.name as crop_name, m.name as mandi_name
        FROM daily_prices dp
        JOIN crops c ON dp.crop_id = c.id
        JOIN mandis m ON dp.mandi_id = m.id
        WHERE dp.mandi_id = ? AND dp.crop_id = ?
        ORDER BY dp.price_date ASC
    """, (mandi_id, crop_id))
    return {"history": rows}

@app.get("/api/queues")
def get_live_queues():
    """Returns live truck arrival congestion and turnaround times."""
    rows = query_all("""
        SELECT lgs.*, m.name as mandi_name, m.district, m.latitude, m.longitude
        FROM live_gate_status lgs
        JOIN mandis m ON lgs.mandi_id = m.id
    """)
    return {"queues": rows}

@app.get("/api/buyers")
def get_buyers(mandi_id: Optional[str] = None):
    """Returns verified buyers and FPOs offering direct procurement."""
    if mandi_id:
        rows = query_all("SELECT * FROM verified_buyers WHERE mandi_id = ?", (mandi_id,))
    else:
        rows = query_all("SELECT * FROM verified_buyers")
    return {"buyers": rows}

@app.get("/api/warehouses")
def get_warehouses():
    """Returns WDRA accredited warehouses for distress-sale avoidance."""
    rows = query_all("SELECT * FROM warehouses")
    return {"warehouses": rows}

# Mount static frontend directory at root (after all /api endpoints)
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    print("[INFO] Starting KisanMarg FastAPI server on http://127.0.0.1:8000 ...")
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
