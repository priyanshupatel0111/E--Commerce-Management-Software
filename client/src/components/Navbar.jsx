import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart } from 'lucide-react';

const Navbar = ({ cartCount, toggleCart }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-indigo-600">ShopMaster</Link>
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-gray-600 hover:text-indigo-600">Store</Link>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to={user.role === 'ReportViewer' ? '/admin/reports' : '/admin'} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                                Dashboard
                            </Link>
                            <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-500 hover:text-red-500">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
