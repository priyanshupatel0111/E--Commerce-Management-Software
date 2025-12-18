import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Truck, Receipt, FileText, Home, LogOut, Box } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ role }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'bg-indigo-800' : '';

    const getPanelName = (role) => {
        if (role === 'Admin') return 'Admin Panel';
        if (role === 'Employee') return 'Employee Panel';
        if (role === 'Watcher') return 'Watcher Panel';
        return 'Panel'; // Fallback
    };

    return (
        <div className="w-64 bg-indigo-900 text-white min-h-screen flex flex-col">
            <div className="p-6 text-2xl font-bold border-b border-indigo-800">{getPanelName(role)}</div>
            <div className="flex-1 py-4">
                {/* Dashboard: Everyone */}
                <Link to="/admin" className={`flex items-center gap-3 px-6 py-3 hover:bg-indigo-800 ${isActive('/admin')}`}>
                    <LayoutDashboard size={20} /> Dashboard
                </Link>

                {/* Inventory: Everyone */}
                <Link to="/admin/inventory" className={`flex items-center gap-3 px-6 py-3 hover:bg-indigo-800 ${isActive('/admin/inventory')}`}>
                    <Package size={20} /> Inventory
                </Link>

                {/* POS: Admin & Employee ONLY */}
                {(role === 'Admin' || role === 'Employee') && (
                    <Link to="/admin/pos" className={`flex items-center gap-3 px-6 py-3 hover:bg-indigo-800 ${isActive('/admin/pos')}`}>
                        <ShoppingCart size={20} /> New Sale (POS)
                    </Link>
                )}

                {(role === 'Admin' || role === 'Watcher' || role === 'Employee') && (
                    <Link to="/admin/sales" className={`flex items-center gap-3 px-6 py-3 hover:bg-indigo-800 ${isActive('/admin/sales')}`}>
                        <ShoppingCart size={20} /> Sales History
                    </Link>
                )}

                {/* Purchases: Everyone */}
                <Link to="/admin/purchases" className={`flex items-center gap-3 px-6 py-3 hover:bg-indigo-800 ${isActive('/admin/purchases')}`}>
                    <Truck size={20} /> Purchases
                </Link>

                {/* Reports: Admin & Watcher ONLY (Assuming ReportViewer is deprecated or same as Watcher) */}
                {(role === 'Admin' || role === 'Watcher' || role === 'ReportViewer') && (
                    <>
                        <Link to="/admin/revenue" className={`flex items-center gap-3 px-6 py-3 hover:bg-indigo-800 ${isActive('/admin/revenue')}`}>
                            <FileText size={20} /> Revenue Report
                        </Link>
                        <Link to="/admin/expenses" className={`flex items-center gap-3 px-6 py-3 hover:bg-indigo-800 ${isActive('/admin/expenses')}`}>
                            <FileText size={20} /> Expense Report
                        </Link>
                        <Link to="/admin/sold-items" className={`flex items-center gap-3 px-6 py-3 hover:bg-indigo-800 ${isActive('/admin/sold-items')}`}>
                            <FileText size={20} /> Sold Items Report
                        </Link>
                        <Link to="/admin/returns" className={`flex items-center gap-3 px-6 py-3 hover:bg-indigo-800 ${isActive('/admin/returns')}`}>
                            <Box size={20} /> Returns
                        </Link>
                    </>
                )}

                {/* Misc Expenses: Admin & Employee */}
                {(role === 'Admin' || role === 'Employee') && (
                    <Link to="/admin/misc-expenses" className={`flex items-center gap-3 px-6 py-3 hover:bg-indigo-800 ${isActive('/admin/misc-expenses')}`}>
                        <Receipt size={20} /> Misc. Expenses
                    </Link>
                )}

                {/* Logs: Admin & Watcher ONLY */}
                {(role === 'Admin' || role === 'Watcher') && (
                    <Link to="/admin/logs" className={`flex items-center gap-3 px-6 py-3 hover:bg-indigo-800 ${isActive('/admin/logs')}`}>
                        <Receipt size={20} /> Staff Logs
                    </Link>
                )}

                {/* Manage Sellers: Admin ONLY */}
                {role === 'Admin' && (
                    <Link to="/admin/sellers" className={`flex items-center gap-3 px-6 py-3 hover:bg-indigo-800 ${isActive('/admin/sellers')}`}>
                        <ShoppingCart size={20} /> Manage Sellers
                    </Link>
                )}
            </div>
            <div className="p-4 border-t border-indigo-800 space-y-2">
                <Link to="/" className="flex items-center gap-3 px-2 py-2 text-indigo-200 hover:text-white hover:bg-indigo-800 rounded transition">
                    <Home size={20} /> Back to Store
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-2 py-2 text-red-300 hover:text-red-100 hover:bg-red-900/30 rounded transition">
                    <LogOut size={20} /> Logout
                </button>
            </div>
            <div className="px-6 py-4 border-t border-indigo-800 text-sm text-indigo-300">
                Logged in as: <span className="text-white font-semibold">{role}</span>
            </div>
        </div>
    );
};

export default Sidebar;
