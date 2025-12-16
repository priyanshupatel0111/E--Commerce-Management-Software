import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Plus, Eye } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Purchases = () => {
    const auth = useContext(AuthContext);
    const user = auth ? auth.user : null;
    const [purchases, setPurchases] = useState([]);
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    // New Purchase Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [supplierId, setSupplierId] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [selectedItems, setSelectedItems] = useState([]); // { id, quantity, cost }

    // Supplier Creation Form
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [newSupplierData, setNewSupplierData] = useState({ company_name: '', contact_info: '' });

    // Details Modal
    const [viewPurchase, setViewPurchase] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchSuppliers();
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/purchases', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(res.data)) {
                setPurchases(res.data);
            }
        } catch (err) { console.error(err); }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(res.data)) {
                setProducts(res.data);
            }
        } catch (err) { console.error(err); }
    };

    const fetchSuppliers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/suppliers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(res.data)) {
                setSuppliers(res.data);
            }
        } catch (err) { console.error(err); }
    };

    const handleAddItem = () => {
        setSelectedItems([...selectedItems, { product_id: '', quantity: 1, cost: 0 }]);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...selectedItems];
        newItems[index][field] = value;
        setSelectedItems(newItems);
    };

    const handleCreateSupplier = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post('http://localhost:5000/api/suppliers', newSupplierData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuppliers([...suppliers, res.data]);
            setSupplierId(res.data.id); // Auto-select new supplier
            setIsSupplierModalOpen(false);
            setNewSupplierData({ company_name: '', contact_info: '' });
            alert('Supplier created successfully!');
        } catch (error) {
            alert('Failed to create supplier');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!supplierId) {
            alert('Please select a supplier');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const payload = {
                supplier_id: supplierId,
                invoice_number: invoiceNumber,
                products: selectedItems.map(i => ({ id: i.product_id, quantity: i.quantity, cost: i.cost }))
            };

            await axios.post('http://localhost:5000/api/purchases', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Purchase recorded successfully!');
            setIsModalOpen(false);
            setSelectedItems([]);
            setInvoiceNumber('');
            setSupplierId('');
            fetchPurchases(); // Refresh list
        } catch (error) {
            alert('Failed to record purchase: ' + (error.response?.data?.message || error.message));
        }
    };

    const canAdd = user?.role && user.role !== 'Watcher';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Purchases & Restocking</h1>
                {canAdd && (
                    <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700">
                        <Plus size={20} /> New Purchase
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {purchases.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No purchase history found.</td>
                            </tr>
                        ) : (
                            purchases.map(purchase => (
                                <tr key={purchase.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(purchase.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.invoice_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {purchase.Supplier ? purchase.Supplier.company_name : 'Unknown Supplier'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rs {purchase.total_cost}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button onClick={() => setViewPurchase(purchase)} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                                            <Eye size={16} /> View Items
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Purchase Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Record New Purchase</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={supplierId}
                                            onChange={e => setSupplierId(e.target.value)}
                                            className="border p-2 rounded flex-1"
                                            required
                                        >
                                            <option value="">Select Supplier...</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id}>{s.company_name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setIsSupplierModalOpen(true)}
                                            className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
                                            title="Add New Supplier"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                                    <input
                                        placeholder="Invoice Number"
                                        value={invoiceNumber}
                                        onChange={e => setInvoiceNumber(e.target.value)}
                                        className="border p-2 rounded w-full"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">Items</h3>
                                {selectedItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <select
                                            className="border p-2 rounded flex-1"
                                            value={item.product_id}
                                            onChange={e => updateItem(idx, 'product_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Product...</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                        </select>
                                        <input type="number" placeholder="Qty" className="border p-2 rounded w-24" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} required />
                                        <input type="number" placeholder="Cost" className="border p-2 rounded w-24" value={item.cost} onChange={e => updateItem(idx, 'cost', parseFloat(e.target.value) || 0)} required />
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddItem} className="text-indigo-600 text-sm hover:underline">+ Add Item</button>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Purchase</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Supplier Creation Modal */}
            {isSupplierModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">Add New Supplier</h2>
                        <form onSubmit={handleCreateSupplier} className="space-y-4">
                            <input
                                placeholder="Company Name"
                                value={newSupplierData.company_name}
                                onChange={e => setNewSupplierData({ ...newSupplierData, company_name: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />
                            <textarea
                                placeholder="Contact Info"
                                value={newSupplierData.contact_info}
                                onChange={e => setNewSupplierData({ ...newSupplierData, contact_info: e.target.value })}
                                className="w-full border p-2 rounded"
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Create Supplier</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Purchase Details Modal */}
            {viewPurchase && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Purchase Details</h2>
                        <div className="mb-4">
                            <p><strong>Invoice:</strong> {viewPurchase.invoice_number}</p>
                            <p><strong>Supplier:</strong> {viewPurchase.Supplier?.company_name}</p>
                            <p><strong>Date:</strong> {new Date(viewPurchase.createdAt).toLocaleString()}</p>
                        </div>
                        <h3 className="font-semibold mb-2">Items Bought</h3>
                        <div className="max-h-60 overflow-y-auto border rounded p-2">
                            {viewPurchase.PurchaseItems && viewPurchase.PurchaseItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between border-b py-2 last:border-0">
                                    <span>{item.Product?.name || 'Unknown Product'}</span>
                                    <span>{item.quantity} x Rs {item.cost_price}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setViewPurchase(null)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
