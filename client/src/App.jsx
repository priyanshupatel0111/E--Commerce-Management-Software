import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Storefront from './pages/Storefront';
import Login from './pages/Login';
import Signup from './pages/Signup';
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
import ManageSellers from './pages/ManageSellers'; // Added // Added
import SoldItemsReport from './pages/SoldItemsReport'; // Added
import MiscellaneousExpenses from './pages/MiscellaneousExpenses'; // Added


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Storefront />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="sellers" element={<ManageSellers />} /> {/* Added */}
            <Route path="inventory" element={<Inventory />} />
            <Route path="pos" element={<POS />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="sales" element={<SalesHistory />} /> {/* Added */}
            <Route path="sales" element={<SalesHistory />} /> {/* Added */}
            <Route path="sales" element={<SalesHistory />} /> {/* Added */}
            <Route path="sold-items" element={<SoldItemsReport />} /> {/* Added */}
            <Route path="misc-expenses" element={<MiscellaneousExpenses />} /> {/* Added */}
            <Route path="revenue" element={<RevenueReport />} />
            <Route path="expenses" element={<ExpenseReport />} />
            <Route path="logs" element={<ActivityLogs />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
