import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [phoneOtp, setPhoneOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [tenant, setTenant] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('tenantContext');
        if (stored) {
            setTenant(JSON.parse(stored));
        }
    }, []);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const payload = { username };
            if (tenant) {
                 payload.tenant_id = tenant.id;
            }
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password/request-otp', payload);
            setSuccess(res.data.message + ` (Email: ${res.data.email_masked}, Mobile: ${res.data.phone_masked})`);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (newPassword !== confirmPassword) {
             return setError('Passwords do not match');
        }
        setLoading(true);

        try {
            const payload = { 
                 username, 
                 email_otp: emailOtp, 
                 phone_otp: phoneOtp, 
                 newPassword 
            };
            if (tenant) {
                 payload.tenant_id = tenant.id;
            }
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password/verify-otp', payload);
            setSuccess(res.data.message);
            setTimeout(() => navigate('/'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify OTPs or reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white p-8 shadow-xl border border-gray-100 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">
                        Forgot Password
                    </h2>
                    <p className="text-sm text-gray-500 text-center mb-6">
                         {step === 1 ? 'Enter your username to receive OTPs.' : 'Enter both verification codes formatted.'}
                    </p>
                    
                    {error && <div className="bg-red-50 text-red-600 text-sm font-medium p-3 mb-4 rounded-lg border border-red-100">{error}</div>}
                    {success && <div className="bg-green-50 text-green-600 text-sm font-medium p-3 mb-4 rounded-lg border border-green-100">{success}</div>}
                    
                    {step === 1 ? (
                        <form onSubmit={handleRequestOtp} className="space-y-4">
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
                            <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all mt-4 disabled:opacity-50">
                                {loading ? 'Sending...' : 'Send OTPs'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email OTP</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    placeholder="6-digit code from your email"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={emailOtp}
                                    onChange={(e) => setEmailOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile OTP</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    placeholder="6-digit code from your SMS"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={phoneOtp}
                                    onChange={(e) => setPhoneOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all mt-4 disabled:opacity-50">
                                {loading ? 'Verifying...' : 'Verify and Reset Password'}
                            </button>
                        </form>
                    )}
                    
                    <div className="mt-6 text-center">
                        <Link to="/" className="text-sm text-gray-500 hover:text-gray-800 font-medium hover:underline block">Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
