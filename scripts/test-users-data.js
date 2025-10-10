/**
 * Test Script: Verify Users API and Data
 * 
 * This script helps debug why UserList is not displaying data
 * 
 * Run this in backend directory to test the API directly
 */

require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/user')
const Role = require('../models/role')
const Department = require('../models/department')

const MONGODB_URI = process.env.MONGODB_URI

const testUsersData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    console.log('\n📋 Testing User Data with Population...')
    console.log('='.repeat(60))

    // Test 1: Get all users with populated role and department
    const users = await User.find()
      .populate('role', 'roleId roleName')
      .populate('department', 'departmentId departmentName')
      .select('-passwordHash -tokens')
      .limit(5)

    console.log(`\n📊 Found ${users.length} users (showing first 5):`)
    console.log('='.repeat(60))

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User Details:`)
      console.log(`   ID: ${user._id}`)
      console.log(`   User Code: ${user.userCode}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Full Name: ${user.fullName}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role ? `${user.role.roleName} (${user.role.roleId})` : 'NOT POPULATED'}`)
      console.log(`   Department: ${user.department ? `${user.department.departmentName} (${user.department.departmentId})` : 'NOT POPULATED'}`)
      console.log(`   Active: ${user.isActive}`)
      console.log(`   Last Login: ${user.lastLogin || 'Never'}`)
    })

    // Test 2: Check for users without role
    console.log('\n\n📋 Checking for data integrity...')
    console.log('='.repeat(60))

    const usersWithoutRole = await User.countDocuments({ role: null })
    const usersWithoutDept = await User.countDocuments({ department: null })
    const totalUsers = await User.countDocuments()

    console.log(`Total Users: ${totalUsers}`)
    console.log(`Users without Role: ${usersWithoutRole}`)
    console.log(`Users without Department: ${usersWithoutDept}`)

    // Test 3: Check roles
    const roles = await Role.find()
    console.log(`\n📊 Available Roles: ${roles.length}`)
    roles.forEach(role => {
      console.log(`   - ${role.roleName} (${role.roleId})`)
    })

    // Test 4: Check departments
    const departments = await Department.find()
    console.log(`\n📊 Available Departments: ${departments.length}`)
    departments.forEach(dept => {
      console.log(`   - ${dept.departmentName} (${dept.departmentId})`)
    })

    // Test 5: Format as API would return
    console.log('\n\n📋 API Response Format Test:')
    console.log('='.repeat(60))

    const formattedUsers = users.map(user => ({
      id: user.id || user._id.toString(),
      userCode: user.userCode,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      roleName: user.role?.roleName || 'N/A',
      roleId: user.role?.roleId || null,
      departmentName: user.department?.departmentName || 'N/A',
      departmentId: user.department?.departmentId || null,
      isActive: user.isActive,
      lastLogin: user.lastLogin || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))

    console.log('First user formatted:')
    console.log(JSON.stringify(formattedUsers[0], null, 2))

    console.log('\n' + '='.repeat(60))
    console.log('✅ All tests completed!')
    console.log('='.repeat(60))

    await mongoose.connection.close()
    console.log('\n🔌 Database connection closed.')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

console.log('🚀 Starting User Data Verification...')
console.log('='.repeat(60))
testUsersData()
