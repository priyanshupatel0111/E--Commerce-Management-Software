import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const tenantContext = JSON.parse(localStorage.getItem('tenantContext') || '{}');
            const res = await axios.post('http://localhost:5000/api/auth/login', { 
                username, 
                password,
                tenant_id: tenantContext.id 
            });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            localStorage.setItem('token', res.data.accessToken);
            return { success: true, user: res.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
