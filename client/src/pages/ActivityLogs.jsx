import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns'; // Need to remind user to install date-fns if not present, or use standard date

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Staff Activity Logs</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    {log.User?.username || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">
                                        {log.action_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {log.description}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No logs found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActivityLogs;
