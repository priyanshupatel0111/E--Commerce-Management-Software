import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [tenant, setTenant] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('tenantContext');
        if (stored) {
            setTenant(JSON.parse(stored));
        }
    }, []);

    const handleChangeStore = () => {
        localStorage.removeItem('tenantContext');
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(username, password);
        if (result.success) {
            const userState = JSON.parse(localStorage.getItem('user'));
            if (userState && userState.role === 'SUPER_ADMIN') {
                navigate('/super-admin');
            } else {
                navigate('/admin');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative z-10 w-full max-w-md">
                {tenant && (
                    <div className="bg-white px-6 py-4 rounded-t-2xl shadow-sm border border-b-0 border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold rounded-xl flex items-center justify-center shadow-inner">
                                {tenant.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-gray-900 font-bold leading-tight">{tenant.name}</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{tenant.tenant_code}</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleChangeStore}
                            className="text-xs text-blue-600 hover:text-blue-800 font-bold px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        >
                            Change Store
                        </button>
                    </div>
                )}
                
                <div className={`bg-white p-8 shadow-xl border border-gray-100 ${tenant ? 'rounded-b-2xl' : 'rounded-2xl'}`}>
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
                        {tenant ? 'Sign in to your account' : 'Platform Login'}
                    </h2>
                    {error && <div className="bg-red-50 text-red-600 text-sm font-medium p-3 mb-4 rounded-lg border border-red-100">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all mt-4">
                            Login
                        </button>
                    </form>
                    <div className="mt-6 text-center space-y-2">
                        <Link to="/signup" className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline block">Register as Admin</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
