import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ExpenseReport = () => {
    const [stats, setStats] = useState({ sales: 0, profit: 0, purchases: 0, miscExpenses: 0, topProducts: [] });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            // Not sending filters for now as they are revenue specific
            const res = await axios.get('http://localhost:5000/api/reports/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const expenseData = {
        labels: ['Purchases (Cost of Goods)', 'Misc. Expenses'],
        datasets: [
            {
                data: [stats.purchases, stats.miscExpenses],
                backgroundColor: [
                    '#FF6384',
                    '#FFCE56',
                ],
                hoverBackgroundColor: [
                    '#FF6384',
                    '#FFCE56',
                ],
            },
        ],
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Expense Report</h1>

            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Expense Breakdown</h2>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut data={expenseData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>
                {/* Placeholder for future expense-specific charts (e.g., expenses by category) */}
                <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center">
                    <p className="text-gray-500 italic">Detailed expense analysis coming soon...</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="bg-red-100 p-8 rounded-lg shadow text-center">
                    <h3 className="text-lg font-semibold text-red-800">Total Misc. Expenses</h3>
                    <p className="text-4xl font-bold text-red-900 mt-2">
                        Rs {Number(stats.miscExpenses).toFixed(2)}
                    </p>
                </div>
                <div className="bg-orange-100 p-8 rounded-lg shadow text-center">
                    <h3 className="text-lg font-semibold text-orange-800">Total Purchases cost</h3>
                    <p className="text-4xl font-bold text-orange-900 mt-2">
                        Rs {Number(stats.purchases).toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExpenseReport;
