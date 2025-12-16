import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Trash, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ManageSellers = () => {
    const { user } = useContext(AuthContext);
    const [sellers, setSellers] = useState([]);
    const [newCode, setNewCode] = useState('');
    const [newName, setNewName] = useState('');

    useEffect(() => {
        fetchSellers();
    }, []);

    const fetchSellers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/sellers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSellers(res.data);
        } catch (error) {
            console.error('Failed to fetch sellers', error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/sellers', {
                seller_code: newCode,
                seller_name: newName
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewCode('');
            setNewName('');
            fetchSellers();
            alert('Seller added successfully');
        } catch (error) {
            alert('Failed to add seller: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this seller ID?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/sellers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSellers();
        } catch (error) {
            alert('Failed to delete seller');
        }
    };

    if (user?.role !== 'Admin') {
        return <div className="p-6 text-red-500">Access Denied. Admins only.</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Seller IDs</h1>

            {/* Add New Seller */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4">Add New Seller ID</h2>
                <form onSubmit={handleAdd} className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Seller Code (e.g. A, B)</label>
                        <input
                            value={newCode}
                            onChange={e => setNewCode(e.target.value)}
                            className="mt-1 border p-2 rounded w-48"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Seller Name/Description</label>
                        <input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="mt-1 border p-2 rounded w-64"
                            required
                        />
                    </div>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700 h-10">
                        <Plus size={20} /> Add
                    </button>
                </form>
            </div>

            {/* List Sellers */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sellers.map(seller => (
                            <tr key={seller.id}>
                                <td className="px-6 py-4 font-bold text-indigo-600">{seller.seller_code}</td>
                                <td className="px-6 py-4 text-gray-900">{seller.seller_name}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(seller.id)} className="text-red-500 hover:text-red-700">
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {sellers.length === 0 && (
                            <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No seller IDs found. Add one above.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageSellers;
