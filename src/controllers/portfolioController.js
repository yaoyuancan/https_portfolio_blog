const portfolioData = require('../data/portfolioData')

// Get all portfolios
exports.getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await portfolioData.getAllPortfolios()

    // Set cache control headers
    // max-age=300: caches 5 mins
    // stale-while-revalidate=300: If the cache expires, the old data can continue to be used when revalidating for up to 5 minutes
    // public: CDNs and intermediate caches can cache responses
    // must-revalidate: Once the cache expires, you must verify
    res.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=300, must-revalidate'
    )

    // Remove sensitive information from the response
    const sanitizedPortfolios = portfolios.map((portfolio) => ({
      id: portfolio.id,
      name: portfolio.name,
      bio: portfolio.bio,
      skills: portfolio.skills,
      projects: portfolio.projects.map((project) => ({
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        demoUrl: project.demoUrl
      })),
      // Only return public social links
      socialLinks: {
        github: portfolio.socialLinks?.github,
        linkedin: portfolio.socialLinks?.linkedin
      },
      // Only return published blog posts
      blogPosts: (portfolio.blogPosts || [])
        .filter((post) => post.status === 'published')
        .map((post) => ({
          title: post.title,
          summary: post.summary,
          publishDate: post.publishDate
        })),
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt
    }))

    res.json(sanitizedPortfolios)
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Failed to obtain the portfolio list',
        error: error.message
      })
  }
}

// Get a single portfolio
exports.getPortfolio = async (req, res) => {
  try {
    const portfolio = await portfolioData.getPortfolioById(req.params.id)
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' })
    }

    // get user role from request headers
    const userRole = req.headers['x-user-role'] || 'public'

    // get data based on role
    const sanitizedPortfolio = {
      id: portfolio.id,
      name: portfolio.name,
      bio: portfolio.bio,
      skills: portfolio.skills,
      projects: portfolio.projects.map((project) => ({
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        demoUrl: project.demoUrl,
        // only show private repo links to admin and owner
        githubUrl: ['admin', 'owner'].includes(userRole)
          ? project.githubUrl
          : undefined
      })),
      socialLinks: {
        github: portfolio.socialLinks?.github,
        linkedin: portfolio.socialLinks?.linkedin
      },
      // get blogs based on role
      blogPosts: (portfolio.blogPosts || [])
        .filter((post) => {
          if (['admin', 'owner'].includes(userRole)) return true
          if (userRole === 'user')
            return post.status === 'published' || post.status === 'preview'
          return post.status === 'published'
        })
        .map((post) => ({
          title: post.title,
          summary: post.summary,
          content: post.content,
          publishDate: post.publishDate,
          status: post.status
        })),
      // get contact based on role
      contact: ['admin', 'owner', 'user'].includes(userRole)
        ? portfolio.contact
        : undefined,
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt
    }

    // set cache control headers
    if (userRole === 'public') {
      res.set(
        'Cache-Control',
        'public, max-age=300, stale-while-revalidate=300, must-revalidate'
      )
    } else {
      // do not use cache for logged in users
      res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
      res.set('Pragma', 'no-cache')
      res.set('Expires', '0')
    }

    res.json(sanitizedPortfolio)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to get the portfolio', error: error.message })
  }
}

// Create portfolio
exports.createPortfolio = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      bio: req.body.bio,
      skills: req.body.skills || [],
      projects: req.body.projects || [],
      contact: req.body.contact || {},
      socialLinks: req.body.socialLinks || {},
      blogPosts: req.body.blogPosts || []
    }

    const newPortfolio = await portfolioData.createPortfolio(data)
    res.status(201).json(newPortfolio)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'create portfolio failed', error: error.message })
  }
}

// Update portfolio
exports.updatePortfolio = async (req, res) => {
  try {
    const updatedPortfolio = await portfolioData.updatePortfolio(
      req.params.id,
      req.body
    )
    if (!updatedPortfolio) {
      return res.status(404).json({ message: 'Portfolio not found' })
    }
    res.json(updatedPortfolio)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to update the portfolio', error: error.message })
  }
}

// Delete portfolio
exports.deletePortfolio = async (req, res) => {
  try {
    const deleted = await portfolioData.deletePortfolio(req.params.id)
    if (!deleted) {
      return res.status(404).json({ message: 'Portfolio not found' })
    }
    res.status(204).send()
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to delete the portfolio', error: error.message })
  }
}
