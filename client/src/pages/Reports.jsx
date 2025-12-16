import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Reports = () => {
    const [stats, setStats] = useState({ sales: 0, profit: 0, purchases: 0, topProducts: [] });
    const [filters, setFilters] = useState({ sellerId: '', platform: '' });
    const [options, setOptions] = useState({ sellers: [], platforms: [] });

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchStats();
    }, [filters]);

    const fetchFilters = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/reports/filters', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOptions(res.data);
        } catch (error) {
            console.error("Error fetching filters:", error);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.sellerId) params.append('sellerId', filters.sellerId);
            if (filters.platform) params.append('platform', filters.platform);

            const res = await axios.get(`http://localhost:5000/api/reports/stats?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const salesData = {
        labels: ['Total Revenue', 'Total Cost'],
        datasets: [
            {
                label: 'Amount (Rs)',
                data: [stats.sales, stats.purchases],
                backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const topProductsData = {
        labels: stats.topProducts.map(p => p.name),
        datasets: [
            {
                data: stats.topProducts.map(p => p.total_sold),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                ],
            },
        ],
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Financial Reports</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-8 flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Seller</label>
                    <select
                        name="sellerId"
                        value={filters.sellerId}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All Sellers</option>
                        {options.sellers.map((seller) => (
                            <option key={seller.seller_code} value={seller.seller_code}>
                                {seller.seller_name} ({seller.seller_code})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Platform</label>
                    <select
                        name="platform"
                        value={filters.platform}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All Platforms</option>
                        {options.platforms.map((platform) => (
                            <option key={platform} value={platform}>
                                {platform}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Financial Overview</h2>
                    <div className="h-64 flex items-center justify-center">
                        <Bar data={salesData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Top Selling Products</h2>
                    <div className="h-64 flex items-center justify-center">
                        {stats.topProducts.length > 0 ? (
                            <Pie data={topProductsData} options={{ responsive: true, maintainAspectRatio: false }} />
                        ) : (
                            <p className="text-gray-500">No sales data yet.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="bg-green-100 p-8 rounded-lg shadow text-center">
                    <h3 className="text-lg font-semibold text-green-800">Total Profit (Gross)</h3>
                    <p className="text-4xl font-bold text-green-900 mt-2">
                        Rs {Number(stats.profit).toFixed(2)}
                    </p>
                </div>
                <div className="bg-indigo-100 p-8 rounded-lg shadow text-center">
                    <h3 className="text-lg font-semibold text-indigo-800">Total Revenue</h3>
                    <p className="text-4xl font-bold text-indigo-900 mt-2">
                        Rs {Number(stats.sales).toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
