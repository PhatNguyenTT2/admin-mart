const mongoose = require('mongoose')
const Role = require('../models/role')
const Department = require('../models/department')
const config = require('../utils/config')

const setupRolesAndDepartments = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(config.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if roles already exist
    const existingRoles = await Role.find()
    if (existingRoles.length > 0) {
      console.log('Roles already exist in database:')
      existingRoles.forEach(role => {
        console.log(`  - ${role.roleId}: ${role.roleName}`)
      })

      const existingDepts = await Department.find()
      if (existingDepts.length > 0) {
        console.log('\nDepartments already exist in database:')
        existingDepts.forEach(dept => {
          console.log(`  - ${dept.departmentId}: ${dept.departmentName}`)
        })
      }

      console.log('\nSetup already completed. Exiting...')
      await mongoose.connection.close()
      return
    }

    console.log('\nCreating default roles...')

    // Create ADMIN role
    const adminRole = new Role({
      roleId: 'ADMIN',
      roleName: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: [
        'manage_users',
        'manage_roles',
        'manage_departments',
        'manage_products',
        'manage_categories',
        'manage_inventory',
        'manage_orders',
        'manage_payments',
        'manage_customers',
        'manage_suppliers',
        'manage_purchase_orders',
        'view_reports',
        'manage_settings'
      ],
      isActive: true
    })
    await adminRole.save()
    console.log('✓ Created ADMIN role')

    // Create MANAGER role
    const managerRole = new Role({
      roleId: 'MANAGER',
      roleName: 'Manager',
      description: 'Can manage products, inventory, orders and view reports',
      permissions: [
        'manage_products',
        'manage_categories',
        'manage_inventory',
        'manage_orders',
        'manage_payments',
        'manage_customers',
        'manage_suppliers',
        'manage_purchase_orders',
        'view_reports'
      ],
      isActive: true
    })
    await managerRole.save()
    console.log('✓ Created MANAGER role')

    // Create STAFF role
    const staffRole = new Role({
      roleId: 'STAFF',
      roleName: 'Staff',
      description: 'Can process orders and manage basic inventory',
      permissions: [
        'manage_orders',
        'manage_inventory',
        'manage_customers',
        'view_products'
      ],
      isActive: true
    })
    await staffRole.save()
    console.log('✓ Created STAFF role')

    console.log('\nCreating default departments...')

    // Create GENERAL department
    const generalDept = new Department({
      departmentId: 'GENERAL',
      departmentName: 'General',
      description: 'Default department for general staff',
      isActive: true
    })
    await generalDept.save()
    console.log('✓ Created GENERAL department')

    // Create SALES department
    const salesDept = new Department({
      departmentId: 'SALES',
      departmentName: 'Sales',
      description: 'Sales and customer service department',
      isActive: true
    })
    await salesDept.save()
    console.log('✓ Created SALES department')

    // Create WAREHOUSE department
    const warehouseDept = new Department({
      departmentId: 'WAREHOUSE',
      departmentName: 'Warehouse',
      description: 'Inventory and warehouse management',
      isActive: true
    })
    await warehouseDept.save()
    console.log('✓ Created WAREHOUSE department')

    console.log('\n✅ Setup completed successfully!')
    console.log('\nYou can now register admin users.')

    await mongoose.connection.close()
    console.log('\nDatabase connection closed.')
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close()
    }
    process.exit(1)
  }
}

// Run setup
setupRolesAndDepartments()
