import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, kpiData, currentUser, onLogout }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header kpiData={kpiData} currentUser={currentUser} onLogout={onLogout} />
            <div className="flex">
                <Sidebar currentUser={currentUser} />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
