const ordersRouter = require('express').Router()
const Order = require('../models/order')
const Product = require('../models/product')
const Inventory = require('../models/inventory')
const Payment = require('../models/payment')
const Customer = require('../models/customer')
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
      .populate('items.product', 'name image sku')
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
    const isAdmin = request.user.role && request.user.role.roleId === 'ADMIN'
    if (!isAdmin &&
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
ordersRouter.post('/', userExtractor, async (request, response) => {
  const {
    customer,
    deliveryType = 'delivery',
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

  // Validate delivery type
  if (deliveryType && !['delivery', 'pickup'].includes(deliveryType)) {
    return response.status(400).json({
      error: 'Invalid delivery type. Must be "delivery" or "pickup"'
    })
  }

  try {
    // Verify products exist and calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.product)

      if (!product) {
        return response.status(400).json({
          error: `Product not found: ${item.product}`
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

      // NOTE: Do NOT reduce stock immediately when order is created
      // Stock will be reserved instead (see below)
      // Stock will only be deducted when order is shipped
    }

    // Find customer to determine discount and customer type
    let customerType = 'retail'
    let discountPercentage = 0
    let discount = 0
    let isWalkIn = false

    try {
      const existingCustomer = await Customer.findOne({ email: customer.email })
      if (existingCustomer) {
        customerType = existingCustomer.customerType
      } else {
        // New customer or walk-in (not in database)
        isWalkIn = true
      }
    } catch (err) {
      // If customer lookup fails, default to retail walk-in
      console.log('Customer lookup failed, defaulting to retail walk-in')
      isWalkIn = true
    }

    // Calculate discount based on customer type
    // Walk-in: No discount (will have shipping fee if delivery)
    // Retail: freeship only (0% discount)
    // Wholesale: freeship + 10% discount
    // VIP: freeship + 15% discount
    if (customerType === 'wholesale') {
      discountPercentage = 10
      discount = subtotal * 0.10
    } else if (customerType === 'vip') {
      discountPercentage = 15
      discount = subtotal * 0.15
    }

    // Calculate shipping fee
    // Walk-in customers: pay shipping fee if delivery ($10)
    // Existing customers (retail/wholesale/vip): free shipping
    // Pickup: always free
    let shippingFee = 0
    if (deliveryType === 'delivery' && isWalkIn) {
      shippingFee = 10 // $10 shipping fee for walk-in customers
    }

    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal - discount + shippingFee + tax

    // Create order
    const order = new Order({
      customer,
      user: request.user._id, // User is required (from userExtractor middleware)
      deliveryType: deliveryType || 'delivery',
      shippingAddress: deliveryType === 'delivery' ? shippingAddress : undefined, // Only include if delivery
      items: orderItems,
      subtotal,
      shippingFee,
      tax,
      discount,
      discountType: customerType,
      discountPercentage,
      total,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending',
      status: 'pending',
      customerNote
    })

    const savedOrder = await order.save()
    await savedOrder.populate('items.product', 'name image sku')

    // Reserve stock for each item in the order
    try {
      console.log('Starting stock reservation for order:', savedOrder.orderNumber)

      for (const item of orderItems) {
        let inventory = await Inventory.findOne({ product: item.product })

        if (!inventory) {
          console.log('Creating new inventory for product:', item.product)
          // Create inventory if doesn't exist - get stock from product
          const product = await Product.findById(item.product)
          if (!product) {
            throw new Error(`Product not found: ${item.product}`)
          }

          inventory = new Inventory({
            product: item.product,
            quantityOnHand: product.stock || 0,
            reorderPoint: 10,
            reorderQuantity: 50
          })
          await inventory.save()
          console.log('New inventory created with stock:', product.stock)
        }

        // Check if enough available stock
        if (inventory.quantityAvailable < item.quantity) {
          throw new Error(`Insufficient available stock for ${item.productName}`)
        }

        // Reserve stock
        inventory.quantityReserved += item.quantity
        inventory.movements.push({
          type: 'reserved',
          quantity: item.quantity,
          reason: 'Order created - stock reserved',
          referenceType: 'order',
          referenceId: savedOrder.orderNumber, // Use orderNumber instead of _id
          performedBy: request.user._id,
          date: new Date()
        })

        await inventory.save()
        console.log('Stock reserved for product:', item.productName, 'Quantity:', item.quantity)
      }

      console.log('Creating payment record for order:', savedOrder.orderNumber)

      // Find customer if exists
      let customerId = undefined
      if (customer.email) {
        try {
          const existingCustomer = await Customer.findOne({ email: customer.email })
          customerId = existingCustomer?._id
        } catch (err) {
          console.log('Customer lookup failed, proceeding without customer reference')
        }
      }

      // Automatically create payment record for this order
      const payment = new Payment({
        paymentType: 'sales',
        relatedOrderId: savedOrder._id,
        relatedOrderNumber: savedOrder.orderNumber,
        amount: total,
        paymentMethod: paymentMethod || 'cash',
        paymentDate: new Date(),
        status: 'pending', // Will be updated when payment is confirmed
        notes: `Auto-created payment for order ${savedOrder.orderNumber}. Customer: ${customer.name}`,
        receivedBy: request.user._id,
        customer: customerId
      })

      await payment.save()
      console.log('Payment record created successfully:', payment._id)

    } catch (reserveError) {
      console.error('Error during stock reservation or payment creation:', reserveError)
      // If reservation or payment creation fails, delete the order and return error
      await Order.findByIdAndDelete(savedOrder._id)
      return response.status(400).json({
        error: reserveError.message || 'Failed to reserve stock or create payment'
      })
    }

    response.status(201).json({
      success: true,
      message: 'Order created successfully with stock reserved and payment record created',
      data: { order: savedOrder }
    })
  } catch (error) {
    console.error('Error creating order:', error)
    console.error('Error stack:', error.stack)

    if (error.name === 'ValidationError') {
      return response.status(400).json({
        error: error.message
      })
    }
    response.status(500).json({
      error: 'Failed to create order',
      details: error.message
    })
  }
})

// PUT /api/orders/:id - Update order (Admin only)
ordersRouter.put('/:id', userExtractor, isAdmin, async (request, response) => {
  const {
    customer,
    deliveryType,
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
    // Find existing order
    const order = await Order.findById(request.params.id)

    if (!order) {
      return response.status(404).json({
        error: 'Order not found'
      })
    }

    // Only allow editing if order status is 'pending' or 'processing'
    if (!['pending', 'processing'].includes(order.status)) {
      return response.status(400).json({
        error: 'Cannot edit order that has been shipped, delivered, or cancelled'
      })
    }

    // Release old reserved stock
    for (const oldItem of order.items) {
      const inventory = await Inventory.findOne({ product: oldItem.product })
      if (inventory && inventory.quantityReserved >= oldItem.quantity) {
        inventory.quantityReserved -= oldItem.quantity
        inventory.movements.push({
          type: 'released',
          quantity: oldItem.quantity,
          reason: 'Order updated - old reservation released',
          referenceType: 'order',
          referenceId: order.orderNumber,
          performedBy: request.user._id,
          date: new Date()
        })
        await inventory.save()
      }
    }

    // Verify products and calculate new totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.product)

      if (!product) {
        return response.status(400).json({
          error: `Product not found: ${item.product}`
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
    }

    // Find customer to determine discount
    let customerType = 'retail'
    let discountPercentage = 0
    let discount = 0
    let isWalkIn = false

    try {
      const existingCustomer = await Customer.findOne({ email: customer.email })
      if (existingCustomer) {
        customerType = existingCustomer.customerType
      } else {
        isWalkIn = true
      }
    } catch (err) {
      isWalkIn = true
    }

    // Calculate discount
    if (customerType === 'wholesale') {
      discountPercentage = 10
      discount = subtotal * 0.10
    } else if (customerType === 'vip') {
      discountPercentage = 15
      discount = subtotal * 0.15
    }

    // Calculate shipping fee
    let shippingFee = 0
    if (deliveryType === 'delivery' && isWalkIn) {
      shippingFee = 10
    }

    const tax = subtotal * 0.1
    const total = subtotal - discount + shippingFee + tax

    // Update order
    order.customer = customer
    order.deliveryType = deliveryType || 'delivery'
    order.shippingAddress = deliveryType === 'delivery' ? shippingAddress : undefined
    order.items = orderItems
    order.subtotal = subtotal
    order.shippingFee = shippingFee
    order.tax = tax
    order.discount = discount
    order.discountType = customerType
    order.discountPercentage = discountPercentage
    order.total = total
    order.paymentMethod = paymentMethod || 'cash'
    order.customerNote = customerNote

    await order.save()

    // Reserve new stock
    for (const item of orderItems) {
      let inventory = await Inventory.findOne({ product: item.product })

      if (!inventory) {
        inventory = new Inventory({
          product: item.product,
          quantityOnHand: 0,
          reorderPoint: 10,
          reorderQuantity: 50
        })
      }

      if (inventory.quantityAvailable < item.quantity) {
        throw new Error(`Insufficient available stock for ${item.productName}`)
      }

      inventory.quantityReserved += item.quantity
      inventory.movements.push({
        type: 'reserved',
        quantity: item.quantity,
        reason: 'Order updated - stock reserved',
        referenceType: 'order',
        referenceId: order.orderNumber,
        performedBy: request.user._id,
        date: new Date()
      })

      await inventory.save()
    }

    // Update payment record
    const payment = await Payment.findOne({ relatedOrderId: order._id })
    if (payment) {
      payment.amount = total
      payment.paymentMethod = paymentMethod || 'cash'
      payment.notes = `Updated payment for order ${order.orderNumber}. Customer: ${customer.name}`
      await payment.save()
    }

    await order.populate('items.product', 'name image sku')

    response.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: { order }
    })
  } catch (error) {
    console.error('Error updating order:', error)
    response.status(500).json({
      error: error.message || 'Failed to update order'
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

        // Stock out: Actually deduct from inventory when shipping
        for (const item of order.items) {
          let inventory = await Inventory.findOne({ product: item.product })

          if (!inventory) {
            throw new Error(`Inventory not found for product ${item.productName}`)
          }

          // Deduct from on hand
          inventory.quantityOnHand -= item.quantity

          // Release from reserved
          if (inventory.quantityReserved >= item.quantity) {
            inventory.quantityReserved -= item.quantity
          }

          // Add stock-out movement
          inventory.movements.push({
            type: 'out',
            quantity: item.quantity,
            reason: 'Order shipped to customer',
            referenceType: 'order',
            referenceId: order._id.toString(),
            performedBy: request.user.id,
            date: new Date()
          })

          inventory.lastSold = new Date()
          await inventory.save()

          // Sync Product.stock
          const product = await Product.findById(item.product)
          if (product) {
            product.stock = inventory.quantityOnHand
            await product.save()
          }
        }
        break

      case 'delivered':
        order.deliveredAt = new Date()
        order.paymentStatus = 'paid'
        order.paidAt = new Date()
        break

      case 'cancelled':
        order.cancelledAt = new Date()

        // Release reserved stock (do NOT add back to onHand)
        for (const item of order.items) {
          let inventory = await Inventory.findOne({ product: item.product })

          if (inventory && inventory.quantityReserved >= item.quantity) {
            inventory.quantityReserved -= item.quantity

            inventory.movements.push({
              type: 'released',
              quantity: item.quantity,
              reason: 'Order cancelled - stock released',
              referenceType: 'order',
              referenceId: order._id.toString(),
              performedBy: request.user.id,
              date: new Date()
            })

            await inventory.save()
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

// DELETE /api/orders/:id - Delete an order (Admin only)
// Only allows deletion of orders with specific payment statuses
ordersRouter.delete('/:id', userExtractor, isAdmin, async (request, response) => {
  try {
    const orderId = request.params.id

    // Find the order
    const order = await Order.findById(orderId)

    if (!order) {
      return response.status(404).json({
        error: 'Order not found'
      })
    }

    // Validation: Only allow deletion of orders with specific payment statuses
    const allowedPaymentStatuses = ['paid', 'failed', 'refunded']

    if (!allowedPaymentStatuses.includes(order.paymentStatus.toLowerCase())) {
      return response.status(400).json({
        error: `Cannot delete order with payment status '${order.paymentStatus}'. Only orders with payment status 'Paid', 'Failed', or 'Refunded' can be deleted.`
      })
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId)

    response.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: { id: orderId }
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    response.status(500).json({
      error: 'Failed to delete order'
    })
  }
})

module.exports = ordersRouter
