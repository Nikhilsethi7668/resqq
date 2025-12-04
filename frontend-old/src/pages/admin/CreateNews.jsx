import React, { useState } from 'react';
import api from '../../services/api';
import useAuthStore from '../../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

const CreateNews = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('general');
    const [image, setImage] = useState(null);
    const navigate = useNavigate();
    const { token } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('category', category);
            if (image) {
                formData.append('image', image);
            }

            await api.post('/news',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            navigate('/news');
        } catch (err) {
            alert('Failed to create news');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6">Publish News</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Headline"
                    className="w-full p-2 border rounded font-bold text-lg"
                    required
                />
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Image (Optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="general">General News</option>
                        <option value="success_story">Success Story</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 border rounded h-32"
                        required
                    />
                </div>
                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                    Publish
                </button>
            </form>
        </div>
    );
};

export default CreateNews;
