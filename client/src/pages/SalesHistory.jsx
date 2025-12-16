import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const SalesHistory = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(res.data)) {
                console.log('Fetched Orders:', res.data);
                setOrders(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading sales history...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Sales History</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                                    {order.seller_custom_id || '-'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {order.platform || '-'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {order.OrderItems?.map(item => (
                                        <div key={item.id}>
                                            {item.quantity}x {item.Product?.name || 'Item'}
                                        </div>
                                    ))}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                    Rs {Number(order.total_amount).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No sales recorded yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesHistory;
