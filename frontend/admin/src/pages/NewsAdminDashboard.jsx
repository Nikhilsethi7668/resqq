import { useState, useEffect } from 'react';
import axios from 'axios';
import ConvertToNewsModal from '../components/news/ConvertToNewsModal';
import './NewsAdminDashboard.css';

const NewsAdminDashboard = () => {
    const [completedPosts, setCompletedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});

    // Filters
    const [currentPage, setCurrentPage] = useState(1);
    const [stateFilter, setStateFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');

    // Modal
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    // Unique states and cities for filters
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        fetchCompletedPosts();
    }, [currentPage, stateFilter, cityFilter, sortBy, order]);

    const fetchCompletedPosts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                console.error('No token found. Please login.');
                setLoading(false);
                return;
            }

            const params = {
                page: currentPage,
                limit: 10,
                sortBy,
                order
            };

            if (stateFilter) params.state = stateFilter;
            if (cityFilter) params.city = cityFilter;

            console.log('Fetching completed posts with params:', params);

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/completed-posts`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            console.log('Response received:', response.data);

            if (response.data && response.data.posts) {
                setCompletedPosts(response.data.posts);
                setPagination(response.data.pagination);

                // Extract unique states and cities
                const uniqueStates = [...new Set(response.data.posts.map(p => p.state))].filter(Boolean);
                const uniqueCities = [...new Set(response.data.posts.map(p => p.city))].filter(Boolean);
                setStates(uniqueStates);
                setCities(uniqueCities);

                console.log(`Found ${response.data.posts.length} completed posts`);
            } else {
                console.warn('Unexpected response format:', response.data);
                setCompletedPosts([]);
                setPagination({});
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching completed posts:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            if (error.response?.status === 401) {
                alert('Session expired. Please login again.');
            } else if (error.response?.status === 403) {
                alert('You do not have permission to view completed posts.');
            } else {
                alert('Failed to load completed posts. Please try again.');
            }

            setCompletedPosts([]);
            setPagination({});
            setLoading(false);
        }
    };

    const handleConvertToNews = (post) => {
        setSelectedPost(post);
        setShowConvertModal(true);
    };

    const handleConvertSuccess = () => {
        setShowConvertModal(false);
        setSelectedPost(null);
        fetchCompletedPosts(); // Refresh the list
    };

    const getDangerLevelColor = (level) => {
        if (level >= 80) return '#dc2626';
        if (level >= 60) return '#ea580c';
        return '#f59e0b';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="news-admin-dashboard">
            <div className="dashboard-header">
                <h1>📰 News Admin Dashboard</h1>
                <p>Convert completed emergency reports into news articles</p>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>🗺️ State</label>
                    <select value={stateFilter} onChange={(e) => {
                        setStateFilter(e.target.value);
                        setCurrentPage(1);
                    }}>
                        <option value="">All States</option>
                        {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>🏙️ City</label>
                    <select value={cityFilter} onChange={(e) => {
                        setCityFilter(e.target.value);
                        setCurrentPage(1);
                    }}>
                        <option value="">All Cities</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>📊 Sort By</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="createdAt">Date</option>
                        <option value="dangerLevel">Danger Level</option>
                        <option value="city">City</option>
                        <option value="state">State</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>🔄 Order</label>
                    <select value={order} onChange={(e) => setOrder(e.target.value)}>
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>

                <button className="clear-filters-btn" onClick={() => {
                    setStateFilter('');
                    setCityFilter('');
                    setSortBy('createdAt');
                    setOrder('desc');
                    setCurrentPage(1);
                }}>
                    Clear Filters
                </button>
            </div>

            {/* Stats */}
            <div className="stats-section">
                <div className="stat-card">
                    <div className="stat-value">{pagination.totalPosts || 0}</div>
                    <div className="stat-label">Total Completed Reports</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{completedPosts.length}</div>
                    <div className="stat-label">Showing on Page</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{pagination.totalPages || 0}</div>
                    <div className="stat-label">Total Pages</div>
                </div>
            </div>

            {/* Posts Table */}
            {loading ? (
                <div className="loading">Loading completed reports...</div>
            ) : completedPosts.length === 0 ? (
                <div className="no-data">
                    <p>No completed reports found</p>
                    <p>Try adjusting your filters</p>
                </div>
            ) : (
                <div className="posts-table-container">
                    <table className="posts-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Type</th>
                                <th>Danger Level</th>
                                <th>Content Preview</th>
                                <th>Reporter</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedPosts.map(post => (
                                <tr key={post._id}>
                                    <td className="date-cell">
                                        {formatDate(post.createdAt)}
                                    </td>
                                    <td className="location-cell">
                                        <div className="location">
                                            <span className="city">{post.city}</span>
                                            <span className="state">{post.state}</span>
                                        </div>
                                    </td>
                                    <td className="type-cell">
                                        <span className={`type-badge type-${post.type}`}>
                                            {post.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="danger-cell">
                                        <div className="danger-level" style={{
                                            backgroundColor: getDangerLevelColor(post.dangerLevel)
                                        }}>
                                            {post.dangerLevel}
                                        </div>
                                    </td>
                                    <td className="content-cell">
                                        {post.type === 'text' ? (
                                            <div className="content-preview">
                                                {post.content.substring(0, 100)}
                                                {post.content.length > 100 && '...'}
                                            </div>
                                        ) : (
                                            <div className="media-indicator">
                                                {post.type === 'image' ? '🖼️ Image' : '🎵 Audio'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="reporter-cell">
                                        {post.userId ? (
                                            <div className="reporter-info">
                                                <div className="reporter-name">{post.userId.name}</div>
                                                <div className="reporter-phone">{post.userId.phone}</div>
                                            </div>
                                        ) : (
                                            <span className="guest-reporter">Guest User</span>
                                        )}
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="convert-btn"
                                            onClick={() => handleConvertToNews(post)}
                                        >
                                            📰 Convert to News
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        disabled={!pagination.hasPrevPage}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        ← Previous
                    </button>

                    <div className="pagination-info">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </div>

                    <button
                        className="pagination-btn"
                        disabled={!pagination.hasNextPage}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Convert to News Modal */}
            {showConvertModal && (
                <ConvertToNewsModal
                    post={selectedPost}
                    onClose={() => {
                        setShowConvertModal(false);
                        setSelectedPost(null);
                    }}
                    onSuccess={handleConvertSuccess}
                />
            )}
        </div>
    );
};

export default NewsAdminDashboard;
