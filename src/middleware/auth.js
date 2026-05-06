const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token.' })
  }
}

const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Access denied. Super admin only.' })
  }
  next()
}

const isPremise = (req, res, next) => {
  if (req.user.role !== 'PREMISE') {
    return res.status(403).json({ message: 'Access denied. Premise login only.' })
  }
  next()
}

module.exports = { verifyToken, isSuperAdmin, isPremise }