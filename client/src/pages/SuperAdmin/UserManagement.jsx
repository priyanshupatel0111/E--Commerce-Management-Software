import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCog, Shield } from 'lucide-react';

const UserManagement = () => {
  const [targetType, setTargetType] = useState('platform'); // 'platform' | 'tenant'
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetchRolesAndStores();
  }, []);

  // Fetch users when target type or selected store changes
  useEffect(() => {
    fetchUsers();
  }, [targetType, selectedStore]);

  const fetchRolesAndStores = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const rolesRes = await axios.get('http://localhost:5000/api/superadmin/roles', { headers });
      setRoles(rolesRes.data.roles);

      const storesRes = await axios.get('http://localhost:5000/api/superadmin/stores', { headers });
      setStores(storesRes.data);
      if (storesRes.data.length > 0) {
        setSelectedStore(storesRes.data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to fetch roles/stores:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      let url = 'http://localhost:5000/api/superadmin/users'; // platform staff
      if (targetType === 'tenant') {
        if (!selectedStore) {
          setUsers([]);
          setLoading(false);
          return;
        }
        url = `http://localhost:5000/api/superadmin/stores/${selectedStore}/users`;
      }

      const res = await axios.get(url, { headers });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRoleId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/superadmin/users/${userId}/role`, 
        { role_id: newRoleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optimistically update
      setUsers(users.map(u => u.id === userId ? { ...u, role_id: parseInt(newRoleId), Role: roles.find(r => r.id === parseInt(newRoleId)) } : u));
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Failed to update user role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Audit and map roles for platform staff or specific tenant users.</p>
        </div>
        
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setTargetType('platform')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${targetType === 'platform' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Platform Staff
          </button>
          <button 
            onClick={() => setTargetType('tenant')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${targetType === 'tenant' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Tenant Users
          </button>
        </div>
      </div>

      {targetType === 'tenant' && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Select Store:</label>
          <select 
            className="flex-1 max-w-sm px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
          >
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name} - {store.domain || 'No Domain'}</option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4">Modify Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No users found.</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <UserCog size={16} />
                    </div>
                    {user.username}
                  </td>
                  <td className="px-6 py-4">
                    {user.last_login_time ? new Date(user.last_login_time).toLocaleString() : 'Never logged in'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-indigo-50 text-indigo-700 border-indigo-200">
                      {user.Role ? user.Role.role_name : 'No Role'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="w-full px-3 py-1.5 min-w-[150px] text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                      value={user.role_id || ''}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    >
                      <option value="" disabled>Assign Role...</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.role_name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
