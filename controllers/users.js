const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')
const { userExtractor, isAdmin } = require('../utils/auth')

// GET /api/users - Get all users (Admin only)
usersRouter.get('/', userExtractor, isAdmin, async (request, response) => {
  try {
    const { page = 1, per_page = 20, role, is_active } = request.query

    // Build filter
    const filter = {}
    if (role) filter.role = role
    if (is_active !== undefined) filter.isActive = is_active === 'true'

    // Pagination
    const pageNum = parseInt(page)
    const perPage = parseInt(per_page)
    const skip = (pageNum - 1) * perPage

    const users = await User.find(filter)
      .select('-passwordHash -tokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)

    const total = await User.countDocuments(filter)
    const totalPages = Math.ceil(total / perPage)

    response.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current_page: pageNum,
          per_page: perPage,
          total,
          total_pages: totalPages,
          has_next: pageNum < totalPages,
          has_prev: pageNum > 1
        }
      }
    })
  } catch (error) {
    response.status(500).json({
      error: 'Failed to fetch users'
    })
  }
})

// GET /api/users/:id - Get single user (Admin or self)
usersRouter.get('/:id', userExtractor, async (request, response) => {
  try {
    const user = await User.findById(request.params.id)
      .select('-passwordHash -tokens')

    if (!user) {
      return response.status(404).json({
        error: 'User not found'
      })
    }

    // Check access: Admin can see all, users can only see themselves
    if (request.user.role !== 'admin' &&
      request.user._id.toString() !== user._id.toString()) {
      return response.status(403).json({
        error: 'Access denied'
      })
    }

    response.status(200).json({
      success: true,
      data: { user }
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return response.status(400).json({
        error: 'Invalid user ID'
      })
    }
    response.status(500).json({
      error: 'Failed to fetch user'
    })
  }
})

// POST /api/users - Create new user (Admin only)
usersRouter.post('/', userExtractor, isAdmin, async (request, response) => {
  const { username, email, fullName, password, role } = request.body

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
    // Check if username exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return response.status(400).json({
        error: 'Username already exists'
      })
    }

    // Check if email exists
    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return response.status(400).json({
        error: 'Email already exists'
      })
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = new User({
      username,
      email,
      fullName,
      passwordHash,
      role: role || 'admin',
      isActive: true
    })

    const savedUser = await user.save()

    response.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email,
          fullName: savedUser.fullName,
          role: savedUser.role,
          isActive: savedUser.isActive
        }
      }
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({
        error: error.message
      })
    }
    response.status(500).json({
      error: 'Failed to create user'
    })
  }
})

// PUT /api/users/:id - Update user (Admin or self)
usersRouter.put('/:id', userExtractor, async (request, response) => {
  const { email, fullName, password } = request.body

  try {
    const user = await User.findById(request.params.id)

    if (!user) {
      return response.status(404).json({
        error: 'User not found'
      })
    }

    // Check access: Admin can update anyone, users can only update themselves
    if (request.user.role !== 'admin' &&
      request.user._id.toString() !== user._id.toString()) {
      return response.status(403).json({
        error: 'Access denied'
      })
    }

    // Update fields
    if (email) {
      // Check if email is already used by another user
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: user._id }
      })
      if (existingEmail) {
        return response.status(400).json({
          error: 'Email already in use'
        })
      }
      user.email = email
    }

    if (fullName) user.fullName = fullName

    if (password) {
      if (password.length < 6) {
        return response.status(400).json({
          error: 'Password must be at least 6 characters long'
        })
      }
      const saltRounds = 10
      user.passwordHash = await bcrypt.hash(password, saltRounds)
      // Clear all tokens on password change
      user.tokens = []
    }

    await user.save()

    response.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive
        }
      }
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({
        error: error.message
      })
    }
    response.status(500).json({
      error: 'Failed to update user'
    })
  }
})

// PATCH /api/users/:id/role - Update user role (Admin only)
usersRouter.patch('/:id/role', userExtractor, isAdmin, async (request, response) => {
  const { role } = request.body

  const validRoles = ['admin', 'user', 'employee']

  if (!role || !validRoles.includes(role)) {
    return response.status(400).json({
      error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
    })
  }

  try {
    const user = await User.findByIdAndUpdate(
      request.params.id,
      { role },
      { new: true }
    ).select('-passwordHash -tokens')

    if (!user) {
      return response.status(404).json({
        error: 'User not found'
      })
    }

    response.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    })
  } catch (error) {
    response.status(500).json({
      error: 'Failed to update user role'
    })
  }
})

// PATCH /api/users/:id/status - Activate/deactivate user (Admin only)
usersRouter.patch('/:id/status', userExtractor, isAdmin, async (request, response) => {
  const { isActive } = request.body

  if (typeof isActive !== 'boolean') {
    return response.status(400).json({
      error: 'isActive must be a boolean'
    })
  }

  try {
    const user = await User.findById(request.params.id)

    if (!user) {
      return response.status(404).json({
        error: 'User not found'
      })
    }

    // Prevent admin from deactivating themselves
    if (request.user._id.toString() === user._id.toString() && !isActive) {
      return response.status(400).json({
        error: 'You cannot deactivate your own account'
      })
    }

    user.isActive = isActive
    // Clear tokens if deactivating
    if (!isActive) {
      user.tokens = []
    }
    await user.save()

    response.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive
        }
      }
    })
  } catch (error) {
    response.status(500).json({
      error: 'Failed to update user status'
    })
  }
})

// DELETE /api/users/:id - Delete user (Admin only)
usersRouter.delete('/:id', userExtractor, isAdmin, async (request, response) => {
  try {
    const user = await User.findById(request.params.id)

    if (!user) {
      return response.status(404).json({
        error: 'User not found'
      })
    }

    // Prevent admin from deleting themselves
    if (request.user._id.toString() === user._id.toString()) {
      return response.status(400).json({
        error: 'You cannot delete your own account'
      })
    }

    await User.findByIdAndDelete(request.params.id)

    response.status(200).json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return response.status(400).json({
        error: 'Invalid user ID'
      })
    }
    response.status(500).json({
      error: 'Failed to delete user'
    })
  }
})

module.exports = usersRouter
