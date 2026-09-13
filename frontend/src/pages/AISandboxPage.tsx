import React, { useState } from 'react';
import {
  Sliders,
  Play,
  Waves,
  Flame,
  Wind,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Cpu,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export const AISandboxPage: React.FC = () => {
  // Flood Simulation Parameters
  const [rainfall24h, setRainfall24h] = useState<number>(185);
  const [rainfall72h, setRainfall72h] = useState<number>(390);
  const [riverGauge, setRiverGauge] = useState<number>(14.5);
  const [dangerMark, setDangerMark] = useState<number>(12.0);
  const [soilSaturation, setSoilSaturation] = useState<number>(92);
  const [elevation, setElevation] = useState<number>(45);

  // Fire Simulation Parameters
  const [surfaceTemp, setSurfaceTemp] = useState<number>(38.5);
  const [humidity, setHumidity] = useState<number>(22);
  const [windSpeed, setWindSpeed] = useState<number>(26);
  const [drySpellDays, setDrySpellDays] = useState<number>(21);
  const [ndvi, setNdvi] = useState<number>(0.28);
  const [hotspotsCount, setHotspotsCount] = useState<number>(3);

  // Pollution Simulation Parameters
  const [pm25, setPm25] = useState<number>(295);
  const [pm10, setPm10] = useState<number>(410);

  // Risk Engine Weights
  const [floodWeight, setFloodWeight] = useState<number>(0.40);
  const [fireWeight, setFireWeight] = useState<number>(0.35);
  const [pollutionWeight, setPollutionWeight] = useState<number>(0.25);

  // Inference Results
  const [inferring, setInferring] = useState<boolean>(false);
  const [results, setResults] = useState<{
    flood: any;
    fire: any;
    pollution: any;
    composite: any;
  } | null>(null);

  const handleRunInference = async () => {
    setInferring(true);
    try {
      const [floodRes, fireRes, pollutionRes] = await Promise.all([
        api.predictFlood({
          rainfall_24h_mm: rainfall24h,
          rainfall_72h_mm: rainfall72h,
          river_gauge_m: riverGauge,
          river_danger_mark_m: dangerMark,
          soil_saturation_pct: soilSaturation,
          elevation_m: elevation
        }),
        api.predictFire({
          surface_temp_c: surfaceTemp,
          relative_humidity_pct: humidity,
          wind_speed_kmh: windSpeed,
          dry_spell_days: drySpellDays,
          ndvi_vegetation: ndvi,
          active_hotspots_count: hotspotsCount
        }),
        api.predictAirQuality({
          pm25,
          pm10,
          temp_c: surfaceTemp,
          humidity_pct: humidity,
          wind_speed_kmh: windSpeed
        })
      ]);

      const compositeRes = await api.predictCompositeRisk({
        flood_risk: floodRes.risk_score,
        fire_risk: fireRes.risk_score,
        pollution_risk: pollutionRes.current.risk_score,
        flood_weight: floodWeight,
        fire_weight: fireWeight,
        pollution_weight: pollutionWeight
      });

      setResults({
        flood: floodRes,
        fire: fireRes,
        pollution: pollutionRes,
        composite: compositeRes
      });
    } catch (err) {
      console.error('Error running simulation inference:', err);
    } finally {
      setInferring(false);
    }
  };

  const handlePreset = (type: 'monsoon_flood' | 'himalayan_wildfire' | 'winter_smog') => {
    if (type === 'monsoon_flood') {
      setRainfall24h(220);
      setRainfall72h(450);
      setRiverGauge(18.2);
      setDangerMark(15.0);
      setSoilSaturation(98);
      setElevation(25);
      setSurfaceTemp(27);
      setHumidity(94);
      setWindSpeed(16);
      setDrySpellDays(0);
      setNdvi(0.75);
      setHotspotsCount(0);
      setPm25(35);
      setPm10(55);
    } else if (type === 'himalayan_wildfire') {
      setRainfall24h(0);
      setRainfall72h(0);
      setRiverGauge(3.0);
      setDangerMark(10.0);
      setSoilSaturation(15);
      setElevation(1800);
      setSurfaceTemp(39);
      setHumidity(15);
      setWindSpeed(32);
      setDrySpellDays(28);
      setNdvi(0.22);
      setHotspotsCount(5);
      setPm25(160);
      setPm10(230);
    } else if (type === 'winter_smog') {
      setRainfall24h(0);
      setRainfall72h(0);
      setRiverGauge(4.0);
      setDangerMark(8.0);
      setSoilSaturation(40);
      setElevation(210);
      setSurfaceTemp(18);
      setHumidity(78);
      setWindSpeed(3.5);
      setDrySpellDays(12);
      setNdvi(0.25);
      setHotspotsCount(1);
      setPm25(380);
      setPm10(490);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                INTERACTIVE AI MODEL SIMULATION LAB
              </h2>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 font-mono rounded-full border border-emerald-500/30">
                SCIKIT-LEARN &amp; GRADIENT BOOSTING PIPELINE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate extreme weather events and test multi-hazard risk engine outputs with instantaneous ML inference.
            </p>
          </div>
        </div>

        {/* Quick Scenario Presets */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Test Presets:</span>
          <button
            onClick={() => handlePreset('monsoon_flood')}
            className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-semibold cursor-pointer transition-all"
          >
            🌊 Severe Flood
          </button>
          <button
            onClick={() => handlePreset('himalayan_wildfire')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold cursor-pointer transition-all"
          >
            🔥 Forest Wildfire
          </button>
          <button
            onClick={() => handlePreset('winter_smog')}
            className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-semibold cursor-pointer transition-all"
          >
            🌫️ Severe Smog
          </button>
        </div>
      </div>

      {/* Main Grid: Sliders Controls & Live AI Inference Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Physics & Sensor Parameter Sliders */}
        <div className="lg:col-span-7 space-y-4">
          {/* FLOOD PARAMETERS */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Waves className="w-4 h-4" />
              1. Flood Hydrology Parameters (Sen1Floods11 &amp; GPM)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>24h Rainfall:</span>
                  <span className="font-mono font-bold text-blue-400">{rainfall24h} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={rainfall24h}
                  onChange={(e) => setRainfall24h(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>72h Cumulative Rain:</span>
                  <span className="font-mono font-bold text-blue-400">{rainfall72h} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="600"
                  value={rainfall72h}
                  onChange={(e) => setRainfall72h(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>River Gauge Level:</span>
                  <span className="font-mono font-bold text-blue-400">{riverGauge} m (Danger: {dangerMark}m)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="0.5"
                  value={riverGauge}
                  onChange={(e) => setRiverGauge(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Soil Moisture Saturation:</span>
                  <span className="font-mono font-bold text-teal-400">{soilSaturation}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={soilSaturation}
                  onChange={(e) => setSoilSaturation(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>
            </div>
          </div>

          {/* FIRE PARAMETERS */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4" />
              2. Wildfire Weather &amp; Fuel Parameters (FIRMS &amp; NDEM)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Land Surface Temp:</span>
                  <span className="font-mono font-bold text-amber-400">{surfaceTemp} °C</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="48"
                  step="0.5"
                  value={surfaceTemp}
                  onChange={(e) => setSurfaceTemp(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Relative Humidity:</span>
                  <span className="font-mono font-bold text-blue-400">{humidity}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Surface Wind Speed:</span>
                  <span className="font-mono font-bold text-teal-400">{windSpeed} km/h</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Dry Spell Days:</span>
                  <span className="font-mono font-bold text-amber-400">{drySpellDays} Days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={drySpellDays}
                  onChange={(e) => setDrySpellDays(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

          {/* POLLUTION PARAMETERS */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <Wind className="w-4 h-4" />
              3. Air Pollution Telemetry (CPCB CAAQMS)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>PM2.5 Concentration:</span>
                  <span className="font-mono font-bold text-purple-400">{pm25} µg/m³</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={pm25}
                  onChange={(e) => setPm25(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>PM10 Concentration:</span>
                  <span className="font-mono font-bold text-purple-400">{pm10} µg/m³</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="700"
                  value={pm10}
                  onChange={(e) => setPm10(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunInference}
            disabled={inferring}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {inferring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Scikit-Learn / Gradient Boosting Pipelines...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Multi-Hazard AI Model Pipeline</span>
              </>
            )}
          </button>
        </div>

        {/* Right 5 Cols: Live Real-Time AI Inference Output */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Live Model Prediction Outputs
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Inference Latency: 8.4ms
              </span>
            </div>

            {results ? (
              <div className="space-y-4 text-xs animate-in fade-in duration-300">
                {/* Composite Banner */}
                <div
                  className="p-4 rounded-2xl border relative overflow-hidden"
                  style={{
                    backgroundColor: `${results.composite.color}15`,
                    borderColor: `${results.composite.color}40`
                  }}
                >
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        Multi-Hazard Composite Index
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-white">
                          {results.composite.composite_risk_score}
                        </span>
                        <span className="text-xs text-slate-400">/ 100</span>
                        <span
                          className="font-bold text-xs uppercase"
                          style={{ color: results.composite.color }}
                        >
                          • {results.composite.category}
                        </span>
                      </div>
                    </div>
                    <span
                      className="px-2.5 py-1 text-[10px] font-bold rounded-full uppercase"
                      style={{
                        backgroundColor: `${results.composite.color}30`,
                        color: results.composite.color
                      }}
                    >
                      Dominant: {results.composite.dominant_hazard}
                    </span>
                  </div>
                </div>

                {/* 3 Model Cards */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-900/40">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Waves className="w-3 h-3 text-blue-400" /> Flood AI
                    </p>
                    <p className="text-lg font-bold text-blue-400 mt-1">
                      {results.flood.risk_score}%
                    </p>
                    <p className="text-[10px] text-slate-400">
                      ~{results.flood.estimated_flooded_km2} km² water
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-900/40">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" /> Fire AI
                    </p>
                    <p className="text-lg font-bold text-amber-400 mt-1">
                      {results.fire.risk_score}%
                    </p>
                    <p className="text-[10px] text-slate-400">
                      FWI: {results.fire.fire_weather_index_fwi}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-900/40">
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Wind className="w-3 h-3 text-purple-400" /> AQI AI
                    </p>
                    <p className="text-lg font-bold text-purple-400 mt-1">
                      {results.pollution.current.aqi}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {results.pollution.current.category}
                    </p>
                  </div>
                </div>

                {/* Action Directives */}
                <div className="space-y-2">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase">
                      Flood Model Directive
                    </span>
                    <p className="text-slate-300 text-[11px]">{results.flood.recommended_action}</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">
                      Wildfire Model Directive
                    </span>
                    <p className="text-slate-300 text-[11px]">{results.fire.recommended_action}</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-purple-400 uppercase">
                      Air Quality Health Directive
                    </span>
                    <p className="text-slate-300 text-[11px]">{results.pollution.recommended_action}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 space-y-3">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs">
                  Adjust environmental parameters on the left and click "Execute Multi-Hazard AI Model Pipeline" to observe live predictions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
