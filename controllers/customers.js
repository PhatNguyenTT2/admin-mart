const customersRouter = require('express').Router()
const Customer = require('../models/customer')
const Order = require('../models/order')
const { userExtractor } = require('../utils/auth')

// GET /api/customers - Get all customers with filtering, sorting, and pagination
customersRouter.get('/', async (request, response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      customerType,
      isActive,
      search
    } = request.query

    // Build filter object
    const filter = {}

    if (customerType) {
      filter.customerType = customerType
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true'
    }

    // Search by name, email, phone, or customer code
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { customerCode: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const customers = await Customer
      .find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)

    const total = await Customer.countDocuments(filter)

    response.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/customers/stats - Get customer statistics
customersRouter.get('/stats', async (request, response) => {
  try {
    const totalCustomers = await Customer.countDocuments()
    const activeCustomers = await Customer.countDocuments({ isActive: true })
    const vipCustomers = await Customer.countDocuments({ customerType: 'vip' })
    const wholesaleCustomers = await Customer.countDocuments({ customerType: 'wholesale' })
    const retailCustomers = await Customer.countDocuments({ customerType: 'retail' })

    // Top customers by total spent
    const topCustomers = await Customer
      .find()
      .sort('-totalSpent')
      .limit(10)
      .select('customerCode fullName totalSpent totalPurchases')

    response.json({
      totalCustomers,
      activeCustomers,
      vipCustomers,
      wholesaleCustomers,
      retailCustomers,
      topCustomers
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/customers/:id - Get customer by ID
customersRouter.get('/:id', async (request, response) => {
  try {
    const customer = await Customer.findById(request.params.id)

    if (!customer) {
      return response.status(404).json({ error: 'Customer not found' })
    }

    response.json(customer)
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/customers/:id/orders - Get customer orders
customersRouter.get('/:id/orders', async (request, response) => {
  try {
    const { page = 1, limit = 10, status } = request.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const filter = { 'customer.customerId': request.params.id }
    if (status) {
      filter.status = status
    }

    const orders = await Order
      .find(filter)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip)
      .populate('items.product')

    const total = await Order.countDocuments(filter)

    response.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// POST /api/customers - Create new customer
customersRouter.post('/', userExtractor, async (request, response) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      customerType,
      notes
    } = request.body

    // Validate required fields
    if (!fullName || !phone) {
      return response.status(400).json({
        error: 'Full name and phone are required'
      })
    }

    // Check if email already exists
    if (email) {
      const existingCustomer = await Customer.findOne({ email })
      if (existingCustomer) {
        return response.status(400).json({
          error: 'Email already exists'
        })
      }
    }

    const customer = new Customer({
      fullName,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      customerType,
      notes
    })

    const savedCustomer = await customer.save()
    response.status(201).json(savedCustomer)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PUT /api/customers/:id - Update customer
customersRouter.put('/:id', userExtractor, async (request, response) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      customerType,
      notes,
      isActive
    } = request.body

    const customer = await Customer.findById(request.params.id)

    if (!customer) {
      return response.status(404).json({ error: 'Customer not found' })
    }

    // Check if email is being changed and if it already exists
    if (email && email !== customer.email) {
      const existingCustomer = await Customer.findOne({ email })
      if (existingCustomer) {
        return response.status(400).json({
          error: 'Email already exists'
        })
      }
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      request.params.id,
      {
        fullName,
        email,
        phone,
        address,
        dateOfBirth,
        gender,
        customerType,
        notes,
        isActive
      },
      { new: true, runValidators: true }
    )

    response.json(updatedCustomer)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PUT /api/customers/:id/loyalty/add - Add loyalty points
customersRouter.put('/:id/loyalty/add', userExtractor, async (request, response) => {
  try {
    const { points } = request.body

    if (!points || points <= 0) {
      return response.status(400).json({
        error: 'Points must be a positive number'
      })
    }

    const customer = await Customer.findById(request.params.id)

    if (!customer) {
      return response.status(404).json({ error: 'Customer not found' })
    }

    await customer.addLoyaltyPoints(points)

    response.json({
      message: 'Loyalty points added successfully',
      loyaltyPoints: customer.loyaltyPoints
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PUT /api/customers/:id/loyalty/redeem - Redeem loyalty points
customersRouter.put('/:id/loyalty/redeem', userExtractor, async (request, response) => {
  try {
    const { points } = request.body

    if (!points || points <= 0) {
      return response.status(400).json({
        error: 'Points must be a positive number'
      })
    }

    const customer = await Customer.findById(request.params.id)

    if (!customer) {
      return response.status(404).json({ error: 'Customer not found' })
    }

    await customer.redeemLoyaltyPoints(points)

    response.json({
      message: 'Loyalty points redeemed successfully',
      loyaltyPoints: customer.loyaltyPoints
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// DELETE /api/customers/:id - Delete customer (soft delete by default)
customersRouter.delete('/:id', userExtractor, async (request, response) => {
  try {
    const { permanent = false } = request.query

    const customer = await Customer.findById(request.params.id)

    if (!customer) {
      return response.status(404).json({ error: 'Customer not found' })
    }

    if (permanent === 'true') {
      // Permanent delete
      await Customer.findByIdAndDelete(request.params.id)
      response.json({ message: 'Customer deleted permanently' })
    } else {
      // Soft delete
      customer.isActive = false
      await customer.save()
      response.json({ message: 'Customer deactivated successfully' })
    }
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

module.exports = customersRouter
