const bcrypt = require('bcrypt')
const User = require('../models/user')
const logger = require('./logger')

/**
 * Create default admin account if no admin exists
 * Default credentials: admin / admin123
 */
const seedDefaultAdmin = async () => {
  try {
    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' })

    if (adminExists) {
      logger.info('Admin account already exists. Skipping seed.')
      return { created: false, message: 'Admin already exists' }
    }

    // Create default admin
    const saltRounds = 10
    const passwordHash = await bcrypt.hash('admin123', saltRounds)

    const defaultAdmin = new User({
      username: 'admin',
      email: 'admin@example.com',
      fullName: 'Default Admin',
      passwordHash,
      role: 'admin',
      isActive: true
    })

    await defaultAdmin.save()

    logger.info('✅ Default admin account created successfully')
    logger.info('   Username: admin')
    logger.info('   Password: admin123')
    logger.info('   ⚠️  IMPORTANT: Please change the password after first login!')

    return {
      created: true,
      message: 'Default admin created',
      credentials: {
        username: 'admin',
        password: 'admin123'
      }
    }
  } catch (error) {
    logger.error('Error creating default admin:', error.message)

    // If username/email already exists, it's okay
    if (error.code === 11000) {
      logger.info('Admin user already exists in database')
      return { created: false, message: 'Admin already exists' }
    }

    throw error
  }
}

module.exports = { seedDefaultAdmin }
