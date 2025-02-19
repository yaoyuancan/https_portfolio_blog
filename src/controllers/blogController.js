const blogData = require('../data/blogData')

// Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await blogData.getAllBlogs()
    // Set cache control
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=300')
    res.json(blogs)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to get blog list', error: error.message })
  }
}

// Get a single blog
exports.getBlog = async (req, res) => {
  try {
    const blog = await blogData.getBlogById(req.params.id)
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' })
    }
    res.json(blog)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to get blog', error: error.message })
  }
}

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const data = {
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      category: req.body.category
    }

    const newBlog = await blogData.createBlog(data)
    res.status(201).json(newBlog)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to create blog', error: error.message })
  }
}

// Update a blog
exports.updateBlog = async (req, res) => {
  try {
    const updatedBlog = await blogData.updateBlog(req.params.id, req.body)
    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' })
    }
    res.json(updatedBlog)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to update blog', error: error.message })
  }
}

// Delete a blog
exports.deleteBlog = async (req, res) => {
  try {
    const deleted = await blogData.deleteBlog(req.params.id)
    if (!deleted) {
      return res.status(404).json({ message: 'Blog not found' })
    }
    res.status(204).send()
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to delete blog', error: error.message })
  }
}
