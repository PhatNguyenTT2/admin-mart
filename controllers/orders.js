const ordersRouter = require('express').Router()
const Order = require('../models/order')
const Product = require('../models/product')
const { userExtractor, isAdmin } = require('../utils/auth')

// GET /api/orders - Get all orders (Admin only)
ordersRouter.get('/', userExtractor, isAdmin, async (request, response) => {
  try {
    const {
      page = 1,
      per_page = 20,
      status,
      payment_status,
      sort_by = 'newest'
    } = request.query

    // Build filter
    const filter = {}
    if (status) filter.status = status
    if (payment_status) filter.paymentStatus = payment_status

    // Sort options
    let sort = {}
    switch (sort_by) {
      case 'newest':
        sort = { createdAt: -1 }
        break
      case 'oldest':
        sort = { createdAt: 1 }
        break
      case 'total_high':
        sort = { total: -1 }
        break
      case 'total_low':
        sort = { total: 1 }
        break
      default:
        sort = { createdAt: -1 }
    }

    // Pagination
    const pageNum = parseInt(page)
    const perPage = parseInt(per_page)
    const skip = (pageNum - 1) * perPage

    // Execute query
    const orders = await Order.find(filter)
      .populate('user', 'username email fullName')
      .populate('items.product', 'name image')
      .sort(sort)
      .skip(skip)
      .limit(perPage)

    // Get total count
    const total = await Order.countDocuments(filter)
    const totalPages = Math.ceil(total / perPage)

    response.status(200).json({
      success: true,
      data: {
        orders,
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
      error: 'Failed to fetch orders'
    })
  }
})

// GET /api/orders/:id - Get single order
ordersRouter.get('/:id', userExtractor, async (request, response) => {
  try {
    const order = await Order.findById(request.params.id)
      .populate('user', 'username email fullName')
      .populate('items.product', 'name image sku')

    if (!order) {
      return response.status(404).json({
        error: 'Order not found'
      })
    }

    // Check access: Admin can see all, users can only see their own
    if (request.user.role !== 'admin' &&
      (!order.user || order.user._id.toString() !== request.user._id.toString())) {
      return response.status(403).json({
        error: 'Access denied'
      })
    }

    response.status(200).json({
      success: true,
      data: { order }
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return response.status(400).json({
        error: 'Invalid order ID'
      })
    }
    response.status(500).json({
      error: 'Failed to fetch order'
    })
  }
})

// GET /api/orders/user/my-orders - Get current user's orders
ordersRouter.get('/user/my-orders', userExtractor, async (request, response) => {
  try {
    const { page = 1, per_page = 10 } = request.query

    const pageNum = parseInt(page)
    const perPage = parseInt(per_page)
    const skip = (pageNum - 1) * perPage

    const orders = await Order.find({ user: request.user._id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)

    const total = await Order.countDocuments({ user: request.user._id })
    const totalPages = Math.ceil(total / perPage)

    response.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          current_page: pageNum,
          per_page: perPage,
          total,
          total_pages: totalPages
        }
      }
    })
  } catch (error) {
    response.status(500).json({
      error: 'Failed to fetch orders'
    })
  }
})

// POST /api/orders - Create new order
ordersRouter.post('/', async (request, response) => {
  const {
    customer,
    shippingAddress,
    items,
    paymentMethod,
    customerNote
  } = request.body

  // Validation
  if (!customer || !customer.name || !customer.email || !customer.phone) {
    return response.status(400).json({
      error: 'Customer information is required (name, email, phone)'
    })
  }

  if (!items || items.length === 0) {
    return response.status(400).json({
      error: 'Order must contain at least one item'
    })
  }

  try {
    // Verify products exist and calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId)

      if (!product) {
        return response.status(400).json({
          error: `Product not found: ${item.productId}`
        })
      }

      if (product.stock < item.quantity) {
        return response.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        })
      }

      const itemSubtotal = product.price * item.quantity

      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      })

      subtotal += itemSubtotal

      // Reduce stock
      product.stock -= item.quantity
      await product.save()
    }

    // Calculate shipping, tax, total
    const shippingFee = subtotal > 100 ? 0 : 10 // Free shipping over $100
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + shippingFee + tax

    // Create order
    const order = new Order({
      customer,
      user: request.user ? request.user._id : null, // Null for guest checkout
      shippingAddress,
      items: orderItems,
      subtotal,
      shippingFee,
      tax,
      total,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending',
      status: 'pending',
      customerNote
    })

    const savedOrder = await order.save()
    await savedOrder.populate('items.product', 'name image')

    response.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: savedOrder }
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({
        error: error.message
      })
    }
    response.status(500).json({
      error: 'Failed to create order'
    })
  }
})

