const purchaseOrdersRouter = require('express').Router()
const PurchaseOrder = require('../models/purchaseOrder')
const Supplier = require('../models/supplier')
const Product = require('../models/product')
const Payment = require('../models/payment')
const { userExtractor } = require('../utils/auth')

// GET /api/purchase-orders - Get all purchase orders with filtering
purchaseOrdersRouter.get('/', userExtractor, async (request, response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      status,
      paymentStatus,
      supplier,
      startDate,
      endDate
    } = request.query

    // Build filter object
    const filter = {}

    if (status) {
      filter.status = status
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus
    }

    if (supplier) {
      filter.supplier = supplier
    }

    if (startDate || endDate) {
      filter.orderDate = {}
      if (startDate) filter.orderDate.$gte = new Date(startDate)
      if (endDate) filter.orderDate.$lte = new Date(endDate)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const purchaseOrders = await PurchaseOrder
      .find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('supplier', 'supplierCode companyName email phone')
      .populate('items.product', 'name sku')
      .populate('createdBy', 'username')
      .populate('approvedBy', 'username')
      .populate('receivedBy', 'username')

    const total = await PurchaseOrder.countDocuments(filter)

    response.json({
      purchaseOrders,
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

// GET /api/purchase-orders/stats - Get purchase order statistics
purchaseOrdersRouter.get('/stats', userExtractor, async (request, response) => {
  try {
    const totalPOs = await PurchaseOrder.countDocuments()
    const pendingPOs = await PurchaseOrder.countDocuments({ status: 'pending' })
    const approvedPOs = await PurchaseOrder.countDocuments({ status: 'approved' })
    const receivedPOs = await PurchaseOrder.countDocuments({ status: 'received' })

    // Total purchase amount
    const totalAmount = await PurchaseOrder.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])

    // Unpaid amount
    const unpaidAmount = await PurchaseOrder.aggregate([
      { $match: { paymentStatus: { $in: ['unpaid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: { $subtract: ['$total', '$paidAmount'] } } } }
    ])

    response.json({
      totalPOs,
      pendingPOs,
      approvedPOs,
      receivedPOs,
      totalAmount: totalAmount[0]?.total || 0,
      unpaidAmount: unpaidAmount[0]?.total || 0
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/purchase-orders/:id - Get purchase order by ID
purchaseOrdersRouter.get('/:id', userExtractor, async (request, response) => {
  try {
    const purchaseOrder = await PurchaseOrder
      .findById(request.params.id)
      .populate('supplier')
      .populate('items.product')
      .populate('createdBy', 'username email')
      .populate('approvedBy', 'username email')
      .populate('receivedBy', 'username email')

    if (!purchaseOrder) {
      return response.status(404).json({ error: 'Purchase order not found' })
    }

    response.json(purchaseOrder)
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// POST /api/purchase-orders - Create new purchase order
purchaseOrdersRouter.post('/', userExtractor, async (request, response) => {
  try {
    const {
      supplier,
      expectedDeliveryDate,
      items,
      shippingFee,
      tax,
      discount,
      notes
    } = request.body

    // Validate required fields
    if (!supplier || !items || items.length === 0) {
      return response.status(400).json({
        error: 'Supplier and items are required'
      })
    }

    // Verify supplier exists
    const supplierDoc = await Supplier.findById(supplier)
    if (!supplierDoc) {
      return response.status(404).json({ error: 'Supplier not found' })
    }

    // Verify all products exist and cache product info
    const enhancedItems = []
    for (const item of items) {
      const product = await Product.findById(item.product)
      if (!product) {
        return response.status(404).json({
          error: `Product ${item.product} not found`
        })
      }

      enhancedItems.push({
        ...item,
        productName: product.name,
        sku: product.sku
      })
    }

    const purchaseOrder = new PurchaseOrder({
      supplier,
      expectedDeliveryDate,
      items: enhancedItems,
      shippingFee: shippingFee || 0,
      tax: tax || 0,
      discount: discount || 0,
      notes,
      createdBy: request.user.id
    })

    const savedPurchaseOrder = await purchaseOrder.save()

    // Update supplier's current debt (add to debt when creating PO)
    try {
      await supplierDoc.addDebt(savedPurchaseOrder.total)
    } catch (debtError) {
      console.error('Error updating supplier debt:', debtError)
      // Continue even if debt update fails
    }

    // Auto-create payment for purchase order
    try {
      const payment = new Payment({
        paymentType: 'purchase',
        relatedOrderId: savedPurchaseOrder._id,
        relatedOrderNumber: savedPurchaseOrder.poNumber,
        amount: savedPurchaseOrder.total,
        paymentMethod: 'bank_transfer', // Default for purchase orders
        paymentDate: new Date(),
        status: 'pending', // Will be updated when payment is confirmed
        notes: `Auto-created payment for purchase order ${savedPurchaseOrder.poNumber}. Supplier: ${supplierDoc.companyName}`,
        receivedBy: request.user.id,
        supplier: supplierDoc._id
      })

      await payment.save()
    } catch (paymentError) {
      // Log error but don't fail the purchase order creation
      console.error('Error creating auto payment for purchase order:', paymentError)
    }

    // Populate before sending response
    await savedPurchaseOrder.populate('supplier', 'supplierCode companyName')
    await savedPurchaseOrder.populate('items.product', 'name sku')
    await savedPurchaseOrder.populate('createdBy', 'username')

    response.status(201).json(savedPurchaseOrder)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PATCH /api/purchase-orders/:id - Partial update purchase order
purchaseOrdersRouter.patch('/:id', userExtractor, async (request, response) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(request.params.id)

    if (!purchaseOrder) {
      return response.status(404).json({ error: 'Purchase order not found' })
    }

    // Only pending orders can be updated
    if (purchaseOrder.status !== 'pending') {
      return response.status(400).json({
        error: 'Only pending purchase orders can be updated'
      })
    }

    const {
      expectedDeliveryDate,
      items,
      shippingFee,
      tax,
      discount,
      notes
    } = request.body

    // If items are being updated, verify products and cache info
    if (items) {
      const enhancedItems = []
      for (const item of items) {
        const product = await Product.findById(item.product)
        if (!product) {
          return response.status(404).json({
            error: `Product ${item.product} not found`
          })
        }

        enhancedItems.push({
          ...item,
          productName: product.name,
          sku: product.sku,
          received: 0
        })
      }
      purchaseOrder.items = enhancedItems
    }

    if (expectedDeliveryDate !== undefined) purchaseOrder.expectedDeliveryDate = expectedDeliveryDate
    if (shippingFee !== undefined) purchaseOrder.shippingFee = shippingFee
    if (tax !== undefined) purchaseOrder.tax = tax
    if (discount !== undefined) purchaseOrder.discount = discount
    if (notes !== undefined) purchaseOrder.notes = notes

    const updatedPurchaseOrder = await purchaseOrder.save()

    await updatedPurchaseOrder.populate('supplier', 'supplierCode companyName')
    await updatedPurchaseOrder.populate('items.product', 'name sku')

    response.json(updatedPurchaseOrder)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PUT /api/purchase-orders/:id - Update purchase order
purchaseOrdersRouter.put('/:id', userExtractor, async (request, response) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(request.params.id)

    if (!purchaseOrder) {
      return response.status(404).json({ error: 'Purchase order not found' })
    }

    // Only pending orders can be updated
    if (purchaseOrder.status !== 'pending') {
      return response.status(400).json({
        error: 'Only pending purchase orders can be updated'
      })
    }

    const {
      expectedDeliveryDate,
      items,
      shippingFee,
      tax,
      discount,
      notes
    } = request.body

    // If items are being updated, verify products and cache info
    if (items) {
      const enhancedItems = []
      for (const item of items) {
        const product = await Product.findById(item.product)
        if (!product) {
          return response.status(404).json({
            error: `Product ${item.product} not found`
          })
        }

        enhancedItems.push({
          ...item,
          productName: product.name,
          sku: product.sku,
          received: 0
        })
      }
      purchaseOrder.items = enhancedItems
    }

    if (expectedDeliveryDate !== undefined) purchaseOrder.expectedDeliveryDate = expectedDeliveryDate
    if (shippingFee !== undefined) purchaseOrder.shippingFee = shippingFee
    if (tax !== undefined) purchaseOrder.tax = tax
    if (discount !== undefined) purchaseOrder.discount = discount
    if (notes !== undefined) purchaseOrder.notes = notes

    const updatedPurchaseOrder = await purchaseOrder.save()

    await updatedPurchaseOrder.populate('supplier', 'supplierCode companyName')
    await updatedPurchaseOrder.populate('items.product', 'name sku')

    response.json(updatedPurchaseOrder)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PATCH /api/purchase-orders/:id/status - Update purchase order status
purchaseOrdersRouter.patch('/:id/status', userExtractor, async (request, response) => {
  try {
    const { status, notes } = request.body

    const validStatuses = ['pending', 'approved', 'received', 'cancelled']

    if (!status || !validStatuses.includes(status)) {
      return response.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      })
    }

    const purchaseOrder = await PurchaseOrder.findById(request.params.id)

    if (!purchaseOrder) {
      return response.status(404).json({ error: 'Purchase order not found' })
    }

    // Handle status transitions
    if (status === 'approved') {
      await purchaseOrder.approve(request.user.id)
    } else if (status === 'cancelled') {
      await purchaseOrder.cancel()
    } else {
      purchaseOrder.status = status
      await purchaseOrder.save()
    }

    if (notes) {
      purchaseOrder.notes = notes
      await purchaseOrder.save()
    }

    await purchaseOrder.populate('supplier', 'supplierCode companyName')
    await purchaseOrder.populate('approvedBy', 'username')

    response.json({
      message: `Purchase order status updated to ${status}`,
      purchaseOrder
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PUT /api/purchase-orders/:id/approve - Approve purchase order
purchaseOrdersRouter.put('/:id/approve', userExtractor, async (request, response) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(request.params.id)

    if (!purchaseOrder) {
      return response.status(404).json({ error: 'Purchase order not found' })
    }

    await purchaseOrder.approve(request.user.id)

    await purchaseOrder.populate('supplier', 'supplierCode companyName')
    await purchaseOrder.populate('approvedBy', 'username')

    response.json({
      message: 'Purchase order approved successfully',
      purchaseOrder
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// GET /api/purchase-orders/:id/receives - Get receiving history for a PO
purchaseOrdersRouter.get('/:id/receives', userExtractor, async (request, response) => {
  try {
    const purchaseOrder = await PurchaseOrder
      .findById(request.params.id)
      .populate('supplier', 'supplierCode companyName')
      .populate('items.product', 'name sku')

    if (!purchaseOrder) {
      return response.status(404).json({ error: 'Purchase order not found' })
    }

    // Return items with receiving information
    const receivingHistory = purchaseOrder.items.map(item => ({
      product: item.product,
      productName: item.productName,
      sku: item.sku,
      ordered: item.quantity,
      received: item.received,
      remaining: item.quantity - item.received,
      percentReceived: Math.round((item.received / item.quantity) * 100)
    }))

    response.json({
      poNumber: purchaseOrder.poNumber,
      status: purchaseOrder.status,
      receivingHistory,
      summary: {
        totalItems: purchaseOrder.items.length,
        fullyReceived: purchaseOrder.items.filter(i => i.received === i.quantity).length,
        partiallyReceived: purchaseOrder.items.filter(i => i.received > 0 && i.received < i.quantity).length,
        notReceived: purchaseOrder.items.filter(i => i.received === 0).length
      }
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// POST /api/purchase-orders/:id/receive - Receive items
purchaseOrdersRouter.post('/:id/receive', userExtractor, async (request, response) => {
  try {
    const { receivedItems, items } = request.body
    const itemsToReceive = receivedItems || items

    if (!itemsToReceive || itemsToReceive.length === 0) {
      return response.status(400).json({
        error: 'Items to receive are required'
      })
    }

    const purchaseOrder = await PurchaseOrder.findById(request.params.id)

    if (!purchaseOrder) {
      return response.status(404).json({ error: 'Purchase order not found' })
    }

    if (purchaseOrder.status !== 'approved') {
      return response.status(400).json({
        error: 'Only approved purchase orders can receive items'
      })
    }

    // Transform received items to match the model's expected format
    const formattedItems = itemsToReceive.map(item => ({
      productId: item.product,
      quantity: item.quantityReceived || item.quantity
    }))

    // Receive items (this will update inventory and product stock)
    await purchaseOrder.receiveItems(formattedItems, request.user.id)

    // Update supplier stats
    if (purchaseOrder.status === 'received') {
      const supplier = await Supplier.findById(purchaseOrder.supplier)
      if (supplier) {
        await supplier.updatePurchaseStats(purchaseOrder.total)
      }
    }

    await purchaseOrder.populate('supplier', 'supplierCode companyName')
    await purchaseOrder.populate('items.product', 'name sku stock')
    await purchaseOrder.populate('receivedBy', 'username')

    response.json({
      message: 'Items received successfully',
      purchaseOrder
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PUT /api/purchase-orders/:id/cancel - Cancel purchase order
purchaseOrdersRouter.put('/:id/cancel', userExtractor, async (request, response) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(request.params.id)

    if (!purchaseOrder) {
      return response.status(404).json({ error: 'Purchase order not found' })
    }

    await purchaseOrder.cancel()

    response.json({
      message: 'Purchase order cancelled successfully',
      purchaseOrder
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// POST /api/purchase-orders/:id/payment - Add payment
purchaseOrdersRouter.post('/:id/payment', userExtractor, async (request, response) => {
  try {
    const { amount } = request.body

    if (!amount || amount <= 0) {
      return response.status(400).json({
        error: 'Amount must be a positive number'
      })
    }

    const purchaseOrder = await PurchaseOrder.findById(request.params.id)

    if (!purchaseOrder) {
      return response.status(404).json({ error: 'Purchase order not found' })
    }

    await purchaseOrder.addPayment(amount)

    response.json({
      message: 'Payment added successfully',
      paidAmount: purchaseOrder.paidAmount,
      paymentStatus: purchaseOrder.paymentStatus,
      remainingAmount: purchaseOrder.total - purchaseOrder.paidAmount
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// DELETE /api/purchase-orders/:id - Delete purchase order
purchaseOrdersRouter.delete('/:id', userExtractor, async (request, response) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(request.params.id)

    if (!purchaseOrder) {
      return response.status(404).json({ error: 'Purchase order not found' })
    }

    // Only paid orders can be deleted
    if (purchaseOrder.paymentStatus !== 'paid') {
      return response.status(400).json({
        error: 'Only paid purchase orders can be deleted.'
      })
    }

    await PurchaseOrder.findByIdAndDelete(request.params.id)
    response.json({ message: 'Purchase order deleted successfully' })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

module.exports = purchaseOrdersRouter
