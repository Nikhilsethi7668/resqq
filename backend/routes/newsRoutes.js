const express = require('express');
const router = express.Router();
const {
    getNews,
    createNews,
    convertPostToNews,
    updateNews,
    deleteNews
} = require('../controllers/newsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getNews);

// Protected routes (News Admin & Central Admin)
router.post('/', protect, authorize('news_admin', 'central_admin'), upload.single('image'), createNews);
router.post('/from-post/:postId', protect, authorize('news_admin', 'central_admin'), convertPostToNews);
router.put('/:id', protect, authorize('news_admin', 'central_admin'), upload.single('image'), updateNews);
router.delete('/:id', protect, authorize('news_admin', 'central_admin'), deleteNews);

module.exports = router;
