const mongoose = require('mongoose')
const config = require('./config')
const logger = require('./logger')
const seedRolesAndDepartments = require('./seedRolesAndDepartments')
const migrateUsersRole = require('./migrateUsersRole')
const { seedDefaultAdmin } = require('./seedAdmin')

/**
 * Complete setup script for new installations or migrations
 * This will:
 * 1. Seed roles and departments
 * 2. Migrate existing users (if any)
 * 3. Create default admin (if needed)
 */
const completeSetup = async () => {
  let isConnected = false

  try {
    logger.info('========================================')
    logger.info('Starting Complete Setup & Migration')
    logger.info('========================================\n')

    // Connect to MongoDB once
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.MONGODB_URI)
      isConnected = true
      logger.info('✓ Connected to MongoDB\n')
    }

    // Step 1: Seed roles and departments (don't let it close connection)
    logger.info('STEP 1: Seeding Roles and Departments')
    logger.info('----------------------------------------')

    const Role = require('../models/role')
    const Department = require('../models/department')

    // Inline seeding to avoid connection issues
    const defaultRoles = [
      {
        roleId: 'ADMIN',
        roleName: 'Administrator',
        description: 'Full system access with all administrative privileges',
        permissions: ['users.read', 'users.write', 'users.delete', 'roles.read', 'roles.write', 'roles.delete', 'departments.read', 'departments.write', 'departments.delete', 'products.read', 'products.write', 'products.delete', 'orders.read', 'orders.write', 'orders.delete', 'customers.read', 'customers.write', 'customers.delete', 'suppliers.read', 'suppliers.write', 'suppliers.delete', 'inventory.read', 'inventory.write', 'reports.read', 'reports.write', 'settings.manage'],
        isActive: true
      },
      { roleId: 'MANAGER', roleName: 'Manager', description: 'Department manager with team oversight', permissions: ['users.read', 'departments.read', 'products.read', 'products.write', 'orders.read', 'orders.write', 'customers.read', 'customers.write', 'suppliers.read', 'inventory.read', 'inventory.write', 'reports.read'], isActive: true },
      { roleId: 'EMPLOYEE', roleName: 'Employee', description: 'Regular employee with basic access', permissions: ['products.read', 'products.write', 'orders.read', 'orders.write', 'customers.read', 'inventory.read', 'reports.read'], isActive: true },
      { roleId: 'USER', roleName: 'Customer', description: 'Regular customer', permissions: ['products.read', 'orders.read', 'profile.manage'], isActive: true }
    ]

    for (const roleData of defaultRoles) {
      const existing = await Role.findOne({ roleId: roleData.roleId })
      if (!existing) {
        await Role.create(roleData)
        logger.info(`✓ Created role: ${roleData.roleId}`)
      } else {
        logger.info(`  Role ${roleData.roleId} exists`)
      }
    }

    const defaultDepartments = [
      { departmentId: 'IT', departmentName: 'Information Technology', description: 'IT infrastructure and support', location: 'Floor 3, Building A', phone: '0123456789', email: 'it@company.com', isActive: true },
      { departmentId: 'HR', departmentName: 'Human Resources', description: 'Employee management', location: 'Floor 2, Building A', phone: '0123456790', email: 'hr@company.com', isActive: true },
      { departmentId: 'SALES', departmentName: 'Sales Department', description: 'Customer relations and sales', location: 'Floor 1, Building B', phone: '0123456791', email: 'sales@company.com', isActive: true },
      { departmentId: 'FIN', departmentName: 'Finance', description: 'Financial management', location: 'Floor 2, Building B', phone: '0123456792', email: 'finance@company.com', isActive: true },
      { departmentId: 'OPS', departmentName: 'Operations', description: 'Daily operations', location: 'Floor 1, Building A', phone: '0123456793', email: 'operations@company.com', isActive: true },
      { departmentId: 'MKT', departmentName: 'Marketing', description: 'Marketing and branding', location: 'Floor 3, Building B', phone: '0123456794', email: 'marketing@company.com', isActive: true }
    ]

    for (const deptData of defaultDepartments) {
      const existing = await Department.findOne({ departmentId: deptData.departmentId })
      if (!existing) {
        await Department.create(deptData)
        logger.info(`✓ Created department: ${deptData.departmentId}`)
      } else {
        logger.info(`  Department ${deptData.departmentId} exists`)
      }
    }
    logger.info('')

    // Step 2: Migrate existing users
    logger.info('STEP 2: Migrating Existing Users')
    logger.info('----------------------------------------')
    const User = require('../models/user')
    const roles = await Role.find({})
    const roleMapping = { 'admin': null, 'manager': null, 'employee': null, 'user': null }
    roles.forEach(role => { roleMapping[role.roleId.toLowerCase()] = role._id })

    const usersToMigrate = await User.find({ role: { $type: 'string' } })
    logger.info(`Found ${usersToMigrate.length} users to migrate`)

    let successCount = 0
    for (const user of usersToMigrate) {
      const oldRole = user.role.toLowerCase()
      const newRoleId = roleMapping[oldRole]
      if (newRoleId) {
        await User.updateOne({ _id: user._id }, { $set: { role: newRoleId } })
        logger.info(`  ✓ Migrated ${user.username}: ${oldRole} → ObjectId`)
        successCount++
      }
    }
    logger.info(`✓ Successfully migrated ${successCount} users\n`)

    // Step 3: Create default admin if needed
    logger.info('STEP 3: Creating Default Admin')
    logger.info('----------------------------------------')
    const adminResult = await seedDefaultAdmin()
    if (adminResult.created) {
      logger.info(`✓ Default admin created: ${adminResult.credentials.username}`)
    } else {
      logger.info(`✓ ${adminResult.message}`)
    }
    logger.info('')

    // Close connection
    if (isConnected) {
      await mongoose.connection.close()
      logger.info('✓ Database connection closed\n')
    }

    // Final summary
    logger.info('========================================')
    logger.info('Setup Complete!')
    logger.info('========================================')
    logger.info('\nYour system is now ready to use.')
    logger.info('\nNext steps:')
    logger.info('1. Start your server: npm run dev')
    logger.info('2. Login with: admin / admin123')
    logger.info('3. Change the admin password')
    logger.info('4. Create additional users as needed')
    logger.info('\nFor more information, see MIGRATION_GUIDE.md')
    logger.info('========================================\n')

  } catch (error) {
    logger.error('Setup failed:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  completeSetup()
}

module.exports = completeSetup
