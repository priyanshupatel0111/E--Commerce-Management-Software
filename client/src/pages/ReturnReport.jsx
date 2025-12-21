import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, RefreshCw, AlertCircle } from 'lucide-react'; // Changed Loader to RefreshCw

const ReturnReport = () => {
    const { token } = useAuth();
    const [analyses, setAnalyses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ sellerId: '', platform: '' });
    const [options, setOptions] = useState({ sellers: [], platforms: [] });

    // Fetch Filter Options (Sellers & Platforms)
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/reports/filters', {
                    headers: { Authorization: `Bearer ${storedToken}` }
                });
                setOptions(res.data);
            } catch (error) {
                console.error("Error fetching filters:", error);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const fetchAnalyses = async () => {
            try {
                console.log("Fetching analyses...");
                const storedToken = localStorage.getItem('token');
                if (!storedToken) console.warn("No token found in localStorage");

                const response = await axios.get('http://localhost:5000/api/return-analysis', {
                    headers: { Authorization: `Bearer ${storedToken}` }
                });
                console.log("Analyses response:", response.data);

                if (Array.isArray(response.data)) {
                    setAnalyses(response.data);
                } else {
                    console.error("API did not return an array:", response.data);
                    setAnalyses([]);
                    setError("Invalid data format received from server.");
                }
            } catch (err) {
                console.error("Error fetching analyses:", err);
                setError(`Failed to load return report: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyses();
    }, [token]);

    const formatCurrency = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-12">
                <RefreshCw className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full p-12 text-red-500 gap-2">
                <AlertCircle size={24} />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-xl">
                        <FileText className="text-green-600" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Return Analysis Report</h1>
                        <p className="text-gray-500">Overview of financial impact from returns</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                    <select
                        value={filters.sellerId}
                        onChange={(e) => setFilters(prev => ({ ...prev, sellerId: e.target.value }))}
                        className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="">All Sellers</option>
                        {Array.isArray(options.sellers) && options.sellers.map(s => (
                            <option key={s.seller_code} value={s.seller_code}>
                                {s.seller_name} ({s.seller_code})
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.platform}
                        onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
                        className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="">All Platforms</option>
                        {Array.isArray(options.platforms) && options.platforms.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Seller</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Platform</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Packaging</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Shipping</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Product</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Rep. Ship</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Total Loss</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Compensation</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Net Impact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Array.isArray(analyses) && analyses
                                .filter(item => {
                                    // Existing Logic: Exclude Pending Claims
                                    // We are likely filtering this at fetch time or rely on this client-side?
                                    // EDIT: Previous instruction filtered it at setAnalyses.
                                    // But since we want to filter DYNAMICALLY by Seller/Platform, let's just chain it.
                                    // Wait, if I filtered it at setAnalyses, then `analyses` ALREADY excludes pending.
                                    // So I only need to filter for Seller/Platform here.

                                    const matchSeller = !filters.sellerId || item.Return?.seller_id === filters.sellerId;
                                    const matchPlatform = !filters.platform || item.Return?.platform === filters.platform;
                                    return matchSeller && matchPlatform;
                                })
                                .map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-sm text-gray-600">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-indigo-600">#{item.order_id}</td>
                                        <td className="p-4 text-sm text-gray-600">{item.Return?.seller_id || '-'}</td>
                                        <td className="p-4 text-sm text-gray-600">{item.Return?.platform || '-'}</td>
                                        <td className="p-4 text-sm text-gray-600 text-right">{formatCurrency(item.packaging_loss)}</td>
                                        <td className="p-4 text-sm text-gray-600 text-right">{formatCurrency(item.shipping_loss)}</td>
                                        <td className="p-4 text-sm text-gray-600 text-right">{formatCurrency(item.product_loss)}</td>
                                        <td className="p-4 text-sm text-gray-600 text-right">{formatCurrency(item.replacement_shipping_loss)}</td>
                                        <td className="p-4 text-sm font-medium text-gray-800 text-right">{formatCurrency(item.total_loss)}</td>
                                        <td className="p-4 text-sm text-gray-600 text-right">
                                            {item.is_compensated ? (
                                                <div>
                                                    <span className="text-green-600 font-medium">
                                                        {formatCurrency(item.compensation_amount)}
                                                    </span>
                                                    <span className={`block text-[10px] uppercase font-bold tracking-wider ${item.claim_status === 'Approved' ? 'text-green-500' :
                                                        item.claim_status === 'Rejected' ? 'text-red-500' :
                                                            'text-yellow-500'
                                                        }`}>
                                                        {item.claim_status}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-right">
                                            {parseFloat(item.net_loss) < 0 ? (
                                                <span className="text-green-600">
                                                    +{formatCurrency(Math.abs(item.net_loss))}
                                                </span>
                                            ) : (
                                                <span className="text-red-600">
                                                    -{formatCurrency(item.net_loss)}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            {analyses.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="p-8 text-center text-gray-400">
                                        No return analysis reports found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReturnReport;
