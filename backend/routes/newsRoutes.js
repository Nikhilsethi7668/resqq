const express = require('express');
const router = express.Router();
const { getNews, createNews } = require('../controllers/newsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.get('/', getNews);
router.post('/', protect, authorize('news_admin', 'central_admin'), upload.single('image'), createNews);

module.exports = router;
