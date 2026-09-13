"""
ASHA AI - Centralized Multi-Hazard Environmental Risk Engine
Synthesizes independent AI predictions for Floods, Forest Fires, and Air Pollution
into location-specific hazard scores, threat categorizations, and explainability vectors.
"""

from .flood_model import flood_ai
from .fire_model import fire_ai
from .pollution_model import pollution_ai

class RiskEngine:
    def __init__(self):
        # Default hazard weighting weights
        self.weights = {
            "flood": 0.40,
            "fire": 0.35,
            "pollution": 0.25
        }

    def evaluate_district(self, district_data: dict) -> dict:
        telemetry = district_data.get("telemetry", {})
        sar = district_data.get("sar_satellite")
        hotspots = district_data.get("fire_hotspots", [])
        
        # 1. Flood AI Inference
        flood_res = flood_ai.predict_flood_risk(
            rainfall_24h=telemetry.get("rainfall_24h_mm", 0.0),
            rainfall_72h=telemetry.get("rainfall_72h_mm", 0.0),
            river_gauge=telemetry.get("river_gauge_m", 0.0),
            danger_mark=telemetry.get("river_danger_mark_m", 10.0),
            soil_saturation=telemetry.get("soil_saturation_pct", 30.0),
            elevation_m=district_data.get("elevation_m", 50.0)
        )

        # 2. Fire AI Inference
        fire_res = fire_ai.predict_fire_risk(
            surface_temp=telemetry.get("surface_temp_c", 30.0),
            relative_humidity=telemetry.get("relative_humidity_pct", 50.0),
            wind_speed=telemetry.get("wind_speed_kmh", 10.0),
            dry_spell_days=telemetry.get("dry_spell_days", 0),
            ndvi_vegetation=telemetry.get("ndvi_vegetation", 0.5),
            active_hotspots_count=len(hotspots)
        )

        # 3. Air Pollution Inference
        pollution_res = pollution_ai.compute_composite_aqi(
            pm25=telemetry.get("pm25", 50.0),
            pm10=telemetry.get("pm10", 80.0),
            no2=telemetry.get("no2", 25.0),
            so2=telemetry.get("so2", 10.0),
            co=telemetry.get("co", 0.8),
            o3=telemetry.get("o3", 25.0)
        )

        flood_score = flood_res["risk_score"]
        fire_score = fire_res["risk_score"]
        pollution_score = pollution_res["risk_score"]

        # 4. Multi-Hazard Composite Calculation with Peak Hazard Amplification
        # If any single hazard reaches CRITICAL (>75), it dominates the response rating
        max_single = max(flood_score, fire_score, pollution_score)
        weighted_base = (
            self.weights["flood"] * flood_score +
            self.weights["fire"] * fire_score +
            self.weights["pollution"] * pollution_score
        )
        
        # Blend weighted average with peak hazard to avoid diluting acute life-threatening disasters
        overall_risk = round(0.55 * max_single + 0.45 * weighted_base, 1)

        # Primary threat classification
        hazard_map = {
            flood_score: ("FLOOD", flood_res["category"], flood_res["recommended_action"]),
            fire_score: ("FIRE", fire_res["category"], fire_res["recommended_action"]),
            pollution_score: ("POLLUTION", pollution_res["category"], pollution_res["health_impact"])
        }
        dominant_hazard, dom_cat, primary_action = hazard_map[max_single]

        # Overall Threat Level
        if overall_risk >= 75:
            overall_category = "CRITICAL"
            status_color = "#ef4444"
        elif overall_risk >= 55:
            overall_category = "HIGH"
            status_color = "#f97316"
        elif overall_risk >= 30:
            overall_category = "MEDIUM"
            status_color = "#eab308"
        else:
            overall_category = "LOW"
            status_color = "#10b981"

        # Separate Observed Detection vs Predicted Risk
        observed_facts = []
        if sar and sar.get("detected_flood_km2", 0) > 0:
            observed_facts.append(f"Sentinel-1 SAR confirmed {sar['detected_flood_km2']} km² surface water inundation.")
        if hotspots:
            observed_facts.append(f"NASA FIRMS / ISRO sensors detected {len(hotspots)} active thermal fire hotspots.")
        if pollution_res["aqi"] > 250:
            observed_facts.append(f"CPCB station reports Severe AQI {pollution_res['aqi']} ({pollution_res['dominant_pollutant']} dominant).")
        if not observed_facts:
            observed_facts.append("Baseline telemetry within normal seasonal tolerances.")

        return {
            "district_id": district_data["id"],
            "district_name": district_data["name"],
            "state": district_data["state"],
            "lat": district_data["lat"],
            "lng": district_data["lng"],
            "overall_risk_score": overall_risk,
            "overall_category": overall_category,
            "status_color": status_color,
            "dominant_hazard": dominant_hazard,
            "primary_action": primary_action,
            "observed_facts": observed_facts,
            "hazard_breakdown": {
                "flood": flood_res,
                "fire": fire_res,
                "pollution": pollution_res
            },
            "sar_satellite": sar,
            "fire_hotspots": hotspots,
            "telemetry": telemetry
        }

risk_engine = RiskEngine()
