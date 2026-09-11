"""
Crop grade assessment, unit conversion, and moisture dockage calculation.
Adheres to APMC FAQ (Fair Average Quality) grain standards.
"""

from typing import Dict, Any

# Regional unit conversions to standard Quintal (100 kg)
UNIT_CONVERSION_TO_QUINTAL = {
    "quintal": 1.0,           # 1 Quintal = 100 kg
    "mann": 0.2,              # 1 Mann (મણ) in Gujarat = 20 kg = 0.2 Quintal
    "bag_50kg": 0.5,          # 1 Gunny Bag = 50 kg = 0.5 Quintal
    "metric_ton": 10.0,       # 1 Ton = 1,000 kg = 10 Quintals
    "kg": 0.01                # 1 kg = 0.01 Quintal
}

def normalize_quantity_to_quintals(quantity: float, unit: str = "quintal") -> float:
    """Normalizes any agricultural quantity to metric quintals."""
    factor = UNIT_CONVERSION_TO_QUINTAL.get(unit.lower(), 1.0)
    return round(quantity * factor, 3)

def convert_quintals_to_mann(quintals: float) -> float:
    """Converts quintals to Gujarati Mann (1 Quintal = 5 Mann)."""
    return round(quintals * 5.0, 2)

def calculate_quality_dockage(
    gross_quantity_quintals: float,
    actual_moisture_pct: float,
    base_moisture_pct: float = 12.0,
    max_acceptable_moisture_pct: float = 18.0,
    dockage_rate_pct: float = 1.2,
    foreign_matter_pct: float = 1.0
) -> Dict[str, Any]:
    """
    Calculates APMC weight dockages based on crop moisture and foreign matter.
    Problem P22 highlight: A high quoted price is misleading if the crop's moisture
    triggers heavy weight deductions or rejection at the gate!
    """
    is_rejected = actual_moisture_pct > max_acceptable_moisture_pct
    
    # Moisture dockage calculation
    excess_moisture = max(0.0, actual_moisture_pct - base_moisture_pct)
    moisture_dockage_pct = round(excess_moisture * dockage_rate_pct, 2)
    
    # Foreign matter dockage (FAQ standard allowance is typically 1.5%)
    excess_foreign_matter = max(0.0, foreign_matter_pct - 1.5)
    foreign_matter_dockage_pct = round(excess_foreign_matter * 1.0, 2)
    
    total_deduction_pct = round(moisture_dockage_pct + foreign_matter_dockage_pct, 2)
    # Deducted weight in quintals
    deducted_quintals = round(gross_quantity_quintals * (total_deduction_pct / 100.0), 3)
    net_payable_quintals = max(0.0, round(gross_quantity_quintals - deducted_quintals, 3))
    
    rejection_warning = ""
    if is_rejected:
        rejection_warning = (
            f"HIGH RISK OF MANDI REJECTION: Moisture level {actual_moisture_pct}% exceeds "
            f"maximum threshold of {max_acceptable_moisture_pct}%. Mandatory pre-drying advised."
        )

    return {
        "gross_quantity_quintals": gross_quantity_quintals,
        "net_payable_quintals": net_payable_quintals,
        "deducted_quintals": deducted_quintals,
        "moisture_dockage_pct": moisture_dockage_pct,
        "foreign_matter_dockage_pct": foreign_matter_dockage_pct,
        "total_deduction_pct": total_deduction_pct,
        "is_rejected": is_rejected,
        "rejection_warning": rejection_warning
    }
