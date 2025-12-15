import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Inventory = () => {
    const auth = useContext(AuthContext);
    const user = auth ? auth.user : null;
    const [products, setProducts] = useState([]);

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', sku: '', buy_price: '', sell_price: '', current_stock_qty: '', low_stock_alert_level: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(res.data)) {
                setProducts(res.data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error(error);
            setProducts([]);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            // Sanitize input: Convert empty strings to 0 or null for numbers
            const payload = {
                ...formData,
                buy_price: formData.buy_price === '' ? 0 : parseFloat(formData.buy_price),
                sell_price: formData.sell_price === '' ? 0 : parseFloat(formData.sell_price),
                current_stock_qty: formData.current_stock_qty === '' ? 0 : parseInt(formData.current_stock_qty),
                low_stock_alert_level: formData.low_stock_alert_level === '' ? 5 : parseInt(formData.low_stock_alert_level)
            };

            if (editingProduct) {
                await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/products', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            setFormData({ name: '', sku: '', buy_price: '', sell_price: '', current_stock_qty: '', low_stock_alert_level: '' });
            fetchProducts();
        } catch (error) {
            console.error(error);
            alert('Failed to save product: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            sku: product.sku,
            buy_price: product.buy_price,
            sell_price: product.sell_price,
            current_stock_qty: product.current_stock_qty,
            low_stock_alert_level: product.low_stock_alert_level || 5
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProducts();
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    const canEdit = user?.role && user.role !== 'Watcher';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
                {canEdit && (
                    <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700">
                        <Plus size={20} /> Add Product
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buy Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sell Price</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(product => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.current_stock_qty <= (product.low_stock_alert_level || 5) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {product.current_stock_qty}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.buy_price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.sell_price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {canEdit && (
                                        <>
                                            <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900"><Trash size={18} /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" required />
                            <input name="sku" placeholder="SKU" value={formData.sku} onChange={handleChange} className="w-full border p-2 rounded" required />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="buy_price" type="number" placeholder="Buy Price" value={formData.buy_price} onChange={handleChange} className="w-full border p-2 rounded" required />
                                <input name="sell_price" type="number" placeholder="Sell Price" value={formData.sell_price} onChange={handleChange} className="w-full border p-2 rounded" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input name="current_stock_qty" type="number" placeholder="Stock Qty" value={formData.current_stock_qty} onChange={handleChange} className="w-full border p-2 rounded" required />
                                <input name="low_stock_alert_level" type="number" placeholder="Low Stock Alert" value={formData.low_stock_alert_level} onChange={handleChange} className="w-full border p-2 rounded" />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
