const express = require('express');
const router = express.Router();
const { createPost, getMyPosts, getPostById, addReview, handleMLCallback, deletePost } = require('../controllers/postController');
const { protect, optionalProtect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', optionalProtect, upload.single('media'), createPost);
router.get('/my', protect, getMyPosts);
router.get('/:id', protect, getPostById);
router.put('/:id/review', protect, addReview);
router.post('/ml-callback', handleMLCallback);
router.delete('/:id', protect, authorize('central_admin', 'state_admin', 'city_admin'), deletePost);

module.exports = router;
