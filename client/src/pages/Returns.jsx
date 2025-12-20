import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, X, Check, XCircle, Search } from 'lucide-react';

const Returns = () => {
    const [returns, setReturns] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { token } = useAuth();
    const navigate = useNavigate();

    // New Return Form State
    const [newReturn, setNewReturn] = useState({
        order_id: '',
        product_id: '',
        quantity: 1,
        reason: '',
        status: 'Refund',
        product_quality: 'Good'
    });

    const fetchReturns = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/returns', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReturns(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching returns:', error);
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    useEffect(() => {
        fetchReturns();
        fetchProducts();
    }, [token]);

    const handleCreateReturn = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/returns', newReturn, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            fetchReturns();
            setNewReturn({
                order_id: '', // Reset
                product_id: '',
                quantity: 1,
                reason: '',
                status: 'Refund',
                product_quality: 'Good'
            });
            alert('Return processed successfully');
        } catch (error) {
            console.error('Error creating return:', error);
            alert('Failed to create return: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Returns Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    New Return
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Order ID</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Product</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Reason</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Qty</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Product Quality</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {returns.map((ret) => (
                                <tr key={ret.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm text-gray-600">
                                        {new Date(ret.return_date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-sm font-medium text-gray-900">#{ret.order_id}</td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {ret.Product?.name}
                                        <span className="text-xs text-gray-400 block">{ret.Product?.product_code}</span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{ret.reason}</td>
                                    <td className="p-4 text-sm text-gray-600">{ret.quantity}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${ret.status === 'Refund' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {ret.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{ret.product_quality}</td>
                                </tr>
                            ))}
                            {returns.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">
                                        No returns found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Return Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Process New Return</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateReturn} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={newReturn.order_id}
                                    onChange={(e) => setNewReturn({ ...newReturn, order_id: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                                <select
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={newReturn.product_id}
                                    onChange={(e) => setNewReturn({ ...newReturn, product_id: e.target.value })}
                                >
                                    <option value="">Select Product</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.product_code})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        value={newReturn.quantity}
                                        onChange={(e) => setNewReturn({ ...newReturn, quantity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        value={newReturn.status}
                                        onChange={(e) => setNewReturn({ ...newReturn, status: e.target.value })}
                                    >
                                        <option value="Refund">Refund</option>
                                        <option value="Replaced">Replaced</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Quality</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={newReturn.product_quality}
                                    onChange={(e) => setNewReturn({ ...newReturn, product_quality: e.target.value })}
                                >
                                    <option value="Good">Good</option>
                                    <option value="Damaged">Damaged</option>
                                    <option value="Not send Product">Not send Product</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={newReturn.reason}
                                    onChange={(e) => setNewReturn({ ...newReturn, reason: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Create Return
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Returns;
