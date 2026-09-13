"""
ASHA AI - Emergency Early Warning & Alert Dispatch Service
Generates actionable disaster alerts conforming to National Disaster Management Authority (NDMA) protocols.
Supports automated multi-channel simulated dispatch (SMS, Email, Web Push, Radio Advisory).
"""

from datetime import datetime, timezone
import uuid

class AlertService:
    def __init__(self):
        self.alerts_store = []
        self._init_default_alerts()

    def _init_default_alerts(self):
        """Pre-populate critical early warning bulletins for immediate operational display"""
        now = datetime.now(timezone.utc).isoformat()
        
        self.alerts_store = [
            {
                "id": "ALT-2026-0911-01",
                "district_id": "assam-kaziranga",
                "location": "Kaziranga (Golaghat), Assam",
                "hazard": "FLOOD",
                "severity": "CRITICAL",
                "risk_score": 92.4,
                "issued_at": now,
                "predicted_lead_time": "6 Hours",
                "affected_area_km2": 48.6,
                "population_exposed": 142000,
                "reasons": [
                    "Brahmaputra water gauge exceeded Danger Mark by +1.9m",
                    "Sentinel-1 SAR detected +142.5% water surface expansion",
                    "Continuous torrential precipitation: 395mm recorded in 72 hours",
                    "Soil moisture capacity saturated at 94.2%"
                ],
                "recommended_actions": [
                    "Immediate evacuation of low-lying floodplains in Bokakhat & Golaghat",
                    "Mobilize NDRF 1st Battalion & SDRF quick-response water rescue boats",
                    "Elevate livestock to high-ground artificial highlands in Kaziranga National Park",
                    "Close NH-715 submerged sectors to civilian vehicular transit"
                ],
                "channels_dispatched": ["SMS Broadcast (CAP)", "Email to State EOC", "Web Push", "AIR Local FM"],
                "acknowledged": False
            },
            {
                "id": "ALT-2026-0911-02",
                "district_id": "uk-nainital",
                "location": "Nainital Forest Range, Uttarakhand",
                "hazard": "FIRE",
                "severity": "CRITICAL",
                "risk_score": 87.8,
                "issued_at": now,
                "predicted_lead_time": "Immediate / Active",
                "affected_area_km2": 18.5,
                "population_exposed": 45000,
                "reasons": [
                    "NASA FIRMS VIIRS detected 3 high-intensity thermal hotspots (FRP 84.2 MW)",
                    "24 consecutive dry spell days with extreme fuel desiccation (NDVI 0.29)",
                    "Gusty mountain slope winds recorded at 28.4 km/h accelerating flame front",
                    "Extremely low relative humidity of 18%"
                ],
                "recommended_actions": [
                    "Deploy Forest Dept fire-watch crews to cut counter-fire control lines",
                    "Air Force Bambi Bucket helicopter sorties on standby at Pantnagar Airstrip",
                    "Enforce strict moratorium on all agricultural stubble burning and tourist campfires",
                    "Establish 2km safety buffer around outer hill settlements"
                ],
                "channels_dispatched": ["SMS Alert to Forest Division", "Email to SDMA Dehradun", "Web Push"],
                "acknowledged": False
            },
            {
                "id": "ALT-2026-0911-03",
                "district_id": "delhi-anandvihar",
                "location": "Delhi (Anand Vihar / East), Delhi",
                "hazard": "POLLUTION",
                "severity": "CRITICAL",
                "risk_score": 94.5,
                "issued_at": now,
                "predicted_lead_time": "Next 24 Hours",
                "affected_area_km2": 85.0,
                "population_exposed": 2800000,
                "reasons": [
                    "CPCB PM2.5 concentration spiked to 348 µg/m³ (NAQI: 482 Severe)",
                    "Atmospheric thermal inversion trapping particulate matter near surface",
                    "Calm surface winds (4.5 km/h) preventing horizontal pollutant dispersion",
                    "AI forecast predicts severe smog persistence for at least 24 hours"
                ],
                "recommended_actions": [
                    "Invoke Stage-IV of Graded Response Action Plan (GRAP-IV)",
                    "Mandatory closure of physical primary schooling; switch to online mode",
                    "Ban entry of non-essential diesel trucks and halt all construction excavation",
                    "Issue public advisory for N95 masks and indoor HEPA air filtration"
                ],
                "channels_dispatched": ["CPCB Alert Gateway", "Email to CAQM", "Web Push", "Public Display Boards"],
                "acknowledged": True
            }
        ]

    def get_all_alerts(self):
        return self.alerts_store

    def create_alert(self, district_id: str, location: str, hazard: str, severity: str,
                     risk_score: float, affected_area_km2: float, reasons: list, actions: list):
        now = datetime.now(timezone.utc).isoformat()
        alert_id = f"ALT-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
        
        new_alert = {
            "id": alert_id,
            "district_id": district_id,
            "location": location,
            "hazard": hazard,
            "severity": severity,
            "risk_score": round(risk_score, 1),
            "issued_at": now,
            "predicted_lead_time": "12 Hours" if risk_score < 80 else "Immediate / 6 Hours",
            "affected_area_km2": round(affected_area_km2, 1),
            "population_exposed": int(affected_area_km2 * 1200),
            "reasons": reasons,
            "recommended_actions": actions,
            "channels_dispatched": ["SMS Broadcast (CAP)", "Email Bulletin", "Web Notification Gateway"],
            "acknowledged": False
        }
        self.alerts_store.insert(0, new_alert)
        return new_alert

    def acknowledge_alert(self, alert_id: str):
        for a in self.alerts_store:
            if a["id"] == alert_id:
                a["acknowledged"] = True
                return a
        return None

    def dispatch_simulated_channel(self, alert_id: str, channel: str, target_recipient: str):
        for a in self.alerts_store:
            if a["id"] == alert_id:
                if channel not in a["channels_dispatched"]:
                    a["channels_dispatched"].append(channel)
                return {
                    "status": "DELIVERED",
                    "channel": channel,
                    "recipient": target_recipient,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "alert_id": alert_id,
                    "payload_preview": f"🚨 [ASHA AI ALERT] {a['severity']} {a['hazard']} WARNING for {a['location']}. Risk: {a['risk_score']}%. Take immediate action."
                }
        return {"status": "FAILED", "reason": "Alert ID not found"}

alert_service = AlertService()