// PATCH /api/orders/:id/status - Update order status (Admin only)
ordersRouter.patch('/:id/status', userExtractor, isAdmin, async (request, response) => {
  const { status } = request.body

  const validStatuses = ['pending', 'processing', 'shipping', 'delivered', 'cancelled']

  if (!status || !validStatuses.includes(status)) {
    return response.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    })
  }

  try {
    const order = await Order.findById(request.params.id)

    if (!order) {
      return response.status(404).json({
        error: 'Order not found'
      })
    }

    // Update status and timestamps
    order.status = status

    switch (status) {
      case 'processing':
        order.processingAt = new Date()
        break
      case 'shipping':
        order.shippedAt = new Date()
        break
      case 'delivered':
        order.deliveredAt = new Date()
        order.paymentStatus = 'paid'
        order.paidAt = new Date()
        break
      case 'cancelled':
        order.cancelledAt = new Date()
        // Restore stock
        for (const item of order.items) {
          const product = await Product.findById(item.product)
          if (product) {
            product.stock += item.quantity
            await product.save()
          }
        }
        break
    }

    await order.save()

    response.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    })
  } catch (error) {
    response.status(500).json({
      error: 'Failed to update order status'
    })
  }
})

// PATCH /api/orders/:id/payment - Update payment status (Admin only)
ordersRouter.patch('/:id/payment', userExtractor, isAdmin, async (request, response) => {
  const { paymentStatus } = request.body

  const validStatuses = ['pending', 'paid', 'failed', 'refunded']

  if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
    return response.status(400).json({
      error: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`
    })
  }

  try {
    const order = await Order.findById(request.params.id)

    if (!order) {
      return response.status(404).json({
        error: 'Order not found'
      })
    }

    order.paymentStatus = paymentStatus

    if (paymentStatus === 'paid') {
      order.paidAt = new Date()
    }

    await order.save()

    response.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: { order }
    })
  } catch (error) {
    response.status(500).json({
      error: 'Failed to update payment status'
    })
  }
})

// PUT /api/orders/:id/tracking - Update tracking number (Admin only)
ordersRouter.put('/:id/tracking', userExtractor, isAdmin, async (request, response) => {
  const { trackingNumber } = request.body

  if (!trackingNumber) {
    return response.status(400).json({
      error: 'Tracking number is required'
    })
  }

  try {
    const order = await Order.findByIdAndUpdate(
      request.params.id,
      { trackingNumber },
      { new: true }
    )

    if (!order) {
      return response.status(404).json({
        error: 'Order not found'
      })
    }

    response.status(200).json({
      success: true,
      message: 'Tracking number updated successfully',
      data: { order }
    })
  } catch (error) {
    response.status(500).json({
      error: 'Failed to update tracking number'
    })
  }
})

// GET /api/orders/stats/dashboard - Get order statistics (Admin only)
ordersRouter.get('/stats/dashboard', userExtractor, isAdmin, async (request, response) => {
  try {
    const totalOrders = await Order.countDocuments()
    const pendingOrders = await Order.countDocuments({ status: 'pending' })
    const processingOrders = await Order.countDocuments({ status: 'processing' })
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' })

    // Calculate total revenue (only from paid orders)
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ])

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0

    response.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        totalRevenue
      }
    })
  } catch (error) {
    response.status(500).json({
      error: 'Failed to fetch order statistics'
    })
  }
})

module.exports = ordersRouter
