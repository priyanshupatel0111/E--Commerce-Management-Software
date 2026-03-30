import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const SuperAdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        // Ensure no tenant context is lingering when superadmin tries to login
        localStorage.removeItem('tenantContext');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Double check tenant context is cleared
        localStorage.removeItem('tenantContext');
        
        const result = await login(username, password);
        if (result.success) {
            if (result.user.requires_password_change) {
                navigate('/change-password');
                return;
            }
            const userState = JSON.parse(localStorage.getItem('user'));
            if (userState && userState.role === 'SUPER_ADMIN') {
                navigate('/super-admin');
            } else {
                // Not a super admin. Don't let them stay without a tenant context.
                navigate('/');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] opacity-50"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[100px] opacity-50"></div>
            
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-zinc-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-zinc-700">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                            <Shield className="text-white w-8 h-8" />
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2 text-center text-white tracking-tight">
                        System Administration
                    </h2>
                    <p className="text-zinc-400 text-sm text-center mb-8">Secure access strictly for super administrators.</p>
                    
                    {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-medium p-3 mb-6 rounded-lg text-center backdrop-blur-md">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Admin ID</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder:text-zinc-600"
                                placeholder="Enter admin username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Master Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder:text-zinc-600"
                                placeholder="Enter master password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-orange-500/20 hover:from-red-500 hover:to-orange-500 transition-all mt-4 transform active:scale-[0.98]">
                            Authenticate
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-300 font-medium transition-colors">Return to Gateway</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
