import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';

const Storefront = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
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



    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

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
                                        <span className="text-2xl font-bold text-indigo-600">Rs {product.sell_price || product.price}</span>
                                        {/* Cart Removed */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


        </div>
    );
};

export default Storefront;
