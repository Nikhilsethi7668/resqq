import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Award, Calendar, User, X } from 'lucide-react';

const SuccessStories = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStory, setSelectedStory] = useState(null);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await api.get('/news');
                const successStories = res.data.filter(item => item.category === 'success_story');
                setStories(successStories);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, []);

    if (loading) return <div className="text-center py-10">Loading stories...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-16">
                <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase">Impact</span>
                <h1 className="text-4xl font-bold mt-4 text-slate-800">Success Stories</h1>
                <p className="text-xl text-gray-600 mt-4">Real lives saved by ResQ Connect.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories.map(story => (
                    <div
                        key={story._id}
                        onClick={() => setSelectedStory(story)}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 group"
                    >
                        <div className="h-48 bg-gray-200 overflow-hidden relative">
                            {story.image ? (
                                <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
                                    <Award size={48} className="text-white opacity-50" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-green-600 shadow-sm">
                                SUCCESS STORY
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                                <Calendar size={14} />
                                <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h2 className="text-xl font-bold mb-3 text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">{story.title}</h2>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">{story.content}</p>
                            <span className="text-blue-600 text-sm font-semibold group-hover:underline">Read Full Story →</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Modal */}
            {selectedStory && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedStory(null)}>
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedStory(null)}
                            className="absolute top-4 right-4 bg-white/50 hover:bg-white p-2 rounded-full transition-colors z-10"
                        >
                            <X size={24} />
                        </button>

                        <div className="h-64 md:h-96 bg-gray-200 relative">
                            {selectedStory.image ? (
                                <img src={selectedStory.image} alt={selectedStory.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
                                    <Award size={64} className="text-white opacity-50" />
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedStory.title}</h2>
                                <div className="flex items-center text-white/80 space-x-4">
                                    <span className="flex items-center"><Calendar size={16} className="mr-1" /> {new Date(selectedStory.createdAt).toLocaleDateString()}</span>
                                    <span className="flex items-center"><User size={16} className="mr-1" /> Admin Report</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-12">
                            <div className="prose max-w-none text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                                {selectedStory.content}
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        RC
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">ResQ Connect Team</p>
                                        <p className="text-sm text-gray-500">Official Verified Update</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedStory(null)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {stories.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 text-lg">No success stories published yet. Stay tuned!</p>
                </div>
            )}
        </div>
    );
};

export default SuccessStories;
