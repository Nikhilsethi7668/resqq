const express = require('express');
const router = express.Router();
const { createPost, getMyPosts, getPostById, addReview, handleMLCallback } = require('../controllers/postController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', optionalProtect, upload.single('media'), createPost);
router.get('/my', protect, getMyPosts);
router.get('/:id', protect, getPostById);
router.put('/:id/review', protect, addReview);
router.post('/ml-callback', handleMLCallback);

module.exports = router;
