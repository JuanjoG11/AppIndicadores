import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import AreaDashboard from './pages/AreaDashboard';
import Login from './pages/Login';
import { mockKPIData } from './data/mockData';
import './index.css';
import './App.css';

const AppContent = ({ currentUser, kpiData, handleLogin, handleLogout, onUpdateKPI }) => {
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', background: 'var(--bg-app)', minHeight: '100vh', color: 'var(--text-main)' }}>
      <Sidebar currentUser={currentUser} onLogout={handleLogout} />
      <main style={{ marginLeft: '260px', flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar currentUser={currentUser} kpiData={kpiData} />
        <div className="app-container" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route
              path="/"
              element={
                currentUser.role === 'Gerente'
                  ? <ExecutiveDashboard kpiData={kpiData} />
                  : <Navigate to={`/area/${currentUser.area}`} />
              }
            />
            <Route
              path="/area/:areaId"
              element={<AreaDashboard kpiData={kpiData} currentUser={currentUser} onUpdateKPI={onUpdateKPI} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [kpiData, setKpiData] = useState(mockKPIData);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateKPI = (kpiId, newData) => {
    setKpiData(prevData => prevData.map(kpi => {
      if (kpi.id === kpiId) {
        // Combinar datos anteriores con los nuevos para el cálculo dinámico
        const updatedAdditionalData = {
          ...kpi.additionalData,
          ...newData
        };

        // Recalcular el KPI (lógica simplificada para el demo, idealmente usaríamos una función centralizada)
        let newValue = kpi.currentValue;
        let targetMeta = kpi.targetMeta;

        if (kpiId === 'pedidos-devueltos' && updatedAdditionalData.pedidosFacturados) {
          newValue = (updatedAdditionalData.pedidosDevueltos / updatedAdditionalData.pedidosFacturados) * 100;
        } else if (kpiId === 'promedio-pedidos-auxiliar' && updatedAdditionalData.auxiliares) {
          newValue = updatedAdditionalData.numeroPedidos / updatedAdditionalData.auxiliares;
        } else if (kpiId === 'promedio-pedidos-carro' && updatedAdditionalData.vehiculos) {
          newValue = updatedAdditionalData.numeroPedidos / updatedAdditionalData.vehiculos;
        } else if (kpiId === 'gasto-nomina-venta' && updatedAdditionalData.ventaTotal) {
          newValue = (updatedAdditionalData.nominaLogistica / updatedAdditionalData.ventaTotal) * 100;
        } else if (kpiId === 'gasto-fletes-venta' && updatedAdditionalData.ventaTotal) {
          newValue = (updatedAdditionalData.valorFletes / updatedAdditionalData.ventaTotal) * 100;
        } else if (kpiId === 'horas-extras-auxiliares' && updatedAdditionalData.auxiliares) {
          newValue = (updatedAdditionalData.totalHorasExtras / updatedAdditionalData.auxiliares) / 12;
        }

        // Seleccionar meta basada en brand
        if (typeof kpi.meta === 'object' && updatedAdditionalData.brand) {
          targetMeta = kpi.meta[updatedAdditionalData.brand];
        }

        newValue = parseFloat(newValue.toFixed(2));

        // Calcular semáforo
        let semaphore = kpi.semaphore;
        let compliance = kpi.compliance;

        if (typeof targetMeta === 'number') {
          const isInverse = kpiId.includes('devueltos') || kpiId.includes('gasto') || kpiId.includes('horas-extras');
          compliance = isInverse ? (targetMeta / newValue) * 100 : (newValue / targetMeta) * 100;
          compliance = Math.min(Math.round(compliance), 100);

          if (compliance >= 95) semaphore = 'green';
          else if (compliance >= 85) semaphore = 'yellow';
          else semaphore = 'red';
        }

        return {
          ...kpi,
          currentValue: newValue,
          targetMeta,
          compliance,
          semaphore,
          hasData: true,
          additionalData: updatedAdditionalData,
          // Actualizar último punto del historial
          history: kpi.history.map((h, i) => i === kpi.history.length - 1 ? { ...h, value: newValue } : h)
        };
      }
      return kpi;
    }));
  };

  return (
    <BrowserRouter>
      <AppContent
        currentUser={currentUser}
        kpiData={kpiData}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        onUpdateKPI={handleUpdateKPI}
      />
    </BrowserRouter>
  );
}

export default App;
