import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ChangePassword = () => {
    const { user, login } = useContext(AuthContext);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/change-password', 
                { newPassword }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Password changed successfully. We need to update user in memory/storage
            const updatedUser = { ...user, requires_password_change: false };
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Update local storage
            
            // Refresh the page or navigate based on role
            if (updatedUser.role === 'SUPER_ADMIN') {
                navigate('/super-admin');
            } else {
                navigate('/admin');
            }
            window.location.reload(); // Force full reload to update context if needed

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Please login first.</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative z-10 w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Change Password Required</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        For security reasons, you must change your one-time password before accessing the dashboard.
                    </p>
                </div>

                {error && <div className="bg-red-50 text-red-600 text-sm font-medium p-3 mb-4 rounded-lg border border-red-100">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all mt-4 disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Save Password & Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
