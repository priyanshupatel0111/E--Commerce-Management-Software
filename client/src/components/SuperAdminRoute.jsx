import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SuperAdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-8 text-center">Loading authentication...</div>;

  if (!user || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/login" replace />;
  }
  
  if (user.requires_password_change) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

export default SuperAdminRoute;
