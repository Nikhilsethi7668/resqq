import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const MyPosts = () => {
    const [posts, setPosts] = useState([]);
    const { token } = useAuthStore();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await api.get('/posts/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPosts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        if (token) {
            fetchPosts();
        }
    }, [token]);

    return (
        <div className="max-w-4xl mx-auto mt-8 px-4">
            <h2 className="text-3xl font-bold mb-8 text-slate-800 border-b pb-4">My SOS Reports</h2>

            {posts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-xl">No reports found.</p>
                    <Link to="/create-sos" className="mt-4 inline-block text-red-600 font-semibold hover:underline">
                        Report an Emergency
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map(post => (
                        <div key={post._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            {/* Header: Status & Date */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${post.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        post.status === 'help_sent' ? 'bg-blue-100 text-blue-800' :
                                            post.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {post.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(post.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-500 uppercase">Danger Level</p>
                                    <p className={`text-xl font-bold ${post.dangerLevel > 75 ? 'text-red-600' :
                                        post.dangerLevel > 50 ? 'text-orange-500' : 'text-green-600'
                                        }`}>
                                        {post.dangerLevel}%
                                    </p>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="mb-4 text-gray-700">
                                <p className="font-semibold flex items-center">
                                    📍 {post.city}, {post.state}
                                </p>
                            </div>

                            {/* Content: Text & Media */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <p className="text-gray-800 whitespace-pre-wrap mb-3 text-lg">
                                    {post.textContent || post.content}
                                </p>

                                {post.type === 'image' && (
                                    <div className="mt-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Attached Photo:</p>
                                        <img src={post.content} alt="Evidence" className="max-w-md rounded-lg shadow-sm border" />
                                    </div>
                                )}

                                {post.type === 'audio' && (
                                    <div className="mt-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Attached Audio:</p>
                                        <audio controls src={post.content} className="w-full max-w-md" />
                                    </div>
                                )}
                            </div>

                            {/* Help Details */}
                            {post.helpDetails && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                                    <h4 className="font-bold text-blue-800 mb-1">👮‍♂️ Help Status Update:</h4>
                                    <p className="text-blue-900">{post.helpDetails.situation}</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Updated: {new Date(post.helpDetails.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end mt-4">
                                <Link
                                    to={`/post/${post._id}`}
                                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                                >
                                    View Full Details &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyPosts;
