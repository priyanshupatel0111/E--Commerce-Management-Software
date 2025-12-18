import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus } from 'lucide-react';

const MiscellaneousExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/misc-expenses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExpenses(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch expenses');
            setLoading(false);
            console.error(err);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/misc-expenses', newExpense, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExpenses([res.data, ...expenses]);
            setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add expense');
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/misc-expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExpenses(expenses.filter(exp => exp.id !== id));
        } catch (err) {
            setError('Failed to delete expense');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Miscellaneous Expenses</h1>

            {/* Add Expense Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Expense</h2>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <form onSubmit={handleAddExpense} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={newExpense.description}
                            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Office Supplies"
                            required
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div className="w-40">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={newExpense.date}
                            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2 h-[42px]"
                    >
                        <Plus size={20} /> Add
                    </button>
                </form>
            </div>

            {/* Expenses List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Date</th>
                            <th className="p-4 font-semibold text-gray-600">Description</th>
                            <th className="p-4 font-semibold text-gray-600">Amount</th>
                            <th className="p-4 font-semibold text-gray-600">Added By</th>
                            <th className="p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-4 text-center">Loading...</td>
                            </tr>
                        ) : expenses.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-500">No expenses recorded.</td>
                            </tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{new Date(expense.date).toLocaleDateString()}</td>
                                    <td className="p-4">{expense.description}</td>
                                    <td className="p-4 font-medium text-red-600">-Rs {parseFloat(expense.amount).toFixed(2)}</td>
                                    <td className="p-4 text-sm text-gray-500">{expense.AddedBy?.username || 'Unknown'}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDeleteExpense(expense.id)}
                                            className="text-red-500 hover:text-red-700 transition"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MiscellaneousExpenses;
