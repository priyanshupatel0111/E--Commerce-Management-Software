import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search } from 'lucide-react';

const Gateway = () => {
  const [storeCode, setStoreCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If we already have a tenant context and it hasn't been purposefully cleared, go straight to login
    const existingTenant = localStorage.getItem('tenantContext');
    if (existingTenant) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeCode.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await axios.get(`http://localhost:5000/api/tenants/verify?code=${storeCode.trim()}`);
      localStorage.setItem('tenantContext', JSON.stringify(res.data));
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Store not found. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl opacity-50"></div>
      
      <div className="relative z-10 bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6 transform -rotate-6">
            <span className="text-3xl font-bold text-white tracking-tighter">E</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tenant Discovery</h1>
          <p className="text-gray-500 mt-2 text-sm">Enter your organizational store code to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <input
                type="text"
                autoFocus
                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${error ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'} rounded-xl text-lg font-medium tracking-widest uppercase transition-all outline-none placeholder:normal-case placeholder:tracking-normal placeholder:font-normal placeholder:text-gray-400`}
                placeholder="e.g., KITV428"
                value={storeCode}
                onChange={(e) => { setStoreCode(e.target.value.toUpperCase()); setError(''); }}
                disabled={loading}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            </div>
            {error && (
              <p className="mt-3 text-sm font-medium text-red-500 text-center animate-pulse">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!storeCode || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {loading ? 'Verifying...' : 'Access Store Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Gateway;
