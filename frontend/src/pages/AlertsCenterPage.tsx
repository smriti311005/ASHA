import React, { useState } from 'react';
import {
  BellRing,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Layers,
  Phone,
  Mail,
  Radio,
  Clock,
  UserCheck
} from 'lucide-react';
import { AlertBulletin } from '../types';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface AlertsCenterPageProps {
  alerts: AlertBulletin[];
  onRefreshAlerts: () => void;
}

export const AlertsCenterPage: React.FC<AlertsCenterPageProps> = ({
  alerts,
  onRefreshAlerts
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [selectedAlert, setSelectedAlert] = useState<AlertBulletin>(alerts[0] || null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [dispatchChannel, setDispatchChannel] = useState<string>('SMS Broadcast (CAP)');
  const [recipient, setRecipient] = useState<string>('+91-9876543210 (NDMA EOC)');
  const [dispatchResult, setDispatchResult] = useState<any>(null);
  const [dispatching, setDispatching] = useState<boolean>(false);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const handleDispatch = async () => {
    if (!selectedAlert) return;
    setDispatching(true);
    try {
      const res = await api.dispatchAlert(selectedAlert.id, dispatchChannel, recipient);
      setDispatchResult(res);
      onRefreshAlerts();
    } catch (e) {
      console.error(e);
    } finally {
      setDispatching(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await api.acknowledgeAlert(id);
      onRefreshAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportText = () => {
    if (!selectedAlert) return;
    const text = `
============================================================
NATIONAL DISASTER EARLY WARNING BULLETIN - ASHA AI
============================================================
BULLETIN ID : ${selectedAlert.id}
LOCATION    : ${selectedAlert.location}
HAZARD TYPE : ${selectedAlert.hazard}
SEVERITY    : ${selectedAlert.severity} (Risk: ${selectedAlert.risk_score}%)
ISSUED AT   : ${selectedAlert.issued_at}
LEAD TIME   : ${selectedAlert.predicted_lead_time}
AFFECTED KM²: ${selectedAlert.affected_area_km2} km²
POPULATION  : ~${selectedAlert.population_exposed} exposed

PRIMARY TRIGGER FACTORS:
${selectedAlert.reasons.map((r, i) => ` ${i + 1}. ${r}`).join('\n')}

ACTIONABLE DIRECTIVES & MITIGATION MEASURES:
${selectedAlert.recommended_actions.map((a, i) => ` [!] ${a}`).join('\n')}

DISPATCHED CHANNELS: ${selectedAlert.channels_dispatched.join(', ')}
============================================================
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedAlert.id}-Disaster-Advisory.txt`;
    a.click();
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className={`p-5 rounded-2xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
        isLight
          ? 'bg-gradient-to-r from-red-50 via-rose-50/60 to-white border-red-200/80 shadow-red-500/5'
          : 'bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border-red-500/30'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border animate-radar-pulse ${
            isLight ? 'bg-red-100 border-red-300 text-red-600' : 'bg-red-500/20 border-red-500/40 text-red-400'
          }`}>
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                EMERGENCY EARLY WARNING &amp; DISASTER ADVISORY CENTER
              </h2>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full border font-semibold ${
                isLight ? 'bg-red-100 text-red-800 border-red-300' : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}>
                NDMA CAP STANDARD
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Automated trigger protocols generating multi-channel actionable alerts for district authorities and civil defense.
            </p>
          </div>
        </div>

        {/* Severity Filter */}
        <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/80 border-slate-800'
        }`}>
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filterSeverity === 'ALL'
                ? isLight
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
                : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filterSeverity === 'CRITICAL'
                ? isLight
                  ? 'bg-red-600 text-white font-bold shadow-xs'
                  : 'bg-red-500/30 text-red-400 font-bold border border-red-500/40'
                : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Critical
          </button>
        </div>
      </div>

      {/* Main Grid: Alert Feeds List & Detailed Bulletin Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Alert Cards Stream */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Warning Bulletins ({filteredAlerts.length})
          </h3>

          <div className="space-y-3 max-h-[640px] overflow-y-auto">
            {filteredAlerts.map((a) => {
              const isSelected = selectedAlert?.id === a.id;
              const isCrit = a.severity === 'CRITICAL';
              return (
                <div
                  key={a.id}
                  onClick={() => {
                    setSelectedAlert(a);
                    setDispatchResult(null);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-red-500/60 shadow-xl shadow-red-950/20'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isCrit ? 'bg-red-500 animate-radar-pulse' : 'bg-orange-500'
                        }`}
                      />
                      <span className="font-mono text-xs font-bold text-white">{a.id}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        isCrit
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      }`}
                    >
                      {a.severity} • {a.risk_score}%
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{a.location}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hazard: <strong className="text-slate-200">{a.hazard}</strong> • Lead Time:{' '}
                      {a.predicted_lead_time}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-800/80">
                    <span>Inundation/Expanse: {a.affected_area_km2} km²</span>
                    <span className={a.acknowledged ? 'text-emerald-400' : 'text-amber-400'}>
                      {a.acknowledged ? '✓ Acknowledged' : '● Unacknowledged'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Detailed NDMA Bulletin View & Dispatch Simulator */}
        <div className="lg:col-span-7 space-y-4">
          {selectedAlert ? (
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5 shadow-xl">
              {/* Bulletin Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                      {selectedAlert.id}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(selectedAlert.issued_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedAlert.location}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportText}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 border-transparent text-slate-200'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Bulletin</span>
                  </button>

                  {!selectedAlert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(selectedAlert.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/30"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-white" />
                      <span className="text-white">Acknowledge</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Threat Summary Banner */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Hazard &amp; Severity</span>
                  <p className="text-base font-bold text-red-400 mt-0.5">
                    {selectedAlert.hazard} ({selectedAlert.severity})
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Impact Zone</span>
                  <p className="text-base font-bold text-white mt-0.5">
                    {selectedAlert.affected_area_km2} km²
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400">Population Exposed</span>
                  <p className="text-base font-bold text-amber-400 mt-0.5">
                    ~{selectedAlert.population_exposed.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Reasons & Sensor Triggers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  AI Trigger Factors &amp; Satellite Verifications
                </h4>
                <div className="space-y-1.5">
                  {selectedAlert.reasons.map((r, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Directives */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mandatory Actionable Directives
                </h4>
                <div className="space-y-1.5">
                  {selectedAlert.recommended_actions.map((a, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-red-950/20 rounded-xl border border-red-900/40 text-xs text-slate-200 flex items-start gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span className="font-medium">{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated Dispatch Control Box */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isLight
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800'
              }`}>
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <Send className="w-4 h-4 text-emerald-500" />
                  Simulate Multi-Channel Emergency Dispatch
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className={`text-[11px] block mb-1 font-medium ${
                      isLight ? 'text-slate-600' : 'text-slate-400'
                    }`}>Dispatch Protocol / Channel:</label>
                    <select
                      value={dispatchChannel}
                      onChange={(e) => setDispatchChannel(e.target.value)}
                      className={`w-full border rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-500 ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`}
                    >
                      <option value="SMS Broadcast (CAP)">SMS Broadcast (Common Alerting Protocol)</option>
                      <option value="Email to State EOC">Email to State Emergency Ops Center</option>
                      <option value="CAP Web Push Gateway">CAP Web Push Notification</option>
                      <option value="All India Radio FM Alert">All India Radio FM Advisory</option>
                    </select>
                  </div>

                  <div>
                    <label className={`text-[11px] block mb-1 font-medium ${
                      isLight ? 'text-slate-600' : 'text-slate-400'
                    }`}>Target Endpoint / Recipient:</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className={`w-full border rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-500 ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <button
                  onClick={handleDispatch}
                  disabled={dispatching}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span className="text-white">Execute Simulated Transmission</span>
                </button>

                {dispatchResult && (
                  <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-800/40 text-xs text-emerald-300 space-y-1 animate-in fade-in">
                    <p className="font-bold">✓ Transmission Logged Successfully (Status: {dispatchResult.status})</p>
                    <p className="font-mono text-[10px] text-slate-300 break-all">{dispatchResult.payload_preview}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              Select an alert from the left list to view details and trigger simulated dispatch.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
