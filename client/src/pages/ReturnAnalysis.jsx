import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Box, Calculator, Save, AlertCircle, RefreshCw, Search } from 'lucide-react';

const ReturnAnalysis = () => {
    const { token } = useAuth();

    // Data State
    const [returns, setReturns] = useState([]); // List of returns to populate dropdown
    const [selectedReturn, setSelectedReturn] = useState(null); // The selected return object
    const [orderDetails, setOrderDetails] = useState(null); // Fetched order details for filling Platform/Product

    // Search Filter State
    const [searchTerm, setSearchTerm] = useState('');

    // Form State - Initialize with empty strings for better input handling
    const [formData, setFormData] = useState({
        order_id: '',
        packaging_loss: '',
        shipping_loss: '',
        product_loss: '',
        replacement_shipping_loss: '',
        is_compensated: false,
        compensation_amount: '',
        claim_status: 'Pending'
    });

    // Calculated State
    const [calculations, setCalculations] = useState({
        total_loss: 0,
        net_loss: 0
    });

    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'
    const [pendingClaims, setPendingClaims] = useState([]);

    const fetchPendingClaims = async () => {
        try {
            const storedToken = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/return-analysis', {
                headers: { Authorization: `Bearer ${storedToken}` }
            });
            const pending = response.data.filter(item => item.is_compensated && item.claim_status === 'Pending');
            setPendingClaims(pending);
        } catch (err) {
            console.error("Error fetching pending claims:", err);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const storedToken = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/return-analysis/${id}/status`,
                { claim_status: newStatus },
                { headers: { Authorization: `Bearer ${storedToken}` } }
            );
            // Refresh list
            fetchPendingClaims();
            alert(`Claim ${newStatus} successfully`);
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status");
        }
    };

    // 1. Fetch Returns for Dropdown
    useEffect(() => {
        const fetchReturns = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/returns', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReturns(response.data);
            } catch (err) {
                console.error("Error fetching returns:", err);
            }
        };
        fetchReturns();
    }, [token]);


    // 2. Handle Dropdown Selection
    const handleReturnSelect = async (e) => {
        const orderId = e.target.value;
        if (!orderId) {
            setSelectedReturn(null);
            setOrderDetails(null);
            setFormData(prev => ({ ...prev, order_id: '' }));
            return;
        }

        const ret = returns.find(r => r.order_id.toString() === orderId.toString());
        setSelectedReturn(ret);

        // Reset form but keep order_id
        setFormData({
            order_id: orderId,
            packaging_loss: '',
            shipping_loss: '',
            product_loss: '',
            replacement_shipping_loss: '',
            is_compensated: false,
            compensation_amount: '',
            claim_status: 'Pending'
        });

        if (ret) {
            try {
                const orderRes = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrderDetails(orderRes.data);
            } catch (err) {
                console.error("Error fetching order details:", err);
            }
        }
    };

    // Filtered returns for search
    const filteredReturns = returns.filter(r =>
        r.order_id.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 3. Conditional Logic Helpers
    const condition = selectedReturn?.product_quality; // 'Good', 'Damaged', 'Not send Product'
    const status = selectedReturn?.status; // 'Refund', 'Replaced'

    // UI Label Map
    const conditionLabel = condition === 'Not send Product' ? 'Wrong Product Received / Fraud' : condition;

    // Logic Flags
    const isScenario1_2 = condition === 'Good' && (status === 'Refund' || status === 'Replaced');
    const isScenario3 = condition === 'Damaged' && status === 'Refund';
    const isScenario4 = condition === 'Damaged' && status === 'Replaced';
    const isScenario5 = condition === 'Not send Product' && status === 'Refund';
    const isScenario6 = condition === 'Not send Product' && status === 'Replaced';

    const showPackagingLoss = true;
    const showShippingLoss = true;

    // Product Loss: Scenarios 3, 4, 5, 6
    const showProductLoss = isScenario3 || isScenario4 || isScenario5 || isScenario6;

    // Replacement Shipping: Scenarios 4, 6
    const showReplacementShipping = isScenario4 || isScenario6;

    // Compensation/Claim: Scenarios 3, 4, 5, 6
    const showCompensation = isScenario3 || isScenario4 || isScenario5 || isScenario6;

    // Claim Status Dropdown: Scenarios 5, 6
    const showClaimStatus = isScenario5 || isScenario6;

    // Auto-fill Product Loss for Scenarios 5 & 6
    useEffect(() => {
        if ((isScenario5 || isScenario6) && orderDetails && selectedReturn) {
            // Find the item in order details to get the price
            const item = orderDetails.OrderItems?.find(i => i.product_id === selectedReturn.product_id);
            if (item && !formData.product_loss) {
                setFormData(prev => ({ ...prev, product_loss: item.price_at_sale }));
            }
        }
    }, [isScenario5, isScenario6, orderDetails, selectedReturn]); // removed formData.product_loss to avoid infinite re-render if user clears it


    // 4. Calculations
    useEffect(() => {
        const pack = parseFloat(formData.packaging_loss) || 0;
        const ship = parseFloat(formData.shipping_loss) || 0;
        const prod = parseFloat(formData.product_loss) || 0;
        const repShip = parseFloat(formData.replacement_shipping_loss) || 0;
        const comp = formData.is_compensated ? (parseFloat(formData.compensation_amount) || 0) : 0;

        let total = 0;

        // Formula Logic
        if (isScenario1_2) {
            total = pack + ship;
        } else if (isScenario3 || isScenario5) {
            // S3: Damaged/Refund -> Pack + Ship + Prod
            // S5: Wrong/Refund -> Pack + Ship + Prod
            total = pack + ship + prod;
        } else if (isScenario4 || isScenario6) {
            // S4: Damaged/Replaced -> Pack + Ship + Prod + RepShip
            // S6: Wrong/Replaced -> Pack + Ship + Prod + RepShip
            total = pack + ship + prod + repShip;
        } else {
            // Fallback
            total = pack + ship + prod + repShip;
        }

        const net = total - comp;

        setCalculations({ total_loss: total, net_loss: net });

    }, [formData, isScenario1_2, isScenario3, isScenario4, isScenario5, isScenario6]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // If status is changed to Rejected, set compensation amount to 0
            if (name === 'claim_status' && value === 'Rejected') {
                newData.compensation_amount = '0';
            }

            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Claim Amount <= Total Loss -> REMOVED per user request
        const claim = parseFloat(formData.compensation_amount) || 0;
        // if (formData.is_compensated && claim > calculations.total_loss) {
        //     alert(`Validation Error: Claim Amount (${claim}) cannot exceed Total Loss (${calculations.total_loss.toFixed(2)}).`);
        //     return;
        // }

        setLoading(true);
        try {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                throw new Error('No authentication token found. Please login again.');
            }

            const payload = {
                ...formData,
                packaging_loss: parseFloat(formData.packaging_loss) || 0,
                shipping_loss: parseFloat(formData.shipping_loss) || 0,
                product_loss: parseFloat(formData.product_loss) || 0,
                replacement_shipping_loss: parseFloat(formData.replacement_shipping_loss) || 0,
                compensation_amount: parseFloat(formData.compensation_amount) || 0,
                total_loss: calculations.total_loss,
                net_loss: calculations.net_loss
            };
            await axios.post('http://localhost:5000/api/return-analysis', payload, {
                headers: { Authorization: `Bearer ${storedToken}` }
            });
            setSubmitStatus('success');
            alert('Analysis Submitted Successfully');

            // Reset
            setFormData({
                order_id: '',
                packaging_loss: '',
                shipping_loss: '',
                product_loss: '',
                replacement_shipping_loss: '',
                is_compensated: false,
                compensation_amount: '',
                claim_status: 'Pending'
            });
            setSearchTerm('');
            setSelectedReturn(null);
            setOrderDetails(null);
        } catch (err) {
            console.error("Submit Error:", err);
            setSubmitStatus('error');
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown error';
            alert(`Failed to submit analysis: ${errorMsg}`);
        } finally {
            setLoading(false);
            fetchPendingClaims(); // Refresh pending list after submit
        }
    };

    useEffect(() => {
        fetchPendingClaims();
    }, []);

    const platformName = selectedReturn?.platform || orderDetails?.platform || orderDetails?.source || 'Unknown Platform';
    const productName = selectedReturn?.Product?.name || 'Unknown Product';
    const sellerId = selectedReturn?.seller_id || 'N/A';


    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-100 p-3 rounded-xl">
                    <Calculator className="text-indigo-600" size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Return Analysis</h1>
                    <p className="text-gray-500">Calculate losses and track return financial impact</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-gray-700 mb-4">1. Select Return Order</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-4">
                            {/* Search Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Filter by Order ID</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Search size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        className="w-full pl-9 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder="Search Order ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Standard Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Order</label>
                                <select
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-gray-700"
                                    onChange={handleReturnSelect}
                                    value={formData.order_id}
                                >
                                    <option value="">-- Select Order --</option>
                                    {[...new Set(filteredReturns.map(r => r.order_id))].map(id => (
                                        <option key={id} value={id}>Order #{id}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">Showing {filteredReturns.length} matching orders</p>
                            </div>
                        </div>

                        {selectedReturn && (
                            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Product</span>
                                        <p className="font-medium text-gray-900 truncate">{productName}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Platform</span>
                                        <p className="font-medium text-gray-900">{platformName}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Seller ID</span>
                                        <p className="font-medium text-gray-900">{sellerId}</p>
                                    </div>
                                    <div className="col-span-2 flex gap-4 mt-2 pt-2 border-t border-indigo-100">
                                        <div>
                                            <span className="text-xs text-gray-500">Condition:</span>
                                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${condition === 'Good' ? 'bg-green-100 text-green-700' :
                                                condition === 'Damaged' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {conditionLabel}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500">Status:</span>
                                            <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                                {status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {selectedReturn && (
                    <form onSubmit={handleSubmit} className="p-6">
                        <h2 className="font-semibold text-gray-700 mb-4">2. Loss Analysis</h2>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* P1: Packaging */}
                            {showPackagingLoss && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loss on Packaging Material</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-0">Rs</span>
                                        <input
                                            type="number"
                                            name="packaging_loss"
                                            value={formData.packaging_loss}
                                            onChange={handleInputChange}
                                            className="w-full pl-8 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none relative z-10 bg-transparent"
                                            min="0"
                                            step="0.01"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* P2: Shipping */}
                            {showShippingLoss && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loss on Shipping Charges</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-0">Rs</span>
                                        <input
                                            type="number"
                                            name="shipping_loss"
                                            value={formData.shipping_loss}
                                            onChange={handleInputChange}
                                            className="w-full pl-8 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none relative z-10 bg-transparent"
                                            min="0"
                                            step="0.01"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Replacement Shipping */}
                            {showReplacementShipping && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                        Loss on Replacement Shipping
                                        <RefreshCw size={14} className="text-gray-400" />
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-0">Rs</span>
                                        <input
                                            type="number"
                                            name="replacement_shipping_loss"
                                            value={formData.replacement_shipping_loss}
                                            onChange={handleInputChange}
                                            className="w-full pl-8 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none relative z-10 bg-transparent"
                                            min="0"
                                            step="0.01"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Product Loss (Auto-filled or manual) */}
                            {showProductLoss && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Loss on Product Value
                                        {(isScenario5 || isScenario6) && <span className="text-xs text-indigo-500 ml-2">(Auto-filled base price)</span>}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-0">Rs</span>
                                        <input
                                            type="number"
                                            name="product_loss"
                                            value={formData.product_loss}
                                            onChange={handleInputChange}
                                            className="w-full pl-8 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none relative z-10 bg-transparent"
                                            min="0"
                                            step="0.01"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Compensation / Claim */}
                            {showCompensation && (
                                <div className="md:col-span-2 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="is_compensated"
                                                name="is_compensated"
                                                checked={formData.is_compensated}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            />
                                            <label htmlFor="is_compensated" className="ml-2 text-sm font-medium text-gray-700">
                                                Platform Compensation / Claim
                                            </label>
                                        </div>
                                        {/* Status Dropdown - ALways show if compensated */}
                                        {formData.is_compensated && (
                                            <select
                                                name="claim_status"
                                                value={formData.claim_status}
                                                onChange={handleInputChange}
                                                className="text-xs p-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-indigo-500"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        )}
                                    </div>

                                    {formData.is_compensated && (
                                        <div className="animate-fade-in">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Claim/Compensation Amount</label>
                                            <div className="relative max-w-xs">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-0">Rs</span>
                                                <input
                                                    type="number"
                                                    name="compensation_amount"
                                                    value={formData.compensation_amount}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-8 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none relative z-10 bg-transparent ${formData.claim_status === 'Rejected' ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                                                    min="0"
                                                    step="0.01"
                                                    autoComplete="off"
                                                    disabled={formData.claim_status === 'Rejected'}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Summary Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Calculation Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Loss</p>
                                    <p className="text-xl font-bold text-gray-900">Rs {calculations.total_loss.toFixed(2)}</p>
                                </div>
                                {showCompensation && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Claim Amount</p>
                                        <p className="text-xl font-bold text-green-600">- Rs {parseFloat(formData.compensation_amount || 0).toFixed(2)}</p>
                                    </div>
                                )}
                                <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                                    {calculations.net_loss < 0 ? (
                                        <>
                                            <p className="text-sm text-gray-500 mb-1">Net Profit</p>
                                            <p className="text-2xl font-bold text-green-600">Rs {Math.abs(calculations.net_loss).toFixed(2)}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-500 mb-1">Net Loss</p>
                                            <p className="text-2xl font-bold text-red-600">Rs {calculations.net_loss.toFixed(2)}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-shadow shadow-md hover:shadow-lg disabled:opacity-70"
                            >
                                <Save size={20} />
                                {loading ? 'Saving...' : 'Submit Analysis'}
                            </button>
                        </div>
                    </form>
                )}

                {!selectedReturn && (
                    <div className="p-12 text-center text-gray-500">
                        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <p>Please select a Return Order ID above to begin the analysis.</p>
                    </div>
                )}
            </div>
            {/* Pending Claims Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-yellow-50/50">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                        <AlertCircle className="text-yellow-600" size={20} />
                        Pending Claims Action Required
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Review and update status for pending reimbursement claims</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Analysis Date</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Claim Amount</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pendingClaims.map(claim => (
                                <tr key={claim.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-sm font-medium text-indigo-600">#{claim.order_id}</td>
                                    <td className="p-4 text-sm text-gray-600">{new Date(claim.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-sm font-medium text-gray-900 text-right">Rs {parseFloat(claim.compensation_amount).toFixed(2)}</td>
                                    <td className="p-4 flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleStatusUpdate(claim.id, 'Approved')}
                                            className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200 transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(claim.id, 'Rejected')}
                                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {pendingClaims.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400">
                                        No pending claims found.
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

export default ReturnAnalysis;
