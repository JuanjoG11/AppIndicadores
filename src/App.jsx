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

const AppContent = ({ currentUser, kpiData, handleLogin, handleLogout }) => {
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
              element={<AreaDashboard kpiData={kpiData} currentUser={currentUser} />}
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
  const [kpiData] = useState(mockKPIData);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      <AppContent
        currentUser={currentUser}
        kpiData={kpiData}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </BrowserRouter>
  );
}

export default App;
