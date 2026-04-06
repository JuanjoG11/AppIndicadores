import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import AreaDashboard from './pages/AreaDashboard';
import AnalystDashboard from './pages/AnalystDashboard';
import Login from './pages/Login';
import SettingsModal from './components/layout/SettingsModal';
import CommandPalette from './components/common/CommandPalette';
import { DashboardSkeleton, AnalystSkeleton } from './components/common/SkeletonLoader';
import { ToastProvider, useToast } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';
import { useKPIs } from './hooks/useKPIs';
import { filterKPIsByEntity } from './utils/kpiHelpers';
import './index.css';
import './App.css';

// ─── Inner App (needs Toast context) ────────────────────────────────────────
const AppInner = () => {
  const addToast = useToast();

  // ── Auth ──────────────────────────────────────────────────────────────────
  const { currentUser, handleLogin, handleLogout } = useAuth();

  // ── UI State ──────────────────────────────────────────────────────────────
  const [activeCompany, setActiveCompany] = useState('TYM');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // ── KPI Data (via custom hook) ────────────────────────────────────────────
  const { kpiData, rawUpdates, isLoading, lastSyncTime, applyKPIUpdate } = useKPIs(
    currentUser,
    activeCompany,
    addToast
  );

  // ── Theme ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // ── Responsive sidebar ────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Command Palette keyboard shortcut (Ctrl+K / Cmd+K) ───────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // ── Login/Logout handlers ─────────────────────────────────────────────────
  const onLoginSuccess = (user) => {
    handleLogin(user);
    // Usar la empresa del usuario; el Gerente puede cambiarla desde el dashboard
    if (user.company) setActiveCompany(user.company);
    const brandLabel = user.activeBrand 
      ? ` · ${Array.isArray(user.activeBrand) ? user.activeBrand.join(' + ') : user.activeBrand}` 
      : '';
    addToast('success', `¡Bienvenido, ${user.name}${brandLabel}! 🎉`);
  };

  const onLogout = () => {
    handleLogout();
    addToast('info', 'Sesión cerrada correctamente');
  };

  // ── KPI Update handler (with permission checks) ───────────────────────────
  const handleUpdateKPI = useCallback((id, data) => {
    if (!data || typeof data !== 'object') {
      console.warn('handleUpdateKPI: datos inválidos', data);
      return;
    }

    const kpi = kpiData.find(k => k.id === id);
    if (!kpi) {
      console.error('KPI no encontrado:', id);
      return;
    }

    const isMetaUpdate = data.type === 'META_UPDATE';
    const isManager = currentUser?.role === 'Gerente';

    if (isMetaUpdate && !isManager) {
      addToast('error', '🔒 Solo gerentes pueden actualizar metas');
      return;
    }

    if (!isMetaUpdate && kpi.responsable !== currentUser?.cargo) {
      addToast('error', `⛔ Sin permiso para: ${kpi.name}`);
      return;
    }

    applyKPIUpdate(id, data, true);

    if (isMetaUpdate) {
      addToast('success', `✅ Meta actualizada: ${kpi.name}`);
    } else {
      addToast('success', `📊 Indicador actualizado: ${kpi.name}`);
    }
  }, [kpiData, currentUser, applyKPIUpdate, addToast]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!currentUser) {
    return <Login onLogin={onLoginSuccess} />;
  }

  return (
    <div style={{ display: 'flex', background: 'var(--bg-app)', minHeight: '100vh', color: 'var(--text-main)' }}>
      <Sidebar
        currentUser={currentUser}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        kpiData={kpiData}
        activeCompany={activeCompany}
      />

      <main style={{
        marginLeft: isSidebarOpen && window.innerWidth > 900 ? '260px' : '0',
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.3s ease',
        width: '100%',
      }}>
        <TopBar
          currentUser={currentUser}
          kpiData={kpiData}
          activeCompany={activeCompany}
          onOpenSettings={() => setShowSettings(true)}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={onLogout}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
          lastSyncTime={lastSyncTime}
        />

        <div className="app-container" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isLoading ? (
            currentUser?.role === 'Gerente' ? <DashboardSkeleton /> : <AnalystSkeleton />
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  currentUser.role === 'Gerente'
                    ? <ExecutiveDashboard kpiData={kpiData} rawUpdates={rawUpdates} activeCompany={activeCompany} setActiveCompany={setActiveCompany} />
                    : <Navigate to="/mis-indicadores" />
                }
              />
              <Route
                path="/area/:areaId"
                element={<AreaDashboard kpiData={kpiData} activeCompany={activeCompany} currentUser={currentUser} onUpdateKPI={handleUpdateKPI} />}
              />
              <Route
                path="/mis-indicadores"
                element={<AnalystDashboard kpiData={kpiData} currentUser={currentUser} onUpdateKPI={handleUpdateKPI} />}
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </div>
      </main>

      {/* Settings Modal (Gerente only) */}
      {showSettings && currentUser?.role === 'Gerente' && (
        <SettingsModal
          currentUser={currentUser}
          kpiData={kpiData}
          onUpdateKPI={handleUpdateKPI}
          theme={theme}
          onToggleTheme={toggleTheme}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Command Palette */}
      <CommandPalette
        kpiData={kpiData}
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        currentUser={currentUser}
      />
    </div>
  );
};

// ─── Root App (provides Toast context + Router) ───────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
