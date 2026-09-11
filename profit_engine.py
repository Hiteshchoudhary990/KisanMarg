"""
Core Net Profit Optimizer Engine for KisanMarg
Solves Problem P22: Calculates true take-home cash income vs deceptive quoted prices.
"""

from typing import List, Dict, Any, Optional
from .geospatial import estimate_transit_info
from .grade_dockage import normalize_quantity_to_quintals, calculate_quality_dockage, convert_quintals_to_mann

def calculate_mandi_net_profit(
    mandi: Dict[str, Any],
    price_info: Dict[str, Any],
    crop: Dict[str, Any],
    farmer_lat: float,
    farmer_lng: float,
    gross_quantity: float,
    unit: str = "quintal",
    actual_moisture_pct: float = 12.0,
    foreign_matter_pct: float = 1.0,
    vehicle_type: str = "tractor_trolley",
    bypass_commission: bool = False
) -> Dict[str, Any]:
    """
    Computes exact line-item breakdown of net realization for a single mandi.
    """
    # 1. Normalize quantity to quintals
    gross_quintals = normalize_quantity_to_quintals(gross_quantity, unit)
    gross_mann = convert_quintals_to_mann(gross_quintals)
    
    # 2. Quality & Moisture Dockage
    dockage = calculate_quality_dockage(
        gross_quantity_quintals=gross_quintals,
        actual_moisture_pct=actual_moisture_pct,
        base_moisture_pct=crop.get("base_moisture_pct", 12.0),
        max_acceptable_moisture_pct=crop.get("max_acceptable_moisture_pct", 18.0),
        dockage_rate_pct=crop.get("dockage_rate_pct", 1.2),
        foreign_matter_pct=foreign_matter_pct
    )
    
    payable_quintals = dockage["net_payable_quintals"]
    
    # 3. Transit and Logistics
    transit = estimate_transit_info(
        lat1=farmer_lat,
        lon1=farmer_lng,
        lat2=mandi["latitude"],
        lon2=mandi["longitude"],
        vehicle_type=vehicle_type
    )
    
    # 4. Quoted Gross Revenue
    modal_price_per_quintal = price_info.get("modal_price", 0.0)
    modal_price_per_mann = price_info.get("price_per_mann", round(modal_price_per_quintal / 5.0, 1))
    theoretical_gross_revenue = round(gross_quintals * modal_price_per_quintal, 2)
    effective_gross_revenue = round(payable_quintals * modal_price_per_quintal, 2)
    moisture_value_loss = round(theoretical_gross_revenue - effective_gross_revenue, 2)
    
    # 5. Handling & Mandi Expenses
    hamali_total = round(gross_quintals * mandi.get("hamali_per_quintal", 25.0), 2)
    weighment_total = mandi.get("weighment_fee_per_vehicle", 120.0)
    apmc_cess_amount = round(effective_gross_revenue * (mandi.get("apmc_cess_pct", 1.0) / 100.0), 2)
    
    comm_pct = 0.0 if bypass_commission else mandi.get("trader_commission_pct", 1.5)
    commission_amount = round(effective_gross_revenue * (comm_pct / 100.0), 2)
    
    # 6. Gate Delay / Driver Detainment Cost (₹150/hr beyond 2 free unloading hours)
    wait_hours = mandi.get("avg_gate_wait_hours", 3.0)
    delay_cost = round(max(0.0, wait_hours - 2.0) * 150.0, 2)
    
    # 7. Total Deductions & True Net Cash
    logistics_total = transit["total_transit_cost"]
    mandi_expenses_total = round(hamali_total + weighment_total + apmc_cess_amount + commission_amount + delay_cost, 2)
    total_cash_expenses = round(logistics_total + mandi_expenses_total, 2)
    
    net_take_home_profit = round(effective_gross_revenue - total_cash_expenses, 2)
    effective_realized_rate_per_quintal = round(net_take_home_profit / gross_quintals, 2) if gross_quintals > 0 else 0.0
    effective_realized_rate_per_mann = round(effective_realized_rate_per_quintal / 5.0, 2)
    
    return {
        "mandi_id": mandi["id"],
        "mandi_name": mandi["name"],
        "gujarati_name": mandi.get("gujarati_name", ""),
        "district": mandi["district"],
        "latitude": mandi["latitude"],
        "longitude": mandi["longitude"],
        "operating_hours": mandi.get("operating_hours", ""),
        "contact_phone": mandi.get("contact_phone", ""),
        
        # Quoted values
        "quoted_price_per_quintal": modal_price_per_quintal,
        "quoted_price_per_mann": modal_price_per_mann,
        "theoretical_gross_revenue": theoretical_gross_revenue,
        
        # Deductions breakdown
        "distance_km": transit["one_way_km"],
        "travel_hours": transit["travel_hours_one_way"],
        "freight_cost": transit["estimated_freight_cost"],
        "tolls_cost": transit["estimated_tolls"],
        "total_transit_cost": logistics_total,
        
        "moisture_loss_rupees": moisture_value_loss,
        "moisture_deduction_quintals": dockage["deducted_quintals"],
        "moisture_dockage_pct": dockage["total_deduction_pct"],
        
        "hamali_cost": hamali_total,
        "weighment_cost": weighment_total,
        "apmc_cess_cost": apmc_cess_amount,
        "commission_cost": commission_amount,
        "gate_wait_hours": wait_hours,
        "delay_detention_cost": delay_cost,
        "total_deductions": total_cash_expenses + moisture_value_loss,
        
        # Real Take-Home Bottom Line
        "net_take_home_profit": net_take_home_profit,
        "effective_realized_rate_per_quintal": effective_realized_rate_per_quintal,
        "effective_realized_rate_per_mann": effective_realized_rate_per_mann,
        "profit_per_gross_quintal": effective_realized_rate_per_quintal,
        
        # Warnings & Alerts
        "is_rejected": dockage["is_rejected"],
        "rejection_warning": dockage["rejection_warning"],
        "queue_trucks": mandi.get("current_queue_vehicles", 15)
    }

