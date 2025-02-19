const express = require('express')
const router = express.Router()
const portfolioController = require('../controllers/portfolioController')
const { checkRole } = require('../middlewares/authMiddleware')

// Get all portfolios - public access
router.get('/portfolios', portfolioController.getAllPortfolios)

// get one portfolio
router.get('/portfolios/:id', portfolioController.getPortfolio)

// Create new portfolio - requires user role or above
router.post('/portfolios', checkRole('user'), portfolioController.createPortfolio)

// update portfolio - need owner and admin role
router.put('/portfolios/:id', checkRole('owner'), portfolioController.updatePortfolio)

// delete portfolio - only admin can delete
router.delete('/portfolios/:id', checkRole('admin'), portfolioController.deletePortfolio)

module.exports = router
