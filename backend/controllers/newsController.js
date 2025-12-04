const News = require('../models/News');

// @desc    Get News
// @route   GET /api/news
// @access  Public
const getNews = async (req, res) => {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
};

// @desc    Create News
// @route   POST /api/news
// @access  Private (News Admin)
const createNews = async (req, res) => {
    const { title, content, category, relatedPostId } = req.body;

    let image = null;
    if (req.file) {
        image = req.file.location;
    }

    const news = await News.create({
        title,
        content,
        category,
        image,
        relatedPostId,
        authorId: req.user._id
    });

    res.status(201).json(news);
};

module.exports = { getNews, createNews };
