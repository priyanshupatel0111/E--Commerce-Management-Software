import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Reports = () => {
    const [stats, setStats] = useState({ sales: 0, purchases: 0, topProducts: [] });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/reports/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const salesData = {
        labels: ['Total Revenue', 'Total Cost'],
        datasets: [
            {
                label: 'Amount ($)',
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
                    <h3 className="text-lg font-semibold text-green-800">Total Profit</h3>
                    <p className="text-4xl font-bold text-green-900 mt-2">
                        ${(stats.sales - stats.purchases).toFixed(2)}
                    </p>
                </div>
                <div className="bg-indigo-100 p-8 rounded-lg shadow text-center">
                    <h3 className="text-lg font-semibold text-indigo-800">Total Revenue</h3>
                    <p className="text-4xl font-bold text-indigo-900 mt-2">
                        ${Number(stats.sales).toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
