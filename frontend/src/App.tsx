import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DistrictDrawer } from './components/DistrictDrawer';

import { DashboardPage } from './pages/DashboardPage';
import { InteractiveMapPage } from './pages/InteractiveMapPage';
import { FloodWatchPage } from './pages/FloodWatchPage';
import { FireTrackerPage } from './pages/FireTrackerPage';
import { PollutionMonitorPage } from './pages/PollutionMonitorPage';
import { AISandboxPage } from './pages/AISandboxPage';
import { AlertsCenterPage } from './pages/AlertsCenterPage';
import { ModelMetricsPage } from './pages/ModelMetricsPage';

import { DashboardSummary, DistrictProfile, AlertBulletin } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [districts, setDistricts] = useState<DistrictProfile[]>([]);
  const [alerts, setAlerts] = useState<AlertBulletin[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [sumData, distData, alertData] = await Promise.all([
        api.getDashboard(),
        api.getDistricts(),
        api.getAlerts()
      ]);
      setSummary(sumData);
      setDistricts(distData);
      setAlerts(alertData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load ASHA AI data:', err);
      setError(err.message || 'Error connecting to ASHA AI backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Background refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectDistrict = (d: DistrictProfile) => {
    setSelectedDistrict(d);
  };

  const handleCloseDrawer = () => {
    setSelectedDistrict(null);
  };

  const handleDispatchAlert = (alertId: string, location: string) => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Fixed Command Center Header */}
      <Navbar
        summary={summary}
        onOpenAlerts={() => setCurrentTab('alerts')}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Operations Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          alertCount={alerts.filter((a) => !a.acknowledged).length}
        />

        {/* Center Main Dynamic View */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#090d16] via-[#0b101c] to-[#080c14] relative">
          {error && (
            <div className="m-4 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button
                onClick={loadData}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {currentTab === 'dashboard' && (
            <DashboardPage
              summary={summary}
              districts={districts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'map' && (
            <InteractiveMapPage
              districts={districts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
            />
          )}

          {currentTab === 'floods' && (
            <FloodWatchPage
              districts={districts}
              onSelectDistrict={handleSelectDistrict}
            />
          )}

          {currentTab === 'fires' && (
            <FireTrackerPage
              districts={districts}
              onSelectDistrict={handleSelectDistrict}
            />
          )}

          {currentTab === 'pollution' && (
            <PollutionMonitorPage
              districts={districts}
              onSelectDistrict={handleSelectDistrict}
            />
          )}

          {currentTab === 'sandbox' && <AISandboxPage />}

          {currentTab === 'alerts' && (
            <AlertsCenterPage
              alerts={alerts}
              onRefreshAlerts={loadData}
            />
          )}

          {currentTab === 'models' && <ModelMetricsPage />}
        </main>
      </div>

      {/* Slide-over District Multi-Hazard Inspector Drawer */}
      <DistrictDrawer
        district={selectedDistrict}
        onClose={handleCloseDrawer}
        onDispatchAlert={handleDispatchAlert}
      />
    </div>
  );
};

export default App;
