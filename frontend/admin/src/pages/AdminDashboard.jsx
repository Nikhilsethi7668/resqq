import React, { useEffect, useState } from 'react';
import api from '../services/api';
import useAuthStore from '../stores/useAuthStore';
import { Shield, CheckCircle, AlertTriangle, Send, Radio } from 'lucide-react';

const AdminDashboard = () => {
    const [alerts, setAlerts] = useState([]);
    const { token, user } = useAuthStore();
    const [helpText, setHelpText] = useState('');
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [showBroadcast, setShowBroadcast] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastLevel, setBroadcastLevel] = useState('info');

    const fetchAlerts = async () => {
        try {
            const res = await api.get('/admin/alerts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlerts(res.data.alerts || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAlerts();
            const interval = setInterval(fetchAlerts, 10000); // Polling backup
            return () => clearInterval(interval);
        }
    }, [token]);

    const updateStatus = async (postId, status) => {
        try {
            await api.post(`/admin/posts/${postId}/status`,
                { status, helpDetails: { situation: helpText } },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchAlerts();
            setSelectedAlert(null);
            setHelpText('');
        } catch (err) {
            alert('Update failed');
        }
    };

    const sendBroadcast = async () => {
        try {
            await api.post('/admin/broadcast',
                { message: broadcastMessage, level: broadcastLevel },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Broadcast sent successfully!');
            setShowBroadcast(false);
            setBroadcastMessage('');
        } catch (err) {
            alert('Broadcast failed');
        }
    };

    const deleteReport = async (postId) => {
        if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
            try {
                await api.delete(`/posts/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAlerts(alerts.filter(alert => alert.postId._id !== postId));
                alert('Report deleted successfully');
            } catch (err) {
                console.error(err);
                alert('Failed to delete report');
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                    {user && <p className="text-gray-600 mt-1">
                        Role: <span className="font-semibold uppercase">{user.role}</span>
                        {user.city && ` | City: ${user.city}`}
                        {user.state && ` | State: ${user.state}`}
                    </p>}
                </div>
                <button
                    onClick={() => setShowBroadcast(!showBroadcast)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                    <Radio size={20} />
                    <span>Broadcast Alert</span>
                </button>
            </div>

            {/* Broadcast Modal */}
            {showBroadcast && (
                <div className="mb-8 bg-blue-50 p-6 rounded-lg border-2 border-blue-300">
                    <h3 className="text-xl font-bold mb-4">Broadcast Alert</h3>
                    <div className="space-y-4">
                        <select
                            value={broadcastLevel}
                            onChange={(e) => setBroadcastLevel(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="critical">Critical</option>
                        </select>
                        <textarea
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                            placeholder="Enter broadcast message..."
                            className="w-full h-24 p-3 border rounded"
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={sendBroadcast}
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                            >
                                Send Broadcast
                            </button>
                            <button
                                onClick={() => setShowBroadcast(false)}
                                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                    {user && <p className="text-sm text-gray-600 mt-4">
                        {user.role === 'city_admin' && 'This will broadcast to all admins in your city.'}
                        {user.role === 'state_admin' && 'This will broadcast to all admins in your state and all cities within it.'}
                        {user.role === 'central_admin' && 'This will broadcast to ALL admins across all states and cities.'}
                    </p>}
                </div>
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-600 text-sm font-semibold">Active Alerts</h3>
                    <p className="text-3xl font-bold text-red-600">{alerts.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-600 text-sm font-semibold">Pending</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                        {alerts.filter(a => a.postId?.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-600 text-sm font-semibold">In Progress</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {alerts.filter(a => ['investigating', 'help_sent'].includes(a.postId?.status)).length}
                    </p>
                </div>
            </div>

            {/* Alerts List */}
            <div className="grid gap-6">
                {alerts.map(alert => (
                    <div key={alert._id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-xl font-bold text-red-600 flex items-center">
                                        <AlertTriangle className="mr-2" />
                                        Danger Level: {alert.postId?.dangerLevel || 'N/A'}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${alert.postId?.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        alert.postId?.status === 'help_sent' ? 'bg-blue-100 text-blue-800' :
                                            alert.postId?.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {alert.postId?.status?.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-1">
                                    📍 Location: {alert.targetCity}, {alert.targetState}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    🕐 {new Date(alert.createdAt).toLocaleString()}
                                </p>
                                <div className="mt-3 p-3 bg-gray-50 rounded border">
                                    <p className="font-semibold text-sm text-gray-700 mb-1">Content:</p>
                                    {alert.postId?.type === 'image' ? (
                                        <img src={alert.postId.content} alt="Evidence" className="max-w-xs rounded mt-2" />
                                    ) : alert.postId?.type === 'audio' ? (
                                        <audio controls src={alert.postId.content} className="mt-2" />
                                    ) : (
                                        <p className="text-gray-800">{alert.postId?.textContent}</p>
                                    )}
                                </div>

                                {alert.postId?.helpDetails && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                        <p className="font-semibold text-sm text-blue-800">Help Sent:</p>
                                        <p className="text-sm">{alert.postId.helpDetails.situation}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(alert.postId.helpDetails.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col space-y-2 ml-4">
                                {alert.postId?.status === 'pending' && (
                                    <button
                                        onClick={() => updateStatus(alert.postId._id, 'investigating')}
                                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 whitespace-nowrap"
                                    >
                                        🔍 Investigate
                                    </button>
                                )}

                                {alert.postId?.status === 'investigating' && (
                                    <div className="flex flex-col space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Situation details..."
                                            className="border p-2 rounded w-64"
                                            value={selectedAlert === alert._id ? helpText : ''}
                                            onChange={(e) => {
                                                setSelectedAlert(alert._id);
                                                setHelpText(e.target.value);
                                            }}
                                        />
                                        <button
                                            onClick={() => updateStatus(alert.postId._id, 'help_sent')}
                                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                        >
                                            ✅ Send Help
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => updateStatus(alert.postId._id, 'completed')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    ✔️ Mark Completed
                                </button>


                                <button
                                    onClick={() => deleteReport(alert.postId._id)}
                                    className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 border border-red-200"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="text-center py-12">
                        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                        <p className="text-gray-500 text-xl">No Active Alerts. All Safe! ✅</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
