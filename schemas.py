"""
Pydantic data models and schemas for KisanMarg API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional

class ProfitCalculationRequest(BaseModel):
    crop_id: str = Field(..., example="CROP-GND", description="Unique crop identifier")
    gross_quantity: float = Field(..., gt=0, example=50.0, description="Harvest volume")
    unit: str = Field("quintal", example="quintal", description="quintal, mann, bag_50kg, metric_ton")
    farmer_lat: float = Field(22.0500, example=22.0500, description="Farmer latitude")
    farmer_lng: float = Field(70.8200, example=70.8200, description="Farmer longitude")
    actual_moisture_pct: float = Field(12.0, ge=0, le=40, description="Actual grain moisture percentage")
    foreign_matter_pct: float = Field(1.0, ge=0, le=25, description="Foreign matter / dust percentage")
    vehicle_type: str = Field("tractor_trolley", description="tractor_trolley, pickup_truck, medium_truck_6w, heavy_truck_10w")
    bypass_commission: bool = Field(False, description="Direct FPO sale (0% commission)")
    max_radius_km: Optional[float] = Field(None, description="Optional distance filter in km")

class MandiProfitBreakdown(BaseModel):
    mandi_id: str
    mandi_name: str
    gujarati_name: Optional[str]
    district: str
    latitude: float
    longitude: float
    rank: int
    quoted_price_per_quintal: float
    quoted_price_per_mann: float
    distance_km: float
    travel_hours: float
    total_transit_cost: float
    moisture_loss_rupees: float
    moisture_dockage_pct: float
    hamali_cost: float
    weighment_cost: float
    apmc_cess_cost: float
    commission_cost: float
    delay_detention_cost: float
    total_deductions: float
    net_take_home_profit: float
    effective_realized_rate_per_quintal: float
    effective_realized_rate_per_mann: float
    profit_difference_vs_best: float
    is_deceptive_winner: bool
    deceptive_warning: str
    is_rejected: bool
    rejection_warning: str

class ProfitCalculationResponse(BaseModel):
    crop_id: str
    crop_name: str
    gross_quantity_quintals: float
    gross_quantity_mann: float
    best_mandi_id: str
    best_mandi_name: str
    max_take_home_profit: float
    total_mandis_compared: int
    rankings: List[MandiProfitBreakdown]

class CropModel(BaseModel):
    id: str
    name: str
    gujarati_name: str
    category: str
    standard_unit: str
    base_moisture_pct: float
    max_acceptable_moisture_pct: float
    govt_msp: Optional[float]
    typical_grade: str

class MandiModel(BaseModel):
    id: str
    name: str
    gujarati_name: Optional[str]
    district: str
    state: str
    latitude: float
    longitude: float
    contact_phone: Optional[str]
    operating_hours: Optional[str]
    avg_gate_wait_hours: float
    current_queue_vehicles: int
    apmc_cess_pct: float
    trader_commission_pct: float
    hamali_per_quintal: float
