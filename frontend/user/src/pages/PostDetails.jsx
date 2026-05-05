import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../stores/useAuthStore';

const PostDetails = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const { token, user } = useAuthStore();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/posts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPost(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        if (token) {
            fetchPost();
        }
    }, [id, token]);

    const submitReview = async () => {
        try {
            await api.put(`/posts/${id}/review`,
                { rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Review Submitted');
            window.location.reload();
        } catch (err) {
            alert('Failed to submit review');
        }
    };

    if (!post) return <div>Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto mt-8 bg-white p-8 rounded-lg shadow">
            <h1 className="text-3xl font-bold mb-4">SOS Report Details</h1>

            <div className="mb-6">
                <span className={`px-3 py-1 rounded-full text-white ${post.status === 'completed' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {post.status}
                </span>
                <span className="ml-4 text-gray-500">Danger Level: {post.dangerLevel}</span>
            </div>

            <div className="mb-6 border p-4 rounded bg-gray-50">
                <h3 className="font-bold text-lg mb-2">Report Content:</h3>
                
                {/* Text Description */}
                {(post.textContent || (post.type === 'text' && post.content)) && (
                    <p className="mt-2 mb-4 whitespace-pre-wrap text-gray-800 text-lg">
                        {post.type === 'text' ? post.content : post.textContent}
                    </p>
                )}

                {/* Media Content */}
                {post.type === 'image' && (
                    <div className="mt-2">
                        <img src={post.content} alt="Evidence" className="max-w-full rounded-lg shadow-sm border" />
                    </div>
                )}
                
                {post.type === 'audio' && (
                    <div className="mt-2">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Voice Recording:</p>
                        <audio controls className="w-full">
                            <source src={post.content} type="audio/webm" />
                            <source src={post.content} type="audio/mpeg" />
                            <source src={post.content} type="audio/wav" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
            </div>

            {post.helpDetails && (
                <div className="mb-6 bg-blue-50 p-4 rounded border border-blue-200">
                    <h3 className="font-bold text-blue-800">Help Sent Details:</h3>
                    <p>{post.helpDetails.situation}</p>
                    <p className="text-sm text-gray-500">{new Date(post.helpDetails.timestamp).toLocaleString()}</p>
                </div>
            )}

            {post.status === 'completed' && !post.review && user.role === 'user' && (
                <div className="mt-8 border-t pt-6">
                    <h3 className="font-bold text-xl mb-4">Rate Response</h3>
                    <div className="flex items-center space-x-4 mb-4">
                        <label>Rating:</label>
                        <select value={rating} onChange={(e) => setRating(e.target.value)} className="border p-2 rounded">
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Poor</option>
                            <option value="1">1 - Terrible</option>
                        </select>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a review..."
                        className="w-full p-2 border rounded mb-4"
                    />
                    <button onClick={submitReview} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                        Submit Review
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostDetails;
