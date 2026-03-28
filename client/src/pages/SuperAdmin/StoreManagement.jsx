import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Info, Power, Globe, Key, Copy, CheckCircle } from 'lucide-react';

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', domain: '', tenant_code: '', subscription_status: 'active' });

  // Admin Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedAdminStore, setSelectedAdminStore] = useState(null);
  const [adminUsername, setAdminUsername] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const fetchStores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/superadmin/stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStores(res.data);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      // Fallback or error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const openModal = (store = null) => {
    if (store) {
      setEditingStore(store);
      setFormData({ name: store.name, domain: store.domain || '', tenant_code: store.tenant_code || '', subscription_status: store.subscription_status });
    } else {
      setEditingStore(null);
      setFormData({ name: '', domain: '', tenant_code: '', subscription_status: 'active' });
    }
    setShowModal(true);
  };

  const openAdminModal = (store) => {
    setSelectedAdminStore(store);
    setAdminUsername('');
    setGeneratedOtp('');
    setShowAdminModal(true);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/superadmin/stores/${selectedAdminStore.id}/admin`, 
        { username: adminUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGeneratedOtp(res.data.otp);
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating admin.');
    }
  };

  const handleResetPassword = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/superadmin/stores/${selectedAdminStore.id}/admin/reset-password`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGeneratedOtp(res.data.otp);
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || 'Error resetting password.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedOtp);
    alert('OTP copied to clipboard!');
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingStore) {
        await axios.put(`http://localhost:5000/api/superadmin/stores/${editingStore.id}`, formData, { headers });
      } else {
        await axios.post('http://localhost:5000/api/superadmin/stores', formData, { headers });
      }
      
      setShowModal(false);
      fetchStores();
    } catch (err) {
      console.error('Failed to save store:', err);
      alert('Error saving store.');
    }
  };

  const toggleStatus = async (store) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = store.subscription_status === 'active' ? 'suspended' : 'active';
      await axios.put(`http://localhost:5000/api/superadmin/stores/${store.id}`, 
        { subscription_status: newStatus }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStores();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleImpersonate = async (store) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/superadmin/impersonate', { storeId: store.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('adminToken', token); 
      localStorage.setItem('token', res.data.token); 
      localStorage.setItem('user', JSON.stringify(res.data.user)); 
      
      window.location.href = '/admin';
    } catch (err) {
      console.error('Failed to impersonate', err);
      alert('Failed to login as Store Admin. Ensure this store has a TENANT_ADMIN assigned.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading stores...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Store Registry</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all tenant stores across the platform.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm"
        >
          <Plus size={18} />
          <span>New Store</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Store & Code Details</th>
              <th className="px-6 py-4">Domain/CName</th>
              <th className="px-6 py-4">Owner Email</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stores.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No stores found.</td></tr>
            ) : stores.map(store => (
              <tr key={store.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 cursor-default">
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{store.name}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5 border border-gray-200 inline-block px-2 py-0.5 rounded-md bg-gray-50">{store.tenant_code || 'NO CODE'}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Globe size={14} className="text-gray-400"/>
                    {store.domain || <span className="text-gray-300 italic">None</span>}
                  </div>
                </td>
                <td className="px-6 py-4">{store.owner_email}</td>
                <td className="px-6 py-4">{new Date(store.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    store.subscription_status === 'active' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {store.subscription_status.charAt(0).toUpperCase() + store.subscription_status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openAdminModal(store)}
                      className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Manage Store Admin"
                    >
                      <Key size={16} />
                    </button>
                    <button 
                      onClick={() => handleImpersonate(store)}
                      className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Login as Store Admin"
                    >
                      <Power size={16} className="rotate-180" /> 
                    </button>
                    <button 
                      onClick={() => openModal(store)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Store"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => toggleStatus(store)}
                      className={`p-2 rounded-lg transition-colors ${
                        store.subscription_status === 'active' 
                          ? 'text-red-400 hover:text-red-600 hover:bg-red-50'
                          : 'text-green-500 hover:text-green-700 hover:bg-green-50'
                      }`}
                      title={store.subscription_status === 'active' ? "Suspend Store" : "Activate Store"}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              {editingStore ? 'Edit Store' : 'Create New Store'}
            </h2>
            <form onSubmit={handleSaveStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Domain</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={formData.domain}
                  onChange={(e) => setFormData({...formData, domain: e.target.value})}
                  placeholder="e.g. shop.acme.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Code (Gateway Entry)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase"
                  value={formData.tenant_code}
                  onChange={(e) => setFormData({...formData, tenant_code: e.target.value})}
                  placeholder="e.g. KITV428"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                  value={formData.subscription_status}
                  onChange={(e) => setFormData({...formData, subscription_status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Save Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Management Modal */}
      {showAdminModal && selectedAdminStore && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Management</h2>
            <p className="text-sm text-gray-500 mb-5">Manage the primary owner account for <strong className="text-gray-900">{selectedAdminStore.name}</strong></p>
            
            {!generatedOtp ? (
              selectedAdminStore.owner_email === 'No Owner Assigned' ? (
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Admin Username</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="e.g. store_owner"
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setShowAdminModal(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Create Admin</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Current Admin Username:</p>
                    <p className="text-lg font-bold text-gray-900">{selectedAdminStore.owner_email}</p>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setShowAdminModal(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
                    <button onClick={handleResetPassword} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium tracking-wide">Reset Password (OTP)</button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={28} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Credentials Generated!</h3>
                <p className="text-sm text-gray-600 mb-4 px-2 tracking-wide leading-relaxed">
                  The user must use this one-time password to login. They will be forced to change it immediately.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-inner">
                  <span className="font-mono text-2xl font-bold tracking-[0.2em] text-indigo-700">{generatedOtp}</span>
                  <button onClick={copyToClipboard} className="text-gray-400 hover:text-indigo-600 transition-colors bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                    <Copy size={20} />
                  </button>
                </div>
                <button onClick={() => setShowAdminModal(false)} className="mt-4 w-full px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 shadow-md">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;
