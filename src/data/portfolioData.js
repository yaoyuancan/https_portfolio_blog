const fs = require('fs').promises
const path = require('path')

const dataPath = path.join(__dirname, 'portfolios.json')

// Get all portfolios
async function getAllPortfolios() {
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

// Get a single portfolio
async function getPortfolioById(id) {
  const portfolios = await getAllPortfolios()
  return portfolios.find((p) => p.id === Number(id))
}

// Create new portfolio
async function createPortfolio(portfolioData) {
  const portfolios = await getAllPortfolios()
  const newPortfolio = {
    id: Date.now(), // timestamp as simple ID
    createdAt: new Date().toISOString(),
    ...portfolioData
  }
  portfolios.push(newPortfolio)
  await fs.writeFile(dataPath, JSON.stringify(portfolios, null, 2))
  return newPortfolio
}

// Update portfolio
async function updatePortfolio(id, updateData) {
  const portfolios = await getAllPortfolios()
  const index = portfolios.findIndex((p) => p.id === Number(id))
  if (index === -1) return null

  const updatedPortfolio = {
    ...portfolios[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  }
  portfolios[index] = updatedPortfolio
  await fs.writeFile(dataPath, JSON.stringify(portfolios, null, 2))
  return updatedPortfolio
}

// Delete portfolio
async function deletePortfolio(id) {
  const portfolios = await getAllPortfolios()
  const filteredPortfolios = portfolios.filter((p) => p.id !== Number(id))
  if (filteredPortfolios.length === portfolios.length) return false
  await fs.writeFile(dataPath, JSON.stringify(filteredPortfolios, null, 2))
  return true
}

module.exports = {
  getAllPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
}
