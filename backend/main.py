"""
ASHA AI - Main FastAPI Application Server
Zero external databases, zero docker, zero third-party API keys required.
High-performance AI inference and disaster management API.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn

from data.districts_data import get_all_districts, get_district_by_id
from ml.flood_model import flood_ai
from ml.fire_model import fire_ai
from ml.pollution_model import pollution_ai
from ml.risk_engine import risk_engine
from services.alert_service import alert_service

app = FastAPI(
    title="ASHA AI API",
    description="ASHA AI — Autonomous Sentinel & Multi-Hazard Early Warning System for India",
    version="1.0.0"
)

# Enable CORS for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REQUEST SCHEMAS ---
class FloodPredictionRequest(BaseModel):
    rainfall_24h_mm: float = Field(..., ge=0, description="24-hour cumulative rainfall in mm")
    rainfall_72h_mm: float = Field(..., ge=0, description="72-hour cumulative rainfall in mm")
    river_gauge_m: float = Field(..., ge=0, description="Current river gauge water level in meters")
    river_danger_mark_m: float = Field(..., gt=0, description="Official river flood danger mark in meters")
    soil_saturation_pct: float = Field(..., ge=0, le=100, description="Soil moisture saturation percentage")
    elevation_m: float = Field(..., ge=0, description="Terrain elevation in meters above sea level")

class FirePredictionRequest(BaseModel):
    surface_temp_c: float = Field(..., description="Land surface temperature in Celsius")
    relative_humidity_pct: float = Field(..., ge=0, le=100, description="Ambient relative humidity percentage")
    wind_speed_kmh: float = Field(..., ge=0, description="Surface wind speed in km/h")
    dry_spell_days: int = Field(..., ge=0, description="Consecutive days without precipitation")
    ndvi_vegetation: float = Field(..., ge=0, le=1, description="Normalized Difference Vegetation Index (0 to 1)")
    active_hotspots_count: int = Field(0, ge=0, description="Number of thermal fire hotspots detected")

class PollutionPredictionRequest(BaseModel):
    pm25: float = Field(..., ge=0, description="PM2.5 particulate concentration in µg/m³")
    pm10: float = Field(..., ge=0, description="PM10 particulate concentration in µg/m³")
    temp_c: float = Field(30.0, description="Ambient temperature in Celsius")
    humidity_pct: float = Field(50.0, description="Relative humidity in percentage")
    wind_speed_kmh: float = Field(10.0, description="Wind speed in km/h")

class CompositeRiskRequest(BaseModel):
    flood_risk: float = Field(..., ge=0, le=100)
    fire_risk: float = Field(..., ge=0, le=100)
    pollution_risk: float = Field(..., ge=0, le=100)
    flood_weight: Optional[float] = 0.40
    fire_weight: Optional[float] = 0.35
    pollution_weight: Optional[float] = 0.25

class AlertDispatchRequest(BaseModel):
    alert_id: str
    channel: str = "SMS Broadcast (CAP)"
    recipient: str = "+91-9876543210 (NDMA EOC)"

class ModelTrainRequest(BaseModel):
    model_type: str = Field(..., description="'flood', 'fire', or 'pollution'")
    epochs: int = Field(15, ge=1, le=100)
    learning_rate: float = Field(0.001, gt=0, le=0.1)
    batch_size: int = Field(128, ge=16, le=512)

# --- REST ENDPOINTS ---

@app.get("/")
def root():
    return {
        "system": "ASHA AI",
        "status": "OPERATIONAL",
        "coverage": "All India Vulnerability Grid (Floods, Forest Fires, Air Pollution)",
        "docs_url": "/docs"
    }

@app.get("/api/dashboard")
def get_dashboard_summary():
    """
    Returns aggregated disaster command-center telemetry and national threat overview.
    """
    districts = get_all_districts()
    evaluated = [risk_engine.evaluate_district(d) for d in districts]

    critical_count = sum(1 for e in evaluated if e["overall_category"] == "CRITICAL")
    high_count = sum(1 for e in evaluated if e["overall_category"] == "HIGH")
    medium_count = sum(1 for e in evaluated if e["overall_category"] == "MEDIUM")
    low_count = sum(1 for e in evaluated if e["overall_category"] == "LOW")

    total_flooded_area_km2 = sum(
        e["sar_satellite"]["detected_flood_km2"] 
        for e in evaluated if e.get("sar_satellite") and e["sar_satellite"].get("detected_flood_km2")
    )

    total_fire_hotspots = sum(len(e["fire_hotspots"]) for e in evaluated)
    
    avg_national_aqi = round(
        sum(e["hazard_breakdown"]["pollution"]["aqi"] for e in evaluated) / max(1, len(evaluated))
    )

    # Sort top vulnerable hotspots
    top_risk_hotspots = sorted(evaluated, key=lambda x: x["overall_risk_score"], reverse=True)[:6]

    return {
        "status": "LIVE_MONITORING",
        "timestamp": "2026-09-11T02:30:00Z",
        "national_summary": {
            "critical_districts": critical_count,
            "high_risk_districts": high_count,
            "medium_risk_districts": medium_count,
            "safe_monitored_districts": low_count,
            "total_monitored": len(districts),
            "total_flooded_area_km2": round(total_flooded_area_km2, 1),
            "active_fire_hotspots": total_fire_hotspots,
            "average_national_aqi": avg_national_aqi,
            "active_satellites": ["Sentinel-1A", "Sentinel-1B", "NASA FIRMS (VIIRS/MODIS)", "ISRO Bhuvan/NDEM", "CPCB CAAQMS Network"]
        },
        "top_vulnerable_hotspots": top_risk_hotspots,
        "recent_alerts": alert_service.get_all_alerts()[:3]
    }

@app.get("/api/districts")
def get_districts():
    """
    Returns full list of monitored Indian districts with evaluated multi-hazard risk profiles.
    """
    districts = get_all_districts()
    return [risk_engine.evaluate_district(d) for d in districts]

@app.get("/api/district/{district_id}")
def get_district_details(district_id: str):
    """
    Returns granular telemetry, satellite SAR scene, fire points, and 24h AQI forecast for a specific district.
    """
    district = get_district_by_id(district_id)
    if not district:
        raise HTTPException(status_code=404, detail="District not found")
    
    eval_profile = risk_engine.evaluate_district(district)
    
    # Generate 24h AQI forecast
    t = district["telemetry"]
    aqi_forecast = pollution_ai.forecast_aqi(
        pm25=t.get("pm25", 50.0),
        pm10=t.get("pm10", 80.0),
        temp_c=t.get("surface_temp_c", 30.0),
        humidity_pct=t.get("relative_humidity_pct", 50.0),
        wind_speed_kmh=t.get("wind_speed_kmh", 10.0)
    )

    # Generate synthetic SAR radar chip if flood is active or applicable
    sar_chip = None
    if district.get("sar_satellite"):
        sar_chip = flood_ai.generate_synthetic_sar_scene(
            district_name=district["name"],
            water_expansion_pct=district["sar_satellite"]["water_body_expansion_pct"],
            flood_km2=district["sar_satellite"]["detected_flood_km2"]
        )

    return {
        "profile": eval_profile,
        "aqi_forecast": aqi_forecast,
        "sar_radar_chip": sar_chip
    }

@app.get("/api/floods")
def get_floods():
    """
    Returns all flood-affected regions, Sentinel-1 SAR observations, and flood risk predictions.
    """
    districts = get_all_districts()
    flood_zones = []
    
    for d in districts:
        eval_p = risk_engine.evaluate_district(d)
        f_breakdown = eval_p["hazard_breakdown"]["flood"]
        sar = d.get("sar_satellite")
        
        flood_zones.append({
            "district_id": d["id"],
            "district_name": d["name"],
            "state": d["state"],
            "lat": d["lat"],
            "lng": d["lng"],
            "river_basin": d.get("river_basin", "Catchment Basin"),
            "flood_risk_score": f_breakdown["risk_score"],
            "category": f_breakdown["category"],
            "estimated_flooded_km2": f_breakdown["estimated_flooded_km2"],
            "river_gauge_m": d["telemetry"]["river_gauge_m"],
            "danger_mark_m": d["telemetry"]["river_danger_mark_m"],
            "rainfall_24h_mm": d["telemetry"]["rainfall_24h_mm"],
            "rainfall_72h_mm": d["telemetry"]["rainfall_72h_mm"],
            "sar_satellite": sar,
            "recommended_action": f_breakdown["recommended_action"]
        })

    return sorted(flood_zones, key=lambda x: x["flood_risk_score"], reverse=True)

@app.get("/api/fires")
def get_fires():
    """
    Returns NASA FIRMS and ISRO active fire hotspots and regional wildfire danger scores.
    """
    districts = get_all_districts()
    all_hotspots = []
    fire_zones = []

    for d in districts:
        eval_p = risk_engine.evaluate_district(d)
        f_breakdown = eval_p["hazard_breakdown"]["fire"]
        hotspots = d.get("fire_hotspots", [])
        
        for h in hotspots:
            all_hotspots.append({
                "district_id": d["id"],
                "district_name": d["name"],
                "state": d["state"],
                "lat": h["lat"],
                "lng": h["lng"],
                "brightness_k": h["brightness_k"],
                "frp_mw": h["frp_mw"],
                "confidence": h["confidence"],
                "sensor": h["sensor"]
            })

        fire_zones.append({
            "district_id": d["id"],
            "district_name": d["name"],
            "state": d["state"],
            "lat": d["lat"],
            "lng": d["lng"],
            "fire_risk_score": f_breakdown["risk_score"],
            "category": f_breakdown["category"],
            "fwi_index": f_breakdown["fire_weather_index_fwi"],
            "spread_velocity_kmh": f_breakdown["estimated_spread_velocity_kmh"],
            "hotspots_count": len(hotspots),
            "surface_temp_c": d["telemetry"]["surface_temp_c"],
            "humidity_pct": d["telemetry"]["relative_humidity_pct"],
            "wind_speed_kmh": d["telemetry"]["wind_speed_kmh"],
            "dry_spell_days": d["telemetry"]["dry_spell_days"],
            "ndvi_vegetation": d["telemetry"]["ndvi_vegetation"],
            "recommended_action": f_breakdown["recommended_action"]
        })

    return {
        "active_hotspots": all_hotspots,
        "regional_fire_zones": sorted(fire_zones, key=lambda x: x["fire_risk_score"], reverse=True)
    }

@app.get("/api/air-quality")
def get_air_quality():
    """
    Returns CPCB air quality monitoring stations, sub-pollutants (PM2.5, PM10, NO2, SO2, CO, O3), and AQI forecasts.
    """
    districts = get_all_districts()
    stations = []

    for d in districts:
        eval_p = risk_engine.evaluate_district(d)
        p_res = eval_p["hazard_breakdown"]["pollution"]
        t = d["telemetry"]

        forecast = pollution_ai.forecast_aqi(
            pm25=t.get("pm25", 50.0),
            pm10=t.get("pm10", 80.0),
            temp_c=t.get("surface_temp_c", 30.0),
            humidity_pct=t.get("relative_humidity_pct", 50.0),
            wind_speed_kmh=t.get("wind_speed_kmh", 10.0)
        )

        stations.append({
            "district_id": d["id"],
            "station_name": f"{d['name']} CAAQMS",
            "state": d["state"],
            "lat": d["lat"],
            "lng": d["lng"],
            "aqi": p_res["aqi"],
            "category": p_res["category"],
            "dominant_pollutant": p_res["dominant_pollutant"],
            "color": p_res["color"],
            "health_impact": p_res["health_impact"],
            "sub_indices": p_res["sub_indices"],
            "raw_pollutants": {
                "pm25": t["pm25"],
                "pm10": t["pm10"],
                "no2": t["no2"],
                "so2": t["so2"],
                "co": t["co"],
                "o3": t["o3"]
            },
            "forecast_6h": forecast["forecast_6h"],
            "forecast_12h": forecast["forecast_12h"],
            "forecast_24h": forecast["forecast_24h"]
        })

    return sorted(stations, key=lambda x: x["aqi"], reverse=True)

@app.get("/api/alerts")
def get_alerts():
    """
    Returns all active and archived emergency bulletins.
    """
    return alert_service.get_all_alerts()

@app.post("/api/alerts/dispatch")
def dispatch_alert(req: AlertDispatchRequest):
    """
    Simulates multi-channel emergency dispatch (SMS/Email/CAP Web Push).
    """
    res = alert_service.dispatch_simulated_channel(req.alert_id, req.channel, req.recipient)
    return res

@app.post("/api/alerts/acknowledge/{alert_id}")
def acknowledge_alert(alert_id: str):
    alert = alert_service.acknowledge_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@app.post("/api/predict/flood")
def predict_flood(req: FloodPredictionRequest):
    """
    Direct ML inference for flood risk prediction.
    """
    return flood_ai.predict_flood_risk(
        rainfall_24h=req.rainfall_24h_mm,
        rainfall_72h=req.rainfall_72h_mm,
        river_gauge=req.river_gauge_m,
        danger_mark=req.river_danger_mark_m,
        soil_saturation=req.soil_saturation_pct,
        elevation_m=req.elevation_m
    )

@app.post("/api/predict/fire")
def predict_fire(req: FirePredictionRequest):
    """
    Direct ML inference for forest fire risk prediction.
    """
    return fire_ai.predict_fire_risk(
        surface_temp=req.surface_temp_c,
        relative_humidity=req.relative_humidity_pct,
        wind_speed=req.wind_speed_kmh,
        dry_spell_days=req.dry_spell_days,
        ndvi_vegetation=req.ndvi_vegetation,
        active_hotspots_count=req.active_hotspots_count
    )

@app.post("/api/predict/air-quality")
def predict_air_quality(req: PollutionPredictionRequest):
    """
    Direct ML inference for multi-step AQI forecasting.
    """
    return pollution_ai.forecast_aqi(
        pm25=req.pm25,
        pm10=req.pm10,
        temp_c=req.temp_c,
        humidity_pct=req.humidity_pct,
        wind_speed_kmh=req.wind_speed_kmh
    )

@app.post("/api/predict/composite-risk")
def predict_composite_risk(req: CompositeRiskRequest):
    """
    Computes composite environmental risk from customized hazard weights.
    """
    total_w = req.flood_weight + req.fire_weight + req.pollution_weight
    w_flood = req.flood_weight / total_w
    w_fire = req.fire_weight / total_w
    w_pol = req.pollution_weight / total_w

    max_val = max(req.flood_risk, req.fire_risk, req.pollution_risk)
    weighted_avg = (w_flood * req.flood_risk) + (w_fire * req.fire_risk) + (w_pol * req.pollution_risk)
    composite = round(0.55 * max_val + 0.45 * weighted_avg, 1)

    if composite >= 75:
        cat = "CRITICAL"
        color = "#ef4444"
    elif composite >= 55:
        cat = "HIGH"
        color = "#f97316"
    elif composite >= 30:
        cat = "MEDIUM"
        color = "#eab308"
    else:
        cat = "LOW"
        color = "#10b981"

    return {
        "composite_risk_score": composite,
        "category": cat,
        "color": color,
        "weights_applied": {
            "flood": round(w_flood, 2),
            "fire": round(w_fire, 2),
            "pollution": round(w_pol, 2)
        },
        "dominant_hazard": "FLOOD" if max_val == req.flood_risk else ("FIRE" if max_val == req.fire_risk else "POLLUTION")
    }

@app.get("/api/models/metrics")
def get_models_metrics():
    """
    Returns AI model validation benchmarks and dataset citations.
    """
    return {
        "flood_module": flood_ai.metrics,
        "fire_module": fire_ai.metrics,
        "pollution_module": pollution_ai.metrics,
        "architectural_pipeline": {
            "spatial_processing": "PyTorch CNN-LSTM Hydrology Fusion Network (Sentinel-1 SAR + River Gauge)",
            "wildfire_engine": "PyTorch Transformer Multi-Head Self-Attention FireDangerNet",
            "air_quality_forecaster": "PyTorch Bidirectional LSTM with Attention Pooling (AQI BiLSTM-Attn)",
            "risk_aggregation": "Peak-Amplified Multi-Hazard Composite Weighted Matrix"
        }
    }

@app.post("/api/models/train")
def train_model(req: ModelTrainRequest):
    """
    Train or fine-tune PyTorch Deep Learning models on demand.
    Returns epoch-by-epoch loss curve, accuracy, and updated weights.
    """
    m_type = req.model_type.lower().strip()
    if m_type == "flood":
        result = flood_ai.train(epochs=req.epochs, lr=req.learning_rate, batch_size=req.batch_size)
    elif m_type == "fire":
        result = fire_ai.train(epochs=req.epochs, lr=req.learning_rate, batch_size=req.batch_size)
    elif m_type == "pollution":
        result = pollution_ai.train(epochs=req.epochs, lr=req.learning_rate, batch_size=req.batch_size)
    else:
        raise HTTPException(status_code=400, detail=f"Invalid model_type '{req.model_type}'. Choose 'flood', 'fire', or 'pollution'.")
    
    return {
        "status": "SUCCESS",
        "message": f"{result['model']} successfully trained for {req.epochs} epochs.",
        "training_report": result
    }

@app.get("/api/satellite/sar-chip/{district_id}")
def get_sar_chip(district_id: str):
    district = get_district_by_id(district_id)
    if not district or not district.get("sar_satellite"):
        # Return generic synthetic chip
        return flood_ai.generate_synthetic_sar_scene(
            district_name=district["name"] if district else "India Region",
            water_expansion_pct=40.0,
            flood_km2=10.0
        )
    return flood_ai.generate_synthetic_sar_scene(
        district_name=district["name"],
        water_expansion_pct=district["sar_satellite"]["water_body_expansion_pct"],
        flood_km2=district["sar_satellite"]["detected_flood_km2"]
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
