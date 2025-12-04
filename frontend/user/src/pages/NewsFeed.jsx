import React, { useEffect, useState } from 'react';
import api from '../services/api';

const NewsFeed = () => {
    const [news, setNews] = useState([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await api.get('/news');
                setNews(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchNews();
    }, []);

    return (
        <div className="max-w-4xl mx-auto mt-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Community Safety News</h1>
            <div className="grid gap-6">
                {news.map(item => (
                    <div key={item._id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                        <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
                        <p className="text-gray-600 mb-4">{new Date(item.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-800 leading-relaxed">{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsFeed;
