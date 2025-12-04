import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

const MyPosts = () => {
    const [posts, setPosts] = useState([]);
    const { token } = useAuthStore();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await api.get('/api/posts/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPosts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPosts();
    }, [token]);

    return (
        <div className="max-w-4xl mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-6">My SOS Reports</h2>
            <div className="space-y-4">
                {posts.map(post => (
                    <Link key={post._id} to={`/post/${post._id}`} className="block bg-white p-6 rounded-lg shadow hover:shadow-md">
                        <div className="flex justify-between">
                            <span className={`font-bold ${post.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                                {post.status.toUpperCase()}
                            </span>
                            <span className="text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-2 text-gray-800">{post.content.substring(0, 100)}...</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MyPosts;
