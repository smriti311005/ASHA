from ml.flood_model import flood_ai
from ml.fire_model import fire_ai  
from ml.pollution_model import pollution_ai

# Test flood
r = flood_ai.predict_flood_risk(185, 380, 15, 12, 92, 45)
print(f"Flood: {r['risk_score']:.1f}% {r['category']}")

# Test fire
r2 = fire_ai.predict_fire_risk(38, 18, 28, 22, 0.28, 3)
print(f"Fire: {r2['risk_score']:.1f}% {r2['category']}")

# Test pollution
r3 = pollution_ai.forecast_aqi(320, 460, 18, 80, 3.5)
print(f"AQI: {r3['current']['aqi']} {r3['current']['category']}")

print("All 3 DL models initialized and operational!")
