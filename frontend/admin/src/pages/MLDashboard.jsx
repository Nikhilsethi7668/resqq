import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart3, TrendingUp, Activity, Clock, Database } from 'lucide-react';

const MLDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentPredictions, setRecentPredictions] = useState([]);
    const [hourlyStats, setHourlyStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mlServiceStatus, setMlServiceStatus] = useState('unknown');

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch ML service health
            try {
                const healthRes = await api.get('/ml/health');
                setMlServiceStatus(healthRes.data.status);
            } catch (err) {
                setMlServiceStatus('offline');
            }

            // Fetch statistics
            const statsRes = await api.get('/ml/stats?days=7');
            setStats(statsRes.data);

            // Fetch recent predictions
            const recentRes = await api.get('/ml/recent?limit=20');
            setRecentPredictions(recentRes.data.predictions || []);

            // Fetch hourly stats
            const hourlyRes = await api.get('/ml/hourly?hours=24');
            setHourlyStats(hourlyRes.data.hourly_stats || []);

        } catch (err) {
            console.error('Error fetching ML data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const getDisasterColor = (type) => {
        const colors = {
            'Fire': 'bg-red-100 text-red-800',
            'Flood': 'bg-blue-100 text-blue-800',
            'Earthquake': 'bg-yellow-100 text-yellow-800',
            'Accident': 'bg-gray-100 text-gray-800',
            'Emergency': 'bg-purple-100 text-purple-800',
            'Unknown': 'bg-gray-100 text-gray-600'
        };
        return colors[type] || 'bg-gray-100 text-gray-600';
    };

    const getDangerColor = (score) => {
        if (score >= 80) return 'text-red-600 font-bold';
        if (score >= 60) return 'text-orange-600 font-semibold';
        return 'text-yellow-600';
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-center">
                    <Activity className="animate-spin mx-auto mb-4" size={48} />
                    <p className="text-gray-600">Loading ML Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">ML Dashboard</h1>
                    <p className="text-gray-600 mt-1">AI Model Performance & Predictions</p>
                </div>
                <div className={`px-4 py-2 rounded-lg ${mlServiceStatus === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${mlServiceStatus === 'healthy' ? 'bg-green-600' : 'bg-red-600'} animate-pulse`}></div>
                        <span className="font-semibold">ML Service: {mlServiceStatus === 'healthy' ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-semibold">Total Predictions</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_predictions}</p>
                                <p className="text-xs text-gray-500 mt-1">Last {stats.period_days} days</p>
                            </div>
                            <Database className="text-blue-600" size={40} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-semibold">Avg Danger Score</p>
                                <p className={`text-3xl font-bold mt-2 ${getDangerColor(stats.average_danger_score)}`}>
                                    {stats.average_danger_score}%
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Across all types</p>
                            </div>
                            <TrendingUp className="text-orange-600" size={40} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-semibold">Avg Confidence</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {(stats.average_confidence * 100).toFixed(1)}%
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Model accuracy</p>
                            </div>
                            <BarChart3 className="text-green-600" size={40} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-semibold">Input Types</p>
                                <div className="mt-2 space-y-1">
                                    {Object.entries(stats.input_type_distribution || {}).map(([type, count]) => (
                                        <div key={type} className="flex justify-between text-sm">
                                            <span className="capitalize">{type}:</span>
                                            <span className="font-semibold">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Activity className="text-purple-600" size={40} />
                        </div>
                    </div>
                </div>
            )}

            {/* Disaster Distribution */}
            {stats && stats.disaster_distribution && (
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-xl font-bold mb-4">Disaster Type Distribution</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(stats.disaster_distribution).map(([type, count]) => (
                            <div key={type} className={`p-4 rounded-lg ${getDisasterColor(type)}`}>
                                <p className="font-semibold">{type}</p>
                                <p className="text-2xl font-bold mt-1">{count}</p>
                                <p className="text-xs mt-1">
                                    {((count / stats.total_predictions) * 100).toFixed(1)}% of total
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Predictions */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Recent Predictions</h2>
                    <Clock className="text-gray-600" size={24} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Disaster</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Danger</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Confidence</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Preview</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentPredictions.map((pred) => (
                                <tr key={pred.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {new Date(pred.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 capitalize">
                                            {pred.input_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getDisasterColor(pred.disaster_type)}`}>
                                            {pred.disaster_type}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-3 text-sm font-semibold ${getDangerColor(pred.danger_score)}`}>
                                        {pred.danger_score}%
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {(pred.confidence * 100).toFixed(1)}%
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                                        {pred.input_preview || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recentPredictions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No predictions yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MLDashboard;
