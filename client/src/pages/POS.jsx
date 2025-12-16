import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Trash } from 'lucide-react';

const POS = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('Walk-in Customer');

    // New Fields
    const [sellerId, setSellerId] = useState('');
    const [platform, setPlatform] = useState('Messo');

    // Dynamic Sellers
    const [availableSellers, setAvailableSellers] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchSellers();
    }, []);

    const fetchSellers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/sellers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableSellers(res.data);
        } catch (error) {
            console.error('Failed to fetch sellers', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(res.data);
        } catch (error) {
            console.error(error);
            setProducts([
                { id: 1, name: 'Premium Watch', sku: 'WATCH-001', sell_price: 199.99, current_stock_qty: 10 },
            ]);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handleCheckout = async () => {
        if (!sellerId) {
            alert('Please select a Seller ID to complete the order.');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:5000/api/orders', {
                products: cart.map(i => ({ id: i.id, quantity: i.quantity })),
                customer_id: 1, // Dummy ID
                seller_custom_id: sellerId,
                platform: platform
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Order placed successfully!');
            setCart([]);
            fetchProducts(); // Refresh stock
        } catch (error) {
            alert('Checkout failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const total = cart.reduce((acc, item) => acc + (parseFloat(item.sell_price) * item.quantity), 0);

    return (
        <div className="flex h-screen -m-8">
            {/* Product List */}
            <div className="w-2/3 p-6 bg-gray-50 overflow-y-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">New Sale</h1>
                <div className="grid grid-cols-3 gap-4">
                    {products.map(product => (
                        <div key={product.id}
                            onClick={() => product.current_stock_qty > 0 && addToCart(product)}
                            className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition border ${product.current_stock_qty <= 0 ? 'opacity-50 pointer-events-none' : 'border-transparent hover:border-indigo-500'}`}>
                            <h3 className="font-bold text-lg">{product.name}</h3>
                            <p className="text-gray-500 text-sm mb-2">{product.sku}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-indigo-600 font-bold">Rs {product.sell_price}</span>
                                <span className={`text-xs px-2 py-1 rounded ${product.current_stock_qty > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    Stock: {product.current_stock_qty}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-1/3 bg-white shadow-xl flex flex-col h-full border-l">
                <div className="p-6 border-b space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart /> Current Order</h2>

                    {/* Customer Name */}
                    <input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full border rounded p-2 text-sm bg-gray-50"
                        placeholder="Customer Name"
                    />

                    {/* Seller Custom ID */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Seller ID <span className="text-red-500">*</span></label>
                        <select
                            value={sellerId}
                            onChange={(e) => setSellerId(e.target.value)}
                            className="w-full border rounded p-2 text-sm bg-gray-50"
                        >
                            <option value="">Select Seller ID...</option>
                            {availableSellers.map(s => (
                                <option key={s.id} value={s.seller_code}>{s.seller_code} - {s.seller_name}</option>
                            ))}
                        </select>
                        {/* Fallback text input removed as selection is now mandatory from the list */}
                    </div>

                    {/* Platform */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Platform</label>
                        <select
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="w-full border rounded p-2 text-sm bg-gray-50"
                        >
                            <option value="Messo">Messo</option>
                            <option value="Amazon">Amazon</option>
                            <option value="Flipkart">Flipkart</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                            <div>
                                <h4 className="font-semibold">{item.name}</h4>
                                <div className="text-sm text-gray-600">Rs {item.sell_price} x {item.quantity}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-200 rounded"><Minus size={16} /></button>
                                <span className="font-bold w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-200 rounded"><Plus size={16} /></button>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 ml-2"><Trash size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && <div className="text-center text-gray-400 mt-10">Empty Cart</div>}
                </div>

                <div className="p-6 bg-gray-50 border-t">
                    <div className="flex justify-between text-xl font-bold mb-4">
                        <span>Total</span>
                        <span>Rs {total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 font-bold shadow-lg transform transition active:scale-95"
                    >
                        Complete Sale
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POS;
