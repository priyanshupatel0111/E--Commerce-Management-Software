import { useState, useEffect } from 'react';
import axios from 'axios';

const SoldItemsReport = () => {
    const [soldItems, setSoldItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    useEffect(() => {
        fetchSoldItems();
    }, []);

    const fetchSoldItems = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const res = await axios.get(`http://localhost:5000/api/reports/sold-items?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSoldItems(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching sold items:", error);
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        setDateRange({ ...dateRange, [e.target.name]: e.target.value });
    };

    const handleFilter = () => {
        fetchSoldItems();
    };

    const handleClearFilter = () => {
        setDateRange({ startDate: '', endDate: '' });
        // Can't invoke fetchSoldItems immediately with cleared state due to closure, 
        // so we'll trigger it in effect or just let user click filter again? 
        // Better UX: update state then trigger fetch.
        // Or pass empty params manually.
        // Simplest: just clear inputs, user clicks Filter (which essentially fetches all).
        // Actually, user expects "Clear" to reset view.
        // I will implement a separate reset flow or just refresh.
        // Let's stick to simple clear of state, then user clicks search, OR auto-fetch.
        // Re-implementing handleClearFilter to be robust:
        // For now, let's keep it simple: Update state, and user hits Filter.
        // Or wait, I can just call fetch with empty strings.
    };

    // Re-simplifying clear:
    const clearFilters = () => {
        setDateRange({ startDate: '', endDate: '' });
        // To fetch all immediately, I need to call fetch with empty values, bypassing state
        // or use useEffect on state change (but that triggers on every keystroke/date pick).
        // I'll leave it as manual Filter click for now or pass empty overrides.
        // Let's implement immediate fetch for Clear:
        fetchSoldItemsWithParams('', '');
    }

    const fetchSoldItemsWithParams = async (start, end) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (start) params.append('startDate', start);
            if (end) params.append('endDate', end);

            const res = await axios.get(`http://localhost:5000/api/reports/sold-items?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSoldItems(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    // Refactoring default fetch to use the parameterized version if needed, 
    // but standard fetch uses current state.
    // Let's clean this up. I will use the `fetchSoldItems` using current state, 
    // and for Clear, I will set state and then call fetch.
    // Actually, `setState` is async. 
    // I will use a ref or just pass args to `fetchSoldItems` optionally.


    const grandTotalRevenue = soldItems.reduce((acc, item) => acc + Number(item.total_revenue), 0);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Sold Items Report</h1>

            {/* Date Filter */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap items-end gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input
                        type="date"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateChange}
                        className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input
                        type="date"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateChange}
                        className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleFilter}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                    >
                        Filter
                    </button>
                    <button
                        onClick={clearFilters}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center">Loading...</td>
                            </tr>
                        ) : soldItems.length > 0 ? (
                            soldItems.map((item) => (
                                <tr key={item.product_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.units_sold}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">
                                        ${Number(item.total_revenue).toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No items sold yet.</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                        <tr>
                            <td colSpan="3" className="px-6 py-4 text-right text-gray-700">Grand Total Revenue:</td>
                            <td className="px-6 py-4 text-right text-indigo-700 text-lg">
                                ${grandTotalRevenue.toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default SoldItemsReport;
