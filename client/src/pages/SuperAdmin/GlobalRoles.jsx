import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield } from 'lucide-react';

const GlobalRoles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermIds, setRolePermIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/superadmin/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(res.data.roles);
      setPermissions(res.data.permissions);
      if (res.data.roles.length > 0) {
        handleSelectRole(res.data.roles[0]);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    const pIds = role.Permissions ? role.Permissions.map(p => p.id) : [];
    setRolePermIds(new Set(pIds));
  };

  const togglePermission = (permId) => {
    const nextSet = new Set(rolePermIds);
    if (nextSet.has(permId)) {
      nextSet.delete(permId);
    } else {
      nextSet.add(permId);
    }
    setRolePermIds(nextSet);
  };

  const savePermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/superadmin/roles/${selectedRole.id}/permissions`, 
        { permissionIds: Array.from(rolePermIds) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local roles state optimistically
      setRoles(roles.map(r => {
        if (r.id === selectedRole.id) {
          const updatedPerms = permissions.filter(p => rolePermIds.has(p.id));
          return { ...r, Permissions: updatedPerms };
        }
        return r;
      }));
      
      alert('Permissions saved successfully!');
    } catch (err) {
      console.error('Save role permissions error:', err);
      alert('Failed to save permissions');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading RBAC config...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <Shield className="text-blue-500" size={28} />
          Global Role Access Control
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Configure permissions for global roles. Changes made here apply instantly to all stores.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Roles Sidebar */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Available Roles</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium ${
                  selectedRole?.id === role.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-100'
                }`}
              >
                {role.role_name}
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Editor */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
          {selectedRole ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">
                  Editing: <span className="text-blue-600">{selectedRole.role_name}</span>
                </h3>
                <button 
                  onClick={savePermissions}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.map(perm => {
                    const isChecked = rolePermIds.has(perm.id);
                    return (
                      <label 
                        key={perm.id} 
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isChecked ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.id)}
                        />
                        <div>
                          <p className={`font-semibold ${isChecked ? 'text-blue-900' : 'text-gray-800'}`}>
                            {perm.action}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {perm.description || 'Allows standard access privileges.'}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Shield size={48} className="mb-4 opacity-50" />
              <p>Select a role to edit its permissions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalRoles;
