import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Box } from 'lucide-react';

const ReturnAnalysis = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    // State for order and loading
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    // Searchable Dropdown State
    const [allOrders, setAllOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [ordersError, setOrdersError] = useState(null);

    // Return Form State
    const [returnForm, setReturnForm] = useState({
        quantity: 1,
        reason: '',
        status: 'Refund',
        product_quality: 'Good'
    });

    // Fetch single order details
    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrder(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError(err.response?.data?.message || 'Failed to fetch order details');
                setLoading(false);
            }
        };

        if (orderId && token) {
            fetchOrder();
        } else {
            // If no orderId, ensure we are not loading an order
            setOrder(null);
        }
    }, [orderId, token]);

    // Fetch all orders for the search dropdown
    useEffect(() => {
        const fetchAllOrders = async () => {
            if (orderId) return;
            setLoadingOrders(true);
            setOrdersError(null);
            try {
                const response = await axios.get('http://localhost:5000/api/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAllOrders(response.data);
                setFilteredOrders(response.data);
                if (response.data.length === 0) {
                    console.log('Fetching orders returned 0 items');
                }
            } catch (err) {
                console.error('Error fetching all orders:', err);
                setOrdersError(err.response?.data?.message || err.message || 'Failed to load orders');
            } finally {
                setLoadingOrders(false);
            }
        };

        if (!orderId && token) {
            fetchAllOrders();
        }
    }, [orderId, token]);

    // Filter orders based on search query
    useEffect(() => {
        if (!searchQuery) {
            setFilteredOrders(allOrders);
        } else {
            const lowerQuery = searchQuery.toString().toLowerCase();
            const filtered = allOrders.filter(o =>
                o.id.toString().includes(lowerQuery) ||
                (o.Employee && o.Employee.username.toLowerCase().includes(lowerQuery))
            );
            setFilteredOrders(filtered);
        }
    }, [searchQuery, allOrders]);

    const handleSelectOrder = (id) => {
        setSearchQuery(id);
        setIsDropdownOpen(false);
        navigate(`/admin/return-analysis/${id}`);
    };

    const handleReturnClick = (item) => {
        setSelectedItem(item);
        setReturnForm({
            quantity: 1, // Default to 1
            reason: '',
            status: 'Refund',
            product_quality: 'Good'
        });
    };

    const handleSubmitReturn = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;

        try {
            await axios.post('http://localhost:5000/api/returns', {
                order_id: order.id,
                product_id: selectedItem.product_id,
                ...returnForm
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Return created successfully!');
            setSelectedItem(null); // Close modal
        } catch (err) {
            console.error('Error creating return:', err);
            alert('Failed to create return: ' + (err.response?.data?.message || err.message));
        }
    };

    // Case: Loading
    if (loading) return <div className="p-8 text-center">Loading order details...</div>;

    // Case: No Order ID provided (Initial Landing from Sidebar)
    if (!orderId) {
        return (
            <div className="p-6">
                <button
                    onClick={() => navigate('/admin/returns')}
                    className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Returns
                </button>

                <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-indigo-50 p-3 rounded-full">
                            <Box size={32} className="text-indigo-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Return Analysis</h1>
                    <p className="text-gray-500 mb-6">Search for an Order ID to fetch details and process returns.</p>

                    <div className="relative max-w-xs mx-auto text-left">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Order ID..."
                                className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                            />
                            {searchQuery && (
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilteredOrders(allOrders);
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {loadingOrders ? (
                                    <div className="p-3 text-center text-gray-500 text-sm">Loading orders...</div>
                                ) : ordersError ? (
                                    <div className="p-3 text-center text-red-500 text-sm">Error: {ordersError}</div>
                                ) : filteredOrders.length > 0 ? (
                                    filteredOrders.map(o => (
                                        <div
                                            key={o.id}
                                            className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                                            onClick={() => handleSelectOrder(o.id)}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-gray-900">Order #{o.id}</span>
                                                <span className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {o.Employee ? `By: ${o.Employee.username}` : 'No Employee'} • ${parseFloat(o.total_amount).toFixed(2)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-center text-gray-500 text-sm">
                                        No orders found {allOrders.length === 0 && "(List is empty)"}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Overlay to close dropdown when clicking outside */}
                    {isDropdownOpen && (
                        <div
                            className="fixed inset-0 z-0"
                            onClick={() => setIsDropdownOpen(false)}
                        ></div>
                    )}
                </div>
            </div>
        );
    }

    // Case: Error fetching order
    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-600 font-medium mb-4">Error: {error}</div>
                <button
                    onClick={() => navigate('/admin/return-analysis')}
                    className="text-indigo-600 hover:underline"
                >
                    Try Another Order ID
                </button>
            </div>
        );
    }

    // Case: Order not found
    if (!order) return <div className="p-8 text-center">Order not found</div>;

    // Case: Order Loaded Successfully
    return (
        <div className="p-6">
            <button
                onClick={() => navigate('/admin/return-analysis')}
                className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Search
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Order Analysis: #{order.id}</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                            {order.Employee && ` by ${order.Employee.username}`}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold text-indigo-600">Rs {parseFloat(order.total_amount).toFixed(2)}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-600">Product Items</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Price</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Qty Sold</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {order.OrderItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-indigo-50 p-2 rounded-lg">
                                                <Box size={20} className="text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.Product?.name || 'Unknown Product'}</p>
                                                <p className="text-xs text-gray-500">{item.Product?.product_code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">Rs {item.price_at_sale}</td>
                                    <td className="p-4 text-sm text-gray-600">{item.quantity}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleReturnClick(item)}
                                            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                        >
                                            Return Item
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Return Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Return Item: {selectedItem.Product?.name}</h2>

                        <form onSubmit={handleSubmitReturn} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Return</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedItem.quantity}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={returnForm.quantity}
                                    onChange={(e) => setReturnForm({ ...returnForm, quantity: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Max available: {selectedItem.quantity}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={returnForm.status}
                                    onChange={(e) => setReturnForm({ ...returnForm, status: e.target.value })}
                                >
                                    <option value="Refund">Refund</option>
                                    <option value="Replaced">Exchange (Replaced)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Quality</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    value={returnForm.product_quality}
                                    onChange={(e) => setReturnForm({ ...returnForm, product_quality: e.target.value })}
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
                                    value={returnForm.reason}
                                    onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                                    placeholder="Why is it being returned?"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setSelectedItem(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Confirm Return
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnAnalysis;
