const fs = require('fs').promises
const path = require('path')

const dataPath = path.join(__dirname, 'blogs.json')

// Get all blogs
async function getAllBlogs() {
  try {
    const data = await fs.readFile(dataPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(dataPath, '[]')
      return []
    }
    throw error
  }
}

// Get a single blog
async function getBlogById(id) {
  const blogs = await getAllBlogs()
  return blogs.find((b) => b.id === Number(id))
}

// Create a blog
async function createBlog(blogData) {
  const blogs = await getAllBlogs()
  const newBlog = {
    id: Date.now(), // timestamp as simple ID
    publishDate: new Date().toISOString(),
    status: 'published',
    ...blogData
  }
  blogs.push(newBlog)
  await fs.writeFile(dataPath, JSON.stringify(blogs, null, 2))
  return newBlog
}

// Update a blog
async function updateBlog(id, updateData) {
  const blogs = await getAllBlogs()
  const index = blogs.findIndex((b) => b.id === Number(id))
  if (index === -1) return null

  blogs[index] = { ...blogs[index], ...updateData }
  await fs.writeFile(dataPath, JSON.stringify(blogs, null, 2))
  return blogs[index]
}

// Delete a blog
async function deleteBlog(id) {
  const blogs = await getAllBlogs()
  const filteredBlogs = blogs.filter((b) => b.id !== Number(id))
  if (filteredBlogs.length === blogs.length) return false
  await fs.writeFile(dataPath, JSON.stringify(filteredBlogs, null, 2))
  return true
}

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
}
