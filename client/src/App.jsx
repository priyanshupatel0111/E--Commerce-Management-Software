import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Storefront from './pages/Storefront';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLayout from './components/AdminLayout';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import ActivityLogs from './pages/ActivityLogs';

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
            <Route index element={<div className="text-gray-500 text-xl">Select an option from the sidebar.</div>} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="pos" element={<POS />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="reports" element={<Reports />} />
            <Route path="logs" element={<ActivityLogs />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