def rank_all_mandis(
    mandis: List[Dict[str, Any]],
    prices_map: Dict[str, Dict[str, Any]],
    crop: Dict[str, Any],
    farmer_lat: float,
    farmer_lng: float,
    gross_quantity: float,
    unit: str = "quintal",
    actual_moisture_pct: float = 12.0,
    foreign_matter_pct: float = 1.0,
    vehicle_type: str = "tractor_trolley",
    bypass_commission: bool = False,
    max_radius_km: Optional[float] = None
) -> List[Dict[str, Any]]:
    """
    Ranks all candidate mandis by Net Take-Home Profit.
    Identifies deceptive mandis (High Quoted Price but Low Net Return).
    """
    results = []
    
    for mandi in mandis:
        m_id = mandi["id"]
        price_info = prices_map.get(m_id)
        if not price_info:
            continue
            
        mandi_calc = calculate_mandi_net_profit(
            mandi=mandi,
            price_info=price_info,
            crop=crop,
            farmer_lat=farmer_lat,
            farmer_lng=farmer_lng,
            gross_quantity=gross_quantity,
            unit=unit,
            actual_moisture_pct=actual_moisture_pct,
            foreign_matter_pct=foreign_matter_pct,
            vehicle_type=vehicle_type,
            bypass_commission=bypass_commission
        )
        
        # Filter by radius if requested
        if max_radius_km and mandi_calc["distance_km"] > max_radius_km:
            continue
            
        results.append(mandi_calc)
        
    # Sort by net take home profit descending
    results.sort(key=lambda x: x["net_take_home_profit"], reverse=True)
    
    if results:
        best_net = results[0]
        # Also find highest quoted gross price mandi
        highest_quoted = max(results, key=lambda x: x["quoted_price_per_quintal"])
        
        for idx, res in enumerate(results):
            res["rank"] = idx + 1
            res["profit_difference_vs_best"] = round(res["net_take_home_profit"] - best_net["net_take_home_profit"], 2)
            
            # Deceptive Price Tag Flag (Problem P22 key diagnostic)
            if res["mandi_id"] == highest_quoted["mandi_id"] and res["rank"] > 1:
                res["is_deceptive_winner"] = True
                res["deceptive_warning"] = (
                    f"⚠️ DECEPTIVE HIGH QUOTE: Quotes highest market rate (₹{res['quoted_price_per_quintal']}/Q), "
                    f"but yields ₹{abs(res['profit_difference_vs_best']):,.0f} LESS take-home cash than "
                    f"{best_net['mandi_name']} due to transport distance and gate fees."
                )
            else:
                res["is_deceptive_winner"] = False
                res["deceptive_warning"] = ""
                
    return results
