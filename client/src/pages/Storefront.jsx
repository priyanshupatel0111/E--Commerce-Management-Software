import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';

const Storefront = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
        const storedCart = localStorage.getItem('cart');
        if (storedCart) setCart(JSON.parse(storedCart));
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Failed to fetch products', error);
            // Dummy data for fallback if backend fails
            setProducts([
                { id: 1, name: 'Premium Watch', price: 199.99, description: 'Luxury timepiece.', current_stock_qty: 10 },
                { id: 2, name: 'Wireless Headphones', price: 89.99, description: 'Noise cancelling.', current_stock_qty: 5 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        let newCart;
        if (existing) {
            newCart = cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            newCart = [...cart, { ...product, quantity: 1 }];
        }
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        setIsCartOpen(true);
    };

    const removeFromCart = (id) => {
        const newCart = cart.filter(item => item.id !== id);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const checkout = async () => {
        alert('Checkout feature to be implemented connecting to Orders API!');
        // Ideally post to /api/orders
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar cartCount={cart.reduce((a, b) => a + b.quantity, 0)} toggleCart={() => setIsCartOpen(!isCartOpen)} />

            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Featured Products</h1>
                {loading ? (
                    <p className="text-center">Loading products...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden group">
                                <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                                    {/* Placeholder for image */}
                                    <span className="text-4xl">📦</span>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden">{product.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-indigo-600">${product.sell_price || product.price}</span>
                                        <button
                                            onClick={() => addToCart(product)}
                                            disabled={product.current_stock_qty <= 0}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition"
                                        >
                                            {product.current_stock_qty <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Basic Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
                    <div className="bg-white w-96 h-full shadow-2xl p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Your Cart</h2>
                            <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-black">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {cart.length === 0 ? <p className="text-gray-500">Cart is empty.</p> : (
                                cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center mb-4 border-b pb-2">
                                        <div>
                                            <h4 className="font-semibold">{item.name}</h4>
                                            <p className="text-sm text-gray-600">${item.sell_price || item.price} x {item.quantity}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm">Remove</button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex justify-between text-xl font-bold mb-4">
                                <span>Total:</span>
                                <span>${cart.reduce((total, item) => total + (item.sell_price || item.price) * item.quantity, 0).toFixed(2)}</span>
                            </div>
                            <button onClick={checkout} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold">
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Storefront;
