import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import AreaDashboard from './pages/AreaDashboard';
import AnalystDashboard from './pages/AnalystDashboard';
import Login from './pages/Login';
import { mockKPIData } from './data/mockData';
import { supabase } from './lib/supabase';
import { filterKPIsByEntity } from './utils/kpiHelpers';
import SettingsModal from './components/layout/SettingsModal';
import './index.css';
import './App.css';

const AppContent = ({ currentUser, kpiData, activeCompany, setActiveCompany, theme, toggleTheme, showSettings, setShowSettings, isSidebarOpen, setIsSidebarOpen, handleLogin, handleLogout, onUpdateKPI }) => {
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', background: 'var(--bg-app)', minHeight: '100vh', color: 'var(--text-main)' }}>
      <Sidebar currentUser={currentUser} onLogout={handleLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main style={{
        marginLeft: isSidebarOpen && window.innerWidth > 900 ? '260px' : '0',
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.3s ease',
        width: '100%'
      }}>
        <TopBar
          currentUser={currentUser}
          kpiData={kpiData}
          activeCompany={activeCompany}
          onOpenSettings={() => setShowSettings(true)}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="app-container" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route
              path="/"
              element={
                currentUser.role === 'Gerente'
                  ? <ExecutiveDashboard kpiData={kpiData} activeCompany={activeCompany} setActiveCompany={setActiveCompany} />
                  : <Navigate to="/mis-indicadores" />
              }
            />
            <Route
              path="/area/:areaId"
              element={<AreaDashboard kpiData={kpiData} activeCompany={activeCompany} currentUser={currentUser} onUpdateKPI={onUpdateKPI} />}
            />
            <Route
              path="/mis-indicadores"
              element={<AnalystDashboard kpiData={kpiData} currentUser={currentUser} onUpdateKPI={onUpdateKPI} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>

      {showSettings && (
        <SettingsModal
          currentUser={currentUser}
          kpiData={kpiData}
          onUpdateKPI={onUpdateKPI}
          theme={theme}
          onToggleTheme={toggleTheme}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeCompany, setActiveCompany] = useState('TYM');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showSettings, setShowSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
  const [kpiData, setKpiData] = useState(mockKPIData);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 1. Cargar datos iniciales de Supabase y Suscribirse a cambios
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .order('updated_at', { ascending: true });

      if (data && !error) {
        data.forEach(update => {
          applyKPIUpdate(update.kpi_id, update.additional_data, false);
        });
      }
    };

    fetchInitialData();

    // Suscripción en tiempo real
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'kpi_updates' },
        (payload) => {
          applyKPIUpdate(payload.new.kpi_id, payload.new.additional_data, false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.company) {
      setActiveCompany(user.company);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Función interna para aplicar actualizaciones de KPIs
  const applyKPIUpdate = (kpiId, newData, shouldPersist = true) => {
    setKpiData(prevData => prevData.map(kpi => {
      if (kpi.id === kpiId) {
        const updatedAdditionalData = {
          ...kpi.additionalData,
          ...newData
        };

        const d = updatedAdditionalData;
        let newValue = kpi.currentValue;
        let targetMeta = kpi.targetMeta;

        // Preserve history per company and brand
        const currentBrand = d.brand || 'GLOBAL';
        const currentCompany = d.company || 'GLOBAL';
        const dataKey = `${currentCompany}-${currentBrand}`;

        const brandValues = kpi.brandValues || {};

        try {
          if (kpiId === 'pedidos-devueltos') newValue = (d.pedidosDevueltos / d.pedidosFacturados) * 100;
          else if (kpiId === 'promedio-pedidos-auxiliar') newValue = d.numeroPedidos / d.auxiliares;
          else if (kpiId === 'promedio-pedidos-carro') newValue = d.numeroPedidos / d.vehiculos;
          else if (kpiId === 'gasto-nomina-venta') newValue = (d.nominaLogistica / d.ventaTotal) * 100;
          else if (kpiId === 'gasto-fletes-venta') newValue = (d.valorFletes / d.ventaTotal) * 100;
          else if (kpiId === 'horas-extras-auxiliares') newValue = (d.totalHorasExtras / d.auxiliares) / 12;
          else if (kpiId === 'primer-margen') newValue = ((d.ventas - d.costoVentas) / d.ventas) * 100;
          else if (kpiId === 'devoluciones-mal-estado') newValue = (d.valorDevolucion / d.ventaTotal) * 100;
          else if (kpiId === 'promedio-venta-vendedor') newValue = d.ventasTotales / d.numeroVendedores;
          else if (kpiId === 'venta-credito-total') newValue = (d.ventaCredito / d.ventaTotal) * 100;
          else if (kpiId === 'cartera-vencida-total') newValue = (d.carteraVencida / d.totalCartera) * 100;
          else if (kpiId === 'cartera-no-vencida') newValue = (d.carteraNoVencida / d.carteraTotal) * 100;
          else if (kpiId === 'cartera-11-30') newValue = (d.cartera1130 / d.carteraTotal) * 100;
          else if (kpiId === 'valor-cartera-venta') newValue = (d.carteraTotal / d.ventaTotal) * 100;
          else if (kpiId === 'notas-errores-venta') newValue = (d.notasDevolucion / d.valorVenta) * 100;
          else if (kpiId === 'fiabilidad-inventarios') newValue = (d.valorCorrecto / d.valorVerificado) * 100;
          // Picking Specific
          else if (kpiId === 'segundos-unidad-separada') newValue = d.segundosUtilizados / d.unidadesSeparadas;
          else if (kpiId === 'pesos-separados-hombre') newValue = d.valorVenta / d.auxiliaresSeparacion;
          else if (kpiId === 'pedidos-separar-total') newValue = (d.pedidosSeparados / d.pedidosFacturados) * 100;
          else if (kpiId === 'planillas-separadas') newValue = (d.planillasSeparadas / d.planillasGeneradas) * 100;
          else if (kpiId === 'nomina-venta-picking') newValue = (d.valorNomina / d.ventaTotal) * 100;
          else if (kpiId === 'horas-extras-venta-picking') newValue = (d.horasExtras / d.ventaTotal) * 100;
          // Deposito Specific
          else if (kpiId === 'embalajes-perdidos') newValue = d.canastillasRecibidas - d.canastillasGestionadas;
          else if (kpiId === 'nomina-compra-deposito') newValue = (d.valorNomina / d.ventaTotal) * 100;
          else if (kpiId === 'horas-extras-venta-deposito') newValue = (d.horasExtras / d.ventaTotal) * 100;
          else if (kpiId === 'averias-venta') newValue = (d.totalAverias / d.ventaTotal) * 100;
          // Talento Humano Specific
          else if (kpiId === 'rotacion-personal') newValue = (d.personalRetirado / d.promedioEmpleados) * 100;
          else if (kpiId === 'ausentismo') newValue = (d.diasPerdidos / d.diasLaborados) * 100;
          else if (kpiId === 'calificacion-auditoria') newValue = (d.actividadesEjecutadas / d.actividadesProgramadas) * 100;
          else if (kpiId === 'he-rn-nomina') newValue = (d.valorHEDHEN / d.totalNomina) * 100;
          else if (kpiId === 'gasto-nomina-venta-rrhh') newValue = (d.valorNomina / d.ventaTotal) * 100;
          else if (kpiId === 'actividades-cultura') newValue = (d.actividadesEjecutadas / d.actividadesProgramadas) * 100;
          else if (kpiId === 'tiempo-contratacion') newValue = d.diasVacante;
          else if (d.currentValue !== undefined) newValue = d.currentValue;
        } catch (e) {
          console.error("Error calculating KPI:", e);
        }

        // Determinar meta basada en marca o empresa
        if (typeof kpi.meta === 'object') {
          targetMeta = kpi.meta[d.brand] || kpi.meta[d.company] || Object.values(kpi.meta)[0];
        }

        newValue = parseFloat((newValue || 0).toFixed(2));

        let semaphore = kpi.semaphore;
        let compliance = kpi.compliance;

        if (typeof targetMeta === 'number' && targetMeta !== 0) {
          const isInverse = kpiId.includes('devueltos') ||
            kpiId.includes('gasto') ||
            kpiId.includes('horas-extras') ||
            kpiId.includes('mal-estado') ||
            kpiId.includes('vencida') ||
            kpiId === 'segundos-unidad-separada' ||
            kpiId === 'notas-errores-venta' ||
            kpiId.includes('nomina') ||
            kpiId === 'rotacion-personal' ||
            kpiId === 'ausentismo' ||
            kpiId === 'he-rn-nomina' ||
            kpiId === 'tiempo-contratacion';
          compliance = isInverse ? (targetMeta / newValue) * 100 : (newValue / targetMeta) * 100;
          compliance = Math.min(Math.round(compliance), 100);
          if (newValue === 0 && isInverse) compliance = 100;

          if (compliance >= 95) semaphore = 'green';
          else if (compliance >= 85) semaphore = 'yellow';
          else semaphore = 'red';
        }

        // Update brand/company values history
        brandValues[dataKey] = {
          value: newValue,
          meta: targetMeta,
          compliance,
          semaphore,
          additionalData: updatedAdditionalData,
          company: currentCompany,
          brand: currentBrand
        };

        // Si la actualización viene del usuario (local), persistir en Supabase
        if (shouldPersist) {
          persistUpdate(kpiId, updatedAdditionalData, newValue);
        }

        return {
          ...kpi,
          currentValue: newValue,
          targetMeta,
          compliance,
          semaphore,
          hasData: true,
          additionalData: updatedAdditionalData,
          brandValues,
          history: kpi.history.map((h, i) => i === kpi.history.length - 1 ? { ...h, value: newValue } : h)
        };
      }
      return kpi;
    }));
  };

  const persistUpdate = async (kpiId, additionalData, value) => {
    try {
      await supabase.from('kpi_updates').insert({
        kpi_id: kpiId,
        additional_data: additionalData,
        value: value,
        cargo: currentUser?.cargo || 'Sistema'
      });
    } catch (err) {
      console.error("Error persistiendo en Supabase:", err);
    }
  };

  const handleUpdateKPI = (kpiId, newData) => {
    // Validar permisos antes de actualizar
    const kpi = kpiData.find(k => k.id === kpiId);

    if (!kpi) {
      console.error('KPI no encontrado:', kpiId);
      return;
    }

    // Verificar que el usuario tiene permiso para actualizar este KPI
    if (kpi.responsable !== currentUser?.cargo) {
      console.error('Permiso denegado:', {
        kpi: kpi.name,
        responsable: kpi.responsable,
        usuario: currentUser?.cargo
      });
      alert(`No tienes permiso para actualizar este indicador.\n\nIndicador: ${kpi.name}\nResponsable: ${kpi.responsable}\nTu cargo: ${currentUser?.cargo}`);
      return;
    }

    // Si tiene permiso, proceder con la actualización
    applyKPIUpdate(kpiId, newData, true);
  };

  return (
    <BrowserRouter>
      <AppContent
        currentUser={currentUser}
        kpiData={kpiData}
        activeCompany={activeCompany}
        setActiveCompany={setActiveCompany}
        theme={theme}
        toggleTheme={toggleTheme}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        onUpdateKPI={handleUpdateKPI}
      />
    </BrowserRouter>
  );
}

export default App;
