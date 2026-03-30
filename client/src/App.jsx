import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Gateway from './pages/Gateway';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import Signup from './pages/Signup';
import SuperAdminLogin from './pages/SuperAdminLogin';
import AdminLayout from './components/AdminLayout';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Purchases from './pages/Purchases';
import RevenueReport from './pages/RevenueReport';
import ExpenseReport from './pages/ExpenseReport';
import ActivityLogs from './pages/ActivityLogs';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import SalesHistory from './pages/SalesHistory';
import ManageSellers from './pages/ManageSellers'; 
import SoldItemsReport from './pages/SoldItemsReport'; 
import MiscellaneousExpenses from './pages/MiscellaneousExpenses'; 
import Returns from './pages/Returns'; 

import ErrorBoundary from './components/ErrorBoundary'; 


import SuperAdminRoute from './components/SuperAdminRoute';
import SuperAdminLayout from './pages/SuperAdmin/SuperAdminLayout';
import StoreManagement from './pages/SuperAdmin/StoreManagement';
import SuperAdminUserManagement from './pages/SuperAdmin/UserManagement';
import GlobalRoles from './pages/SuperAdmin/GlobalRoles';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Gateway />} />
          <Route path="/login" element={<Login />} />
          <Route path="/super-admin-login" element={<SuperAdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/signup" element={<Signup />} />

          {/* Super Admin Routes */}
          <Route path="/super-admin" element={
            <SuperAdminRoute>
              <SuperAdminLayout />
            </SuperAdminRoute>
          }>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="stores" element={<StoreManagement />} />
            <Route path="users" element={<SuperAdminUserManagement />} />
            <Route path="roles" element={<GlobalRoles />} />
          </Route>

          {/* Protected Tenant Admin Routes */}
          <Route path="/admin" element={
            <ErrorBoundary>
              <AdminLayout />
            </ErrorBoundary>
          }>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="sellers" element={<ManageSellers />} /> 
            <Route path="inventory" element={<Inventory />} />
            <Route path="pos" element={<POS />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="sales" element={<SalesHistory />} /> 
            <Route path="sold-items" element={<SoldItemsReport />} /> 
            <Route path="misc-expenses" element={<MiscellaneousExpenses />} /> 
            <Route path="revenue" element={<RevenueReport />} />
            <Route path="expenses" element={<ExpenseReport />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route path="returns" element={<Returns />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
