import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Users, Shield, LogOut } from 'lucide-react';

const SuperAdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/super-admin' },
    { name: 'Stores', icon: <Store size={20} />, path: '/super-admin/stores' },
    { name: 'Users', icon: <Users size={20} />, path: '/super-admin/users' },
    { name: 'Global Roles', icon: <Shield size={20} />, path: '/super-admin/roles' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            SuperAdmin
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/super-admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Banner for Impersonation (if active) */}
        {localStorage.getItem('adminToken') && (
          <div className="bg-red-500 text-white px-6 py-2 flex justify-between items-center shadow-md z-50">
            <span className="font-semibold text-sm">⚠️ You are currently impersonating a Store Admin.</span>
            <button 
              onClick={() => {
                localStorage.setItem('token', localStorage.getItem('adminToken'));
                localStorage.removeItem('adminToken');
                window.location.href = '/super-admin';
              }}
              className="bg-white text-red-600 px-3 py-1 rounded-md text-xs font-bold hover:bg-red-50 transition"
            >
              Return to Super Admin
            </button>
          </div>
        )}
        
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shadow-sm shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Platform Management</h2>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
