import { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar role={user.role} />
            <div className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
