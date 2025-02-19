const express = require('express')
const router = express.Router()
const blogController = require('../controllers/blogController')
const { checkRole } = require('../middlewares/authMiddleware')

// Get all blogs - public access
router.get('/blogs', blogController.getAllBlogs)

// Get a single blog - public access
router.get('/blogs/:id', blogController.getBlog)

// Create new blog - requires user role or above
router.post('/blogs', checkRole('user'), blogController.createBlog)

// Update blog - requires user role or above
router.put('/blogs/:id', checkRole('user'), blogController.updateBlog)

// Delete blog - requires admin role
router.delete('/blogs/:id', checkRole('admin'), blogController.deleteBlog)

module.exports = router
