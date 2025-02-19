// a simple role check middleware
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    // get user role from request headers
    const userRole = req.headers['x-user-role'] || 'public'

    // roles
    const roles = {
      admin: 3,
      owner: 2,
      user: 1,
      public: 0
    }

    if (roles[userRole] >= roles[requiredRole]) {
      next()
    } else {
      res.status(403).json({
        message: 'Access denied',
        required: requiredRole,
        current: userRole
      })
    }
  }
}

module.exports = {
  checkRole
}
