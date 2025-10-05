const jwt = require('jsonwebtoken')
const User = require('../models/user')

// Extract token from Authorization header
const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

// Middleware: Verify JWT token
const tokenExtractor = (request, response, next) => {
  request.token = getTokenFrom(request)
  next()
}

// Middleware: Extract and verify user from token
const userExtractor = async (request, response, next) => {
  const token = getTokenFrom(request)

  if (!token) {
    return response.status(401).json({
      error: 'Token missing or invalid'
    })
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

    if (!decodedToken.id) {
      return response.status(401).json({
        error: 'Token invalid'
      })
    }

    // Find user and verify token exists in user's tokens array
    const user = await User.findById(decodedToken.id)

    if (!user) {
      return response.status(401).json({
        error: 'User not found'
      })
    }

    if (!user.isActive) {
      return response.status(403).json({
        error: 'User account is inactive'
      })
    }

    // Verify token exists in user's tokens
    const tokenExists = user.tokens.some(t => t.token === token)
    if (!tokenExists) {
      return response.status(401).json({
        error: 'Token expired or invalid'
      })
    }

    request.user = user
    request.token = token
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return response.status(401).json({
        error: 'Token invalid'
      })
    } else if (error.name === 'TokenExpiredError') {
      return response.status(401).json({
        error: 'Token expired'
      })
    }
    next(error)
  }
}

// Middleware: Check if user is admin
const isAdmin = (request, response, next) => {
  if (!request.user) {
    return response.status(401).json({
      error: 'Authentication required'
    })
  }

  if (request.user.role !== 'admin') {
    return response.status(403).json({
      error: 'Admin access required'
    })
  }

  next()
}

module.exports = {
  tokenExtractor,
  userExtractor,
  isAdmin,
  getTokenFrom
}
