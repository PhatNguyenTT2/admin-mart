const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const Role = require('../models/role')
const { userExtractor } = require('../utils/auth')

// Helper function to generate next userCode
const generateUserCode = async () => {
  const lastUser = await User.findOne()
    .sort({ userCode: -1 })
    .limit(1)
    .select('userCode')

  if (!lastUser || !lastUser.userCode) {
    return 'EMP001'
  }

  // Extract number from userCode (e.g., EMP001 -> 1)
  const lastNumber = parseInt(lastUser.userCode.substring(3))
  const newNumber = lastNumber + 1

  // Format with leading zeros (e.g., 1 -> EMP001, 25 -> EMP025)
  return `EMP${String(newNumber).padStart(3, '0')}`
}

// Helper: Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 days
  )
}

// POST /api/login - Login
loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  // Validation
  if (!username || !password) {
    return response.status(400).json({
      error: 'Username and password are required'
    })
  }

  try {
    // Find user and populate role
    const user = await User.findOne({ username }).populate('role', 'roleId roleName')

    if (!user) {
      return response.status(401).json({
        error: 'Invalid username or password'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return response.status(403).json({
        error: 'Account is inactive. Please contact administrator.'
      })
    }

    // Verify password
    const passwordCorrect = await bcrypt.compare(password, user.passwordHash)

    if (!passwordCorrect) {
      return response.status(401).json({
        error: 'Invalid username or password'
      })
    }

    // Generate token
    const token = generateToken(user._id)

    // Save token to user's tokens array
    user.tokens = user.tokens.concat({ token })
    user.lastLogin = new Date()
    await user.save()

    // Return user info and token
    response.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    response.status(500).json({
      error: 'Something went wrong during login',
      details: error.message
    })
  }
})

// POST /api/login/register - Register new admin
loginRouter.post('/register', async (request, response) => {
  const { username, email, fullName, password } = request.body

  // Validation
  if (!username || !email || !fullName || !password) {
    return response.status(400).json({
      error: 'All fields are required (username, email, fullName, password)'
    })
  }

  if (password.length < 6) {
    return response.status(400).json({
      error: 'Password must be at least 6 characters long'
    })
  }

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return response.status(400).json({
        error: 'Username already exists'
      })
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return response.status(400).json({
        error: 'Email already exists'
      })
    }

    // Generate userCode
    const userCode = await generateUserCode()

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Find the ADMIN role
    const adminRole = await Role.findOne({ roleId: 'ADMIN' })
    if (!adminRole) {
      return response.status(500).json({
        error: 'Admin role not found. Please run setup script first.'
      })
    }

    // Create new user
    const user = new User({
      userCode,
      username,
      email,
      fullName,
      passwordHash,
      role: adminRole._id, // Use ObjectId reference to Role
      isActive: true
    })

    const savedUser = await user.save()

    // Return success (no auto-login, user needs to login)
    response.status(201).json({
      success: true,
      message: 'Registration successful. Please login.',
      data: {
        user: {
          id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email,
          fullName: savedUser.fullName,
          role: savedUser.role
        }
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    if (error.name === 'ValidationError') {
      return response.status(400).json({
        error: error.message
      })
    }
    response.status(500).json({
      error: 'Something went wrong during registration',
      details: error.message
    })
  }
})

// POST /api/login/logout - Logout (requires authentication)
loginRouter.post('/logout', userExtractor, async (request, response) => {
  try {
    const user = request.user
    const token = request.token

    // Remove token from user's tokens array
    user.tokens = user.tokens.filter(t => t.token !== token)
    await user.save()

    response.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    response.status(500).json({
      error: 'Something went wrong during logout'
    })
  }
})

// GET /api/login/me - Get current user info (requires authentication)
loginRouter.get('/me', userExtractor, async (request, response) => {
  const user = request.user

  response.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  })
})

module.exports = loginRouter
