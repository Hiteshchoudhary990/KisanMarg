"""
Geospatial calculation engine for KisanMarg
Computes great-circle distance, realistic road detour factor, and transit travel time.
"""

import math
from typing import Dict, Any

# Earth radius in kilometers
EARTH_RADIUS_KM = 6371.0

# Typical transit speeds by agricultural transport vehicle in Gujarat (km/h)
VEHICLE_SPEEDS = {
    "tractor_trolley": 28.0,       # Tractor with trailer (most common for < 50 km)
    "pickup_truck": 45.0,          # Bolero / Chota Hathi (commercial pickup)
    "medium_truck_6w": 40.0,       # 6-wheeler truck (10-15 tonnes)
    "heavy_truck_10w": 38.0        # Multi-axle lorry
}

# Per km running and driver freight cost in Gujarat (₹ / km)
VEHICLE_FREIGHT_RATES = {
    "tractor_trolley": 35.0,       # ₹35 / km
    "pickup_truck": 28.0,          # ₹28 / km
    "medium_truck_6w": 55.0,       # ₹55 / km
    "heavy_truck_10w": 75.0        # ₹75 / km
}

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes straight-line spherical distance between two coordinates in kilometers.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return EARTH_RADIUS_KM * c

def calculate_road_distance(lat1: float, lon1: float, lat2: float, lon2: float, detour_factor: float = 1.25) -> float:
    """
    Computes realistic road distance in km.
    In rural India & Gujarat state highways, road distance is typically 1.2x to 1.3x Euclidean distance.
    """
    straight_km = haversine_distance(lat1, lon1, lat2, lon2)
    return round(straight_km * detour_factor, 1)

def estimate_transit_info(lat1: float, lon1: float, lat2: float, lon2: float, vehicle_type: str = "tractor_trolley") -> Dict[str, Any]:
    """
    Estimates round-trip road distance, travel duration, and transit freight cost.
    """
    one_way_km = calculate_road_distance(lat1, lon1, lat2, lon2)
    round_trip_km = round(one_way_km * 2.0, 1)
    
    speed = VEHICLE_SPEEDS.get(vehicle_type, 35.0)
    travel_hours_one_way = round(one_way_km / speed, 2)
    
    rate_per_km = VEHICLE_FREIGHT_RATES.get(vehicle_type, 35.0)
    estimated_freight_cost = round(round_trip_km * rate_per_km, 2)
    
    # Tolls estimated on highways for trips > 45km
    estimated_tolls = 0.0
    if one_way_km > 45.0 and vehicle_type in ["pickup_truck", "medium_truck_6w", "heavy_truck_10w"]:
        estimated_tolls = round((one_way_km / 50.0) * 110.0, 2)

    return {
        "one_way_km": one_way_km,
        "round_trip_km": round_trip_km,
        "travel_hours_one_way": travel_hours_one_way,
        "estimated_freight_cost": estimated_freight_cost,
        "estimated_tolls": estimated_tolls,
        "total_transit_cost": estimated_freight_cost + estimated_tolls
    }
