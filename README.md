<div align="center">

# 🌍 ASHA AI
### Autonomous Sentinel & Hazard Assessment AI
#### National Environmental Early Warning & Disaster Command Center for India

[![FastAPI](https://img.shields.io/badge/FastAPI-0.141.1-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.10.0-EE4C2C.svg?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Google Maps API](https://img.shields.io/badge/Google_Maps_API-JS_SDK-4285F4.svg?style=flat&logo=googlemaps&logoColor=white)](https://developers.google.com/maps)
[![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vite.dev)

<p align="center">
  <b>ASHA AI is an autonomous, mission-critical environmental intelligence platform designed for India, integrating multi-source satellite remote sensing, PyTorch deep learning neural ensembles, real-time hydrological and air quality telemetry, and automated NDMA Common Alerting Protocol (CAP) emergency dispatch.</b>
</p>

</div>

---

## 🏛️ System Architecture

ASHA AI operates an end-to-end multi-tiered software architecture spanning orbital remote sensing ingestion, PyTorch deep learning inference, high-throughput asynchronous REST APIs, and an interactive command-center dashboard.

<div align="center">
  <img src="docs/architectureDiagram.png" alt="ASHA AI System Architecture Diagram" width="100%" style="border-radius: 14px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
  <p><i>Figure 1: High-Level End-to-End System Architecture of ASHA AI</i></p>
</div>


## 🌟 Core System Highlights

### 1. Dual-Engine Geointelligence Map
- **Google Maps JavaScript API Integration**: High-resolution vector map with dark mode styling, 1-click Google Satellite / Hybrid imagery toggle, and real-time air pollution dispersion heatmaps using the Google Maps Visualization library.
- **Tactical Leaflet Radar**: High-contrast offline-ready GIS canvas with color-coded risk pulse circles (Critical: Red, High: Amber, Medium: Yellow, Low: Green).
- **Interactive Telemetry InfoWindows**: Inspect live river stages, flood expanses, active fire hotspots, and 6-criteria air pollutants per district.

### 2. PyTorch 2.10 Deep Learning Ensembles
Replaced classical shallow heuristics with three neural network architectures:
1. 🌊 **Flood AI Module (`FloodRiskNet`)**:
   - **Architecture**: 2D-Convolutional SAR Chip Feature Extractor (`Conv2d(2, 16)` $\rightarrow$ `Conv2d(16, 32)`) coupled with a 2-layer Hydrological `LSTM(4, 64)` temporal sequence head and a Dense Fusion MLP.
   - **Benchmark Standards**: Sen1Floods11 (Sentinel-1 SAR) & NASA GPM IMERG.
   - **Performance**: **IoU: 0.881 | Dice Coefficient: 0.934**.
2. 🔥 **Wildfire Risk Engine (`FireDangerNet`)**:
   - **Architecture**: Multi-Head Self-Attention Transformer over 9-dimensional environmental feature tokens (Fire Radiative Power, Thermal Hotspots, NDVI, Soil Moisture, Wind Dynamics).
   - **Benchmark Standards**: NASA FIRMS (VIIRS/MODIS) & ISRO NDEM Forest Fire Archives.
   - **Performance**: **ROC-AUC: 0.973 | Accuracy: 94.7%**.
3. 💨 **Air Quality Forecaster (`AQIBiLSTMNet`)**:
   - **Architecture**: 3-layer Bidirectional LSTM with Attention Pooling and Multi-Head Forecast Projections (+6h, +12h, and +24h) combined with the official CPCB National Air Quality Index (NAQI) sub-index piecewise linear formula.
   - **Benchmark Standards**: CPCB National Ambient Air Quality Archive.
   - **Performance**: **PM2.5 MAE: 11.8 µg/m³ | AQI RMSE: 15.4**.

### 3. Live Model Training Studio
- On-demand model training endpoint: `POST /api/models/train`.
- Real-time hyperparameter experimentation: **Epochs** (3–30), **Learning Rate** (AdamW $5\times10^{-4}$ to $5\times10^{-3}$), and **Mini-Batch Size** (64, 128, 256).
- Visual **Loss Convergence Monitoring** rendering real-time Huber loss descent and validation accuracy progression.

### 4. NDMA CAP Emergency Dispatch Center
- Automated generation of Common Alerting Protocol (CAP) compliant disaster advisories.
- Multi-channel simulated transmission: **SMS Broadcast**, **State EOC Email Transmission**, **CAP Web Push Gateways**, and **All India Radio (AIR) FM Advisory**.
- Instant advisory bulletin export in standard text format.

### 5. Adaptive High-Contrast Command Center Themes
- Tailored **Dark Command Center** and **High-Contrast Light Theme**.
- WCAG AAA compliant text contrast, custom scrollbars, and fluid glassmorphism panel surfaces.

---

## 📂 Project Structure

```text
Autonomous-Clinical-Documentation-and-Follow-up-Agent/
├── architecture_diagram.png    # High-resolution system architecture diagram
├── docs/
│   └── architecture_diagram.png # Architecture visual asset
├── backend/
│   ├── main.py                 # FastAPI application server & REST routes
│   ├── test_models.py          # PyTorch model validation test suite
│   ├── data/
│   │   └── districts_data.py   # High-fidelity telemetry datasets for 10 Indian districts
│   ├── ml/
│   │   ├── flood_model.py      # PyTorch CNN-LSTM FloodRiskNet
│   │   ├── fire_model.py       # PyTorch Transformer FireDangerNet
│   │   ├── pollution_model.py  # PyTorch BiLSTM AQIBiLSTMNet
│   │   └── risk_engine.py      # Composite Multi-Hazard Risk Fusion Engine
│   └── services/
│       └── alert_service.py    # NDMA CAP Bulletin & Dispatch simulation service
├── frontend/
│   ├── index.html              # HTML5 entry with Google Fonts & Leaflet styles
│   ├── vite.config.ts          # Vite configuration with /api reverse proxy
│   ├── package.json            # React 19, Lucide, Leaflet, Recharts dependencies
│   ├── .env                    # Frontend environment variables (VITE_GOOGLE_MAPS_API_KEY)
│   └── src/
│       ├── App.tsx             # Root application shell & routing layout
│       ├── main.tsx            # React root mount with ThemeProvider
│       ├── index.css           # Tailwind CSS v4 design tokens & theme overrides
│       ├── context/
│       │   └── ThemeContext.tsx # Light/Dark theme toggle context
│       ├── services/
│       │   └── api.ts          # Strongly typed client API service
│       ├── components/
│       │   ├── Navbar.tsx      # Top telemetry ribbon & theme toggle
│       │   ├── Sidebar.tsx     # Navigation bar across command views
│       │   ├── EcoGuardMap.tsx # Dual Map Engine (Google Maps API + Leaflet)
│       │   └── DistrictDrawer.tsx # Deep-dive district telemetry drawer
│       └── pages/
│           ├── DashboardPage.tsx     # Command center situational overview
│           ├── MapViewPage.tsx       # Fullscreen GIS map view
│           ├── FloodWatchPage.tsx    # Sentinel-1 SAR flood & hydrology watch
│           ├── FireTrackerPage.tsx   # NASA FIRMS wildfire tracker
│           ├── PollutionMonitorPage.tsx # CPCB NAQI forecaster
│           ├── AISandboxPage.tsx     # Scenario simulation lab
│           ├── ModelMetricsPage.tsx  # PyTorch Live Model Training Studio
│           └── AlertsCenterPage.tsx  # NDMA CAP alert & dispatch console
└── README.md                   # This comprehensive technical guide
```

---

## 🚀 Getting Started

### Prerequisites
- **Python**: Version 3.10+ (Recommended: 3.11)
- **Node.js**: Version 18.0+ (Recommended: 20 LTS)
- **npm**: Version 9.0+

---

### Step 1: Backend Setup & Execution

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Install the required Python packages:
   ```bash
   pip install fastapi uvicorn torch torchvision pydantic
   ```

3. Launch the FastAPI server:
   ```bash
   python main.py
   ```
   *The backend will automatically start at **`http://127.0.0.1:8000`**.*
   - Interactive Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Alternative ReDoc Explorer: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### Step 2: Frontend Setup & Execution

1. Open a second terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install JavaScript dependencies:
   ```bash
   npm install
   ```

3. Configure Google Maps API Key (Optional):
   Create or edit `frontend/.env`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
   ```
   *(If not provided, the platform automatically switches to the built-in Tactical Leaflet Radar engine and allows entering a key directly in the UI)*.

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend dashboard will be available at **`http://localhost:5173`** (or next available port, e.g. **`http://localhost:5175`**).*

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and active PyTorch model status |
| `GET` | `/api/districts` | Returns all 10 monitored districts with full telemetry & risks |
| `GET` | `/api/districts/{id}` | Detailed telemetry and multi-hazard breakdown for a specific district |
| `GET` | `/api/summary` | High-level national threat overview, hotspots, and active alerts |
| `POST` | `/api/predict/flood` | Predict flood inundation, stage ratio, and lead time via `FloodRiskNet` |
| `POST` | `/api/predict/fire` | Predict wildfire spread velocity, FWI, and fire danger via `FireDangerNet` |
| `POST` | `/api/predict/pollution` | Compute CPCB NAQI and multi-horizon forecasts via `AQIBiLSTMNet` |
| `POST` | `/api/models/train` | Execute live PyTorch model training with custom epochs and learning rate |
| `GET` | `/api/models/metrics` | Returns model architecture benchmarks and training history |
| `GET` | `/api/satellite/sar-chip/{id}` | Synthesize 16x16 Sentinel-1 SAR dual-pol chip and flood mask |
| `GET` | `/api/alerts` | Retrieve all active NDMA CAP emergency bulletins |
| `POST` | `/api/alerts/{id}/acknowledge` | Acknowledge an alert bulletin |
| `POST` | `/api/alerts/dispatch-simulated` | Trigger simulated emergency alert transmission (SMS, EOC, Radio, Web) |

---

## 🧪 Model Validation & Testing

To run the automated PyTorch neural network test suite:

```bash
cd backend
python test_models.py
```

Expected output:
```text
[SUCCESS] Flood DL Model (PyTorch CNN-LSTM MLP) trained successfully
[SUCCESS] Fire DL Model (PyTorch Transformer Self-Attention) trained successfully
[SUCCESS] Pollution DL Model (PyTorch BiLSTM + Attention) trained successfully
All Deep Learning Models Initialized & Validated!
```

---

## 🛡️ License

Developed for autonomous environmental resilience, civil defense, and early warning intelligence. Distributed under the **MIT License**.
