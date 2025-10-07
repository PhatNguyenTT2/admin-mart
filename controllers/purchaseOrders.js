const purchaseOrdersRouter = require('express').Router()
const PurchaseOrder = require('../models/purchaseOrder')
const Supplier = require('../models/supplier')
const Product = require('../models/product')
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

    // Populate before sending response
    await savedPurchaseOrder.populate('supplier', 'supplierCode companyName')
    await savedPurchaseOrder.populate('items.product', 'name sku')
    await savedPurchaseOrder.populate('createdBy', 'username')

    response.status(201).json(savedPurchaseOrder)
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

    // Only draft and pending orders can be updated
    if (!['draft', 'pending'].includes(purchaseOrder.status)) {
      return response.status(400).json({
        error: 'Only draft or pending purchase orders can be updated'
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

// PUT /api/purchase-orders/:id/approve - Approve purchase order
purchaseOrdersRouter.put('/:id/approve', userExtractor, async (request, response) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(request.params.id)

    if (!purchaseOrder) {
      return response.status(404).json({ error: 'Purchase order not found' })
    }

    // Change status to pending first if it's draft
    if (purchaseOrder.status === 'draft') {
      purchaseOrder.status = 'pending'
      await purchaseOrder.save()
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

// POST /api/purchase-orders/:id/receive - Receive items
purchaseOrdersRouter.post('/:id/receive', userExtractor, async (request, response) => {
  try {
    const { items } = request.body

    if (!items || items.length === 0) {
      return response.status(400).json({
        error: 'Items to receive are required'
      })
    }

    const purchaseOrder = await PurchaseOrder.findById(request.params.id)

    if (!purchaseOrder) {
      return response.status(404).json({ error: 'Purchase order not found' })
    }

    if (purchaseOrder.status !== 'approved' && purchaseOrder.status !== 'partially_received') {
      return response.status(400).json({
        error: 'Only approved or partially received purchase orders can receive items'
      })
    }

    // Receive items (this will update inventory and product stock)
    await purchaseOrder.receiveItems(items, request.user.id)

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

    // Only draft orders can be deleted
    if (purchaseOrder.status !== 'draft') {
      return response.status(400).json({
        error: 'Only draft purchase orders can be deleted. Use cancel for other statuses.'
      })
    }

    await PurchaseOrder.findByIdAndDelete(request.params.id)
    response.json({ message: 'Purchase order deleted successfully' })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

module.exports = purchaseOrdersRouter
