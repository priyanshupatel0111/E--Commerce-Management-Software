import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Users, Clock, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const [lastLogin, setLastLogin] = useState(null);

    useEffect(() => {
        // Fetch last login or user data. 
        // Ideally we would fetch logs, but we can also just fetch users and sort by last_login_time if that field is populated.
        // Or fetch latest 'LOGIN' activity log. Let's try fetching latest log for now.
        fetchLastLogin();
    }, []);

    const fetchLastLogin = async () => {
        try {
            const token = localStorage.getItem('token');
            // Assuming we have logs endpoint, we can use that. Or create a specific endpoint. 
            // For now let's just use the logs endpoint we saw in ActivityLogs.jsx which returns all logs.
            // In a real app we'd want ?limit=1. But let's fetch all and slice.
            const res = await axios.get('http://localhost:5000/api/admin/logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const logs = res.data;
            const loginLogs = logs.filter(l => l.action_type === 'LOGIN' && l.User?.Role?.role_name === 'Employee');
            if (loginLogs.length > 0) {
                setLastLogin(loginLogs[0]); // logs are usually sorted DESC
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <AuthContext.Consumer>
                {({ user }) => (
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">
                            {user?.role === 'Admin' ? 'Admin Dashboard' :
                                user?.role === 'Employee' ? 'Employee Dashboard' :
                                    user?.role === 'Watcher' ? 'Watcher Dashboard' : 'Dashboard'}
                        </h1>
                    </div>
                )}
            </AuthContext.Consumer>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Last Employee Login Card - Visibile to Admin Only */}
                <AuthContext.Consumer>
                    {({ user }) => (
                        user?.role === 'Admin' && (
                            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Last Employee Login</p>
                                        <h3 className="text-xl font-bold text-gray-800 mt-1">
                                            {lastLogin ? lastLogin.User?.username : 'No recent logins'}
                                        </h3>
                                    </div>
                                    <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                                        <Clock size={24} />
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 mb-4">
                                    {lastLogin ? new Date(lastLogin.timestamp).toLocaleString() : '-'}
                                </div>
                                <div className="border-t pt-4">
                                    <Link to="/admin/users" className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                                        <Users size={16} className="mr-2" /> Manage Employees & Watchers
                                    </Link>
                                </div>
                            </div>
                        )
                    )}
                </AuthContext.Consumer>

                {/* Quick Stats or other widgets could go here */}
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">System Status</p>
                            <h3 className="text-xl font-bold text-gray-800 mt-1">Active</h3>
                        </div>
                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                            <ShieldCheck size={24} />
                        </div>
                    </div>
                    <div className="mt-8 text-sm text-gray-500">
                        All systems operational.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
