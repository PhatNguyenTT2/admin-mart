const inventoryRouter = require('express').Router()
const Inventory = require('../models/inventory')
const Product = require('../models/product')
const { userExtractor } = require('../utils/auth')

// ============================================
// GET ENDPOINTS - View Inventory
// ============================================

// GET /api/inventory - Get all inventory with filtering & pagination
inventoryRouter.get('/', userExtractor, async (request, response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-quantityAvailable',
      lowStock,
      outOfStock
    } = request.query

    const filter = {}

    if (lowStock === 'true') {
      const inventory = await Inventory.find()
      const lowStockIds = inventory
        .filter(inv => inv.quantityAvailable <= inv.reorderPoint && inv.quantityAvailable > 0)
        .map(inv => inv._id)
      filter._id = { $in: lowStockIds }
    }

    if (outOfStock === 'true') {
      filter.quantityAvailable = 0
    }

    const pageNum = parseInt(page)
    const perPage = parseInt(limit)
    const skip = (pageNum - 1) * perPage

    const inventoryItems = await Inventory
      .find(filter)
      .sort(sort)
      .limit(perPage)
      .skip(skip)
      .populate('product', 'name sku price vendor')
      .populate('movements.performedBy', 'username')
      .lean() // Convert to plain JavaScript objects

    // Filter out items with null/undefined products
    const validInventoryItems = inventoryItems.filter(item => {
      if (!item.product) {
        console.warn('Found inventory item without product:', item._id)
        return false
      }
      return true
    })

    const total = await Inventory.countDocuments(filter)
    const totalPages = Math.ceil(total / perPage)

    response.json({
      success: true,
      data: {
        inventory: validInventoryItems,
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
    console.error('Error in GET /api/inventory:', error)
    response.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// GET /api/inventory/stats/summary - Get inventory statistics
inventoryRouter.get('/stats/summary', userExtractor, async (request, response) => {
  try {
    const totalItems = await Inventory.countDocuments()
    const allInventory = await Inventory.find().populate('product', 'name sku price')

    const lowStockItems = allInventory.filter(inv => inv.quantityAvailable <= inv.reorderPoint && inv.quantityAvailable > 0)
    const outOfStockItems = allInventory.filter(inv => inv.quantityAvailable === 0)
    const reorderNeeded = allInventory.filter(inv => inv.quantityAvailable <= inv.reorderPoint)

    const totalValue = allInventory.reduce(
      (sum, inv) => sum + (inv.quantityOnHand * (inv.product?.price || 0)),
      0
    )

    response.json({
      totalItems,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      reorderNeededCount: reorderNeeded.length,
      totalValue,
      totalQuantityOnHand: allInventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
      totalQuantityReserved: allInventory.reduce((sum, inv) => sum + inv.quantityReserved, 0),
      totalQuantityAvailable: allInventory.reduce((sum, inv) => sum + inv.quantityAvailable, 0)
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/inventory/low-stock - Get low stock items
inventoryRouter.get('/low-stock', userExtractor, async (request, response) => {
  try {
    const { threshold } = request.query
    const allInventory = await Inventory
      .find()
      .populate('product', 'name sku price vendor')

    const reorderThreshold = threshold ? parseInt(threshold) : null

    const lowStockItems = allInventory.filter(inv => {
      const compareValue = reorderThreshold || inv.reorderPoint
      return inv.quantityAvailable <= compareValue && inv.quantityAvailable > 0
    })

    response.json({
      lowStock: lowStockItems,
      count: lowStockItems.length,
      threshold: reorderThreshold || 'using reorderPoint per item'
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/inventory/out-of-stock - Get out of stock items
inventoryRouter.get('/out-of-stock', userExtractor, async (request, response) => {
  try {
    const outOfStockItems = await Inventory
      .find({ quantityAvailable: 0 })
      .populate('product', 'name sku price vendor')

    response.json({
      outOfStock: outOfStockItems,
      count: outOfStockItems.length
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/inventory/reorder-needed - Get items needing reorder
inventoryRouter.get('/reorder-needed', userExtractor, async (request, response) => {
  try {
    const allInventory = await Inventory
      .find()
      .populate('product', 'name sku price vendor')

    const reorderNeeded = allInventory.filter(
      inv => inv.quantityAvailable <= inv.reorderPoint
    )

    response.json({
      reorderNeeded,
      count: reorderNeeded.length
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/inventory/product/:productId - Get inventory for specific product
inventoryRouter.get('/product/:productId', userExtractor, async (request, response) => {
  try {
    const inventory = await Inventory
      .findOne({ product: request.params.productId })
      .populate('product')
      .populate('movements.performedBy', 'username')

    if (!inventory) {
      return response.status(404).json({ error: 'Inventory not found for this product' })
    }

    response.json(inventory)
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/inventory/movements - Get all movements across all products
inventoryRouter.get('/movements', userExtractor, async (request, response) => {
  try {
    const { page = 1, limit = 50, performedBy, startDate, endDate } = request.query

    const allInventory = await Inventory
      .find()
      .populate('product', 'name sku')
      .populate('movements.performedBy', 'username')

    let allMovements = []
    allInventory.forEach(inv => {
      inv.movements.forEach(movement => {
        allMovements.push({
          ...movement.toObject(),
          product: inv.product
        })
      })
    })

    // Filter by user
    if (performedBy) {
      allMovements = allMovements.filter(
        m => m.performedBy && m.performedBy._id.toString() === performedBy
      )
    }

    // Filter by date range
    if (startDate || endDate) {
      allMovements = allMovements.filter(m => {
        const moveDate = new Date(m.date)
        if (startDate && moveDate < new Date(startDate)) return false
        if (endDate && moveDate > new Date(endDate)) return false
        return true
      })
    }

    // Sort by date descending
    allMovements.sort((a, b) => new Date(b.date) - new Date(a.date))

    // Paginate
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const paginatedMovements = allMovements.slice(skip, skip + parseInt(limit))

    response.json({
      movements: paginatedMovements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: allMovements.length,
        pages: Math.ceil(allMovements.length / parseInt(limit))
      }
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/inventory/:productId/movements - Get movement history by product ID
inventoryRouter.get('/:productId/movements', userExtractor, async (request, response) => {
  try {
    const { page = 1, limit = 20, type, startDate, endDate } = request.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Try to find by product ID first
    let inventory = await Inventory
      .findOne({ product: request.params.productId })
      .populate('movements.performedBy', 'username')
      .populate('product', 'name sku')

    // If not found, try as inventory ID
    if (!inventory) {
      inventory = await Inventory
        .findById(request.params.productId)
        .populate('movements.performedBy', 'username')
        .populate('product', 'name sku')
    }

    if (!inventory) {
      return response.status(404).json({ error: 'Inventory not found' })
    }

    let movements = inventory.movements

    // Filter by type
    if (type) {
      movements = movements.filter(m => m.type === type)
    }

    // Filter by date range
    if (startDate || endDate) {
      movements = movements.filter(m => {
        const moveDate = new Date(m.date)
        if (startDate && moveDate < new Date(startDate)) return false
        if (endDate && moveDate > new Date(endDate)) return false
        return true
      })
    }

    // Sort by date descending
    movements.sort((a, b) => new Date(b.date) - new Date(a.date))

    const paginatedMovements = movements.slice(skip, skip + parseInt(limit))
    const total = movements.length

    response.json({
      product: inventory.product,
      movements: paginatedMovements,
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

// GET /api/inventory/alerts - Get inventory alerts
inventoryRouter.get('/alerts', userExtractor, async (request, response) => {
  try {
    const { type } = request.query
    const allInventory = await Inventory
      .find()
      .populate('product', 'name sku price vendor')

    let alerts = []

    allInventory.forEach(inv => {
      if (inv.quantityAvailable === 0) {
        if (!type || type === 'out_of_stock') {
          alerts.push({
            type: 'out_of_stock',
            severity: 'critical',
            product: inv.product,
            quantityAvailable: inv.quantityAvailable,
            message: `${inv.product.name} is out of stock`
          })
        }
      } else if (inv.quantityAvailable <= inv.reorderPoint) {
        if (!type || type === 'low_stock' || type === 'reorder_needed') {
          alerts.push({
            type: inv.quantityAvailable <= inv.reorderPoint * 0.5 ? 'reorder_needed' : 'low_stock',
            severity: inv.quantityAvailable <= inv.reorderPoint * 0.5 ? 'high' : 'medium',
            product: inv.product,
            quantityAvailable: inv.quantityAvailable,
            reorderPoint: inv.reorderPoint,
            reorderQuantity: inv.reorderQuantity,
            message: `${inv.product.name} needs reorder (${inv.quantityAvailable} left, reorder at ${inv.reorderPoint})`
          })
        }
      }
    })

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    response.json({
      alerts,
      count: alerts.length,
      summary: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length
      }
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// ============================================
// POST ENDPOINTS - Stock Operations
// ============================================

// POST /api/inventory/adjust - Manual stock adjustment
inventoryRouter.post('/adjust', userExtractor, async (request, response) => {
  try {
    const { product, type, quantity, reason, notes, referenceType, referenceId } = request.body

    if (!product) {
      return response.status(400).json({ error: 'Product ID is required' })
    }

    if (!quantity || quantity === 0) {
      return response.status(400).json({ error: 'Quantity must be non-zero' })
    }

    if (!reason) {
      return response.status(400).json({ error: 'Reason is required for adjustment' })
    }

    // Find or create inventory
    let inventory = await Inventory.findOne({ product }).populate('product')

    if (!inventory) {
      const productDoc = await Product.findById(product)
      if (!productDoc) {
        return response.status(404).json({ error: 'Product not found' })
      }

      inventory = new Inventory({
        product,
        quantityOnHand: 0,
        reorderPoint: 10,
        reorderQuantity: 50
      })
    }

    const newQuantity = Math.max(0, inventory.quantityOnHand + quantity)

    inventory.movements.push({
      type: type || (quantity > 0 ? 'in' : 'adjustment'),
      quantity: Math.abs(quantity),
      reason,
      notes,
      referenceType: referenceType || 'adjustment',
      referenceId,
      performedBy: request.user.id,
      date: new Date()
    })

    inventory.quantityOnHand = newQuantity

    if (quantity > 0) {
      inventory.lastRestocked = new Date()
    }

    await inventory.save()

    // Update product stock
    const productDoc = await Product.findById(product)
    if (productDoc) {
      productDoc.stock = newQuantity
      await productDoc.save()
    }

    await inventory.populate('product', 'name sku price')

    response.json({
      message: 'Stock adjusted successfully',
      inventory,
      change: quantity,
      newQuantity: inventory.quantityOnHand
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// POST /api/inventory/:productId/adjust - Manual stock adjustment by product ID
inventoryRouter.post('/:productId/adjust', userExtractor, async (request, response) => {
  try {
    const { productId } = request.params
    const { type, quantity, adjustmentType, referenceType, referenceId, notes } = request.body

    if (!quantity || quantity <= 0) {
      return response.status(400).json({ error: 'Quantity must be positive' })
    }

    if (!type) {
      return response.status(400).json({ error: 'Adjustment type is required' })
    }

    // Find or create inventory
    let inventory = await Inventory.findOne({ product: productId }).populate('product')

    if (!inventory) {
      const productDoc = await Product.findById(productId)
      if (!productDoc) {
        return response.status(404).json({ error: 'Product not found' })
      }

      inventory = new Inventory({
        product: productId,
        quantityOnHand: 0,
        quantityReserved: 0,
        reorderPoint: 10,
        reorderQuantity: 50
      })
    }

    let movementReason = notes || ''
    let actualQuantity = parseInt(quantity)

    // Handle different adjustment types
    if (type === 'adjustment') {
      // Adjustment type: increase or decrease quantityOnHand
      if (!adjustmentType || !['increase', 'decrease'].includes(adjustmentType)) {
        return response.status(400).json({ error: 'adjustmentType must be "increase" or "decrease"' })
      }

      const changeAmount = adjustmentType === 'increase' ? actualQuantity : -actualQuantity
      inventory.quantityOnHand = Math.max(0, inventory.quantityOnHand + changeAmount)

      movementReason = movementReason || `Stock ${adjustmentType} by ${actualQuantity}`

      inventory.movements.push({
        type: 'adjustment',
        quantity: actualQuantity,
        adjustmentType: adjustmentType,
        reason: movementReason,
        notes: notes,
        referenceType: referenceType || 'stock_adjustment',
        referenceId: referenceId,
        performedBy: request.user.id,
        date: new Date()
      })

      if (adjustmentType === 'increase') {
        inventory.lastRestocked = new Date()
      }

      // Update product stock
      const productDoc = await Product.findById(productId)
      if (productDoc) {
        productDoc.stock = inventory.quantityOnHand
        await productDoc.save()
      }

    } else if (type === 'reserved') {
      // Reserved type: increase quantityReserved, decrease quantityAvailable
      if (inventory.quantityAvailable < actualQuantity) {
        return response.status(400).json({
          error: 'Insufficient stock available to reserve',
          available: inventory.quantityAvailable,
          requested: actualQuantity
        })
      }

      inventory.quantityReserved += actualQuantity
      movementReason = movementReason || `Stock reserved: ${actualQuantity} units`

      inventory.movements.push({
        type: 'reserved',
        quantity: actualQuantity,
        reason: movementReason,
        notes: notes,
        referenceType: referenceType || 'reservation',
        referenceId: referenceId,
        performedBy: request.user.id,
        date: new Date()
      })

    } else if (type === 'released') {
      // Released type: decrease quantityReserved, increase quantityAvailable
      if (inventory.quantityReserved < actualQuantity) {
        return response.status(400).json({
          error: 'Insufficient reserved stock to release',
          reserved: inventory.quantityReserved,
          requested: actualQuantity
        })
      }

      inventory.quantityReserved -= actualQuantity
      movementReason = movementReason || `Reserved stock released: ${actualQuantity} units`

      inventory.movements.push({
        type: 'released',
        quantity: actualQuantity,
        reason: movementReason,
        notes: notes,
        referenceType: referenceType || 'release',
        referenceId: referenceId,
        performedBy: request.user.id,
        date: new Date()
      })

    } else {
      return response.status(400).json({ error: 'Invalid adjustment type' })
    }

    await inventory.save()
    await inventory.populate('product', 'name sku price')

    response.json({
      message: 'Stock adjusted successfully',
      inventory,
      type: type,
      quantity: actualQuantity,
      quantityOnHand: inventory.quantityOnHand,
      quantityReserved: inventory.quantityReserved,
      quantityAvailable: inventory.quantityAvailable
    })
  } catch (error) {
    console.error('Error in adjust stock:', error)
    response.status(400).json({ error: error.message })
  }
})

// POST /api/inventory/reserve - Reserve stock for order
inventoryRouter.post('/reserve', userExtractor, async (request, response) => {
  try {
    const { product, quantity, referenceType, referenceId, reason } = request.body

    if (!product || !quantity || quantity <= 0) {
      return response.status(400).json({ error: 'Product and positive quantity are required' })
    }

    let inventory = await Inventory.findOne({ product }).populate('product')
    if (!inventory) {
      return response.status(404).json({ error: 'Inventory not found for this product' })
    }

    if (inventory.quantityAvailable < quantity) {
      return response.status(400).json({
        error: 'Insufficient stock available',
        available: inventory.quantityAvailable
      })
    }

    inventory.quantityReserved += quantity
    inventory.movements.push({
      type: 'reserved',
      quantity,
      reason: reason || 'Stock reserved',
      referenceType: referenceType || 'order',
      referenceId,
      performedBy: request.user.id,
      date: new Date()
    })

    await inventory.save()

    response.json({
      message: 'Stock reserved successfully',
      inventory,
      quantityReserved: inventory.quantityReserved,
      quantityAvailable: inventory.quantityAvailable
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// POST /api/inventory/release - Release reserved stock
inventoryRouter.post('/release', userExtractor, async (request, response) => {
  try {
    const { product, quantity, referenceType, referenceId, reason } = request.body

    if (!product || !quantity || quantity <= 0) {
      return response.status(400).json({ error: 'Product and positive quantity are required' })
    }

    let inventory = await Inventory.findOne({ product }).populate('product')
    if (!inventory) {
      return response.status(404).json({ error: 'Inventory not found for this product' })
    }

    if (inventory.quantityReserved < quantity) {
      return response.status(400).json({
        error: 'Cannot release more than reserved',
        reserved: inventory.quantityReserved
      })
    }

    inventory.quantityReserved -= quantity
    inventory.movements.push({
      type: 'released',
      quantity,
      reason: reason || 'Stock released',
      referenceType: referenceType || 'order',
      referenceId,
      performedBy: request.user.id,
      date: new Date()
    })

    await inventory.save()

    response.json({
      message: 'Stock released successfully',
      inventory,
      quantityReserved: inventory.quantityReserved,
      quantityAvailable: inventory.quantityAvailable
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// POST /api/inventory/stock-in - Stock in from purchase order
inventoryRouter.post('/stock-in', userExtractor, async (request, response) => {
  try {
    const { product, quantity, referenceType, referenceId, reason, warehouseLocation, notes } = request.body

    if (!product || !quantity || quantity <= 0) {
      return response.status(400).json({ error: 'Product and positive quantity are required' })
    }

    let inventory = await Inventory.findOne({ product }).populate('product')

    if (!inventory) {
      const productDoc = await Product.findById(product)
      if (!productDoc) {
        return response.status(404).json({ error: 'Product not found' })
      }

      inventory = new Inventory({
        product,
        quantityOnHand: 0,
        reorderPoint: 10,
        reorderQuantity: 50
      })
    }

    inventory.quantityOnHand += quantity
    inventory.lastRestocked = new Date()

    if (warehouseLocation) {
      inventory.warehouseLocation = warehouseLocation
    }

    inventory.movements.push({
      type: 'in',
      quantity,
      reason: reason || 'Stock received',
      notes,
      referenceType: referenceType || 'purchase_order',
      referenceId,
      performedBy: request.user.id,
      date: new Date()
    })

    await inventory.save()

    // Update product stock
    const productDoc = await Product.findById(product)
    if (productDoc) {
      productDoc.stock = inventory.quantityOnHand
      await productDoc.save()
    }

    await inventory.populate('product', 'name sku price')

    response.json({
      message: 'Stock added successfully',
      inventory,
      quantityAdded: quantity,
      newQuantity: inventory.quantityOnHand
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// POST /api/inventory/stock-in/bulk - Bulk stock in
inventoryRouter.post('/stock-in/bulk', userExtractor, async (request, response) => {
  try {
    const { referenceType, referenceId, items, notes } = request.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return response.status(400).json({ error: 'Items array is required' })
    }

    const results = []

    for (const item of items) {
      try {
        const { product, quantity, warehouseLocation } = item

        if (!product || !quantity || quantity <= 0) {
          results.push({
            product,
            success: false,
            error: 'Invalid product or quantity'
          })
          continue
        }

        let inventory = await Inventory.findOne({ product }).populate('product')

        if (!inventory) {
          const productDoc = await Product.findById(product)
          if (!productDoc) {
            results.push({
              product,
              success: false,
              error: 'Product not found'
            })
            continue
          }

          inventory = new Inventory({
            product,
            quantityOnHand: 0,
            reorderPoint: 10,
            reorderQuantity: 50
          })
        }

        inventory.quantityOnHand += quantity
        inventory.lastRestocked = new Date()

        if (warehouseLocation) {
          inventory.warehouseLocation = warehouseLocation
        }

        inventory.movements.push({
          type: 'in',
          quantity,
          reason: 'Bulk stock in',
          notes,
          referenceType: referenceType || 'purchase_order',
          referenceId,
          performedBy: request.user.id,
          date: new Date()
        })

        await inventory.save()

        // Update product stock
        const productDoc = await Product.findById(product)
        if (productDoc) {
          productDoc.stock = inventory.quantityOnHand
          await productDoc.save()
        }

        results.push({
          product: inventory.product.name,
          success: true,
          quantityAdded: quantity,
          newQuantity: inventory.quantityOnHand
        })
      } catch (error) {
        results.push({
          product: item.product,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    response.json({
      message: `Bulk stock in completed. ${successCount} success, ${failCount} failed`,
      results,
      summary: {
        total: items.length,
        success: successCount,
        failed: failCount
      }
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// POST /api/inventory/stock-out - Stock out for order shipment
inventoryRouter.post('/stock-out', userExtractor, async (request, response) => {
  try {
    const { product, quantity, referenceType, referenceId, reason, notes } = request.body

    if (!product || !quantity || quantity <= 0) {
      return response.status(400).json({ error: 'Product and positive quantity are required' })
    }

    let inventory = await Inventory.findOne({ product }).populate('product')
    if (!inventory) {
      return response.status(404).json({ error: 'Inventory not found for this product' })
    }

    if (inventory.quantityOnHand < quantity) {
      return response.status(400).json({
        error: 'Insufficient stock on hand',
        available: inventory.quantityOnHand
      })
    }

    inventory.quantityOnHand -= quantity

    // Also release reserved stock if applicable
    if (inventory.quantityReserved >= quantity) {
      inventory.quantityReserved -= quantity
    }

    inventory.movements.push({
      type: 'out',
      quantity,
      reason: reason || 'Stock shipped',
      notes,
      referenceType: referenceType || 'order',
      referenceId,
      performedBy: request.user.id,
      date: new Date()
    })

    await inventory.save()

    // Update product stock
    const productDoc = await Product.findById(product)
    if (productDoc) {
      productDoc.stock = inventory.quantityOnHand
      await productDoc.save()
    }

    await inventory.populate('product', 'name sku price')

    response.json({
      message: 'Stock removed successfully',
      inventory,
      quantityRemoved: quantity,
      newQuantity: inventory.quantityOnHand
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// ============================================
// PUT ENDPOINTS - Update Settings
// ============================================

// PUT /api/inventory/:productId/reorder-settings - Update reorder settings
inventoryRouter.put('/:productId/reorder-settings', userExtractor, async (request, response) => {
  try {
    const { reorderPoint, reorderQuantity } = request.body

    let inventory = await Inventory
      .findOne({ product: request.params.productId })
      .populate('product')

    if (!inventory) {
      return response.status(404).json({ error: 'Inventory not found' })
    }

    if (reorderPoint !== undefined) {
      inventory.reorderPoint = reorderPoint
    }

    if (reorderQuantity !== undefined) {
      inventory.reorderQuantity = reorderQuantity
    }

    await inventory.save()

    response.json({
      message: 'Reorder settings updated successfully',
      inventory
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PUT /api/inventory/:productId/location - Update warehouse location
inventoryRouter.put('/:productId/location', userExtractor, async (request, response) => {
  try {
    const { warehouseLocation } = request.body

    if (!warehouseLocation) {
      return response.status(400).json({ error: 'Warehouse location is required' })
    }

    let inventory = await Inventory
      .findOne({ product: request.params.productId })
      .populate('product')

    if (!inventory) {
      return response.status(404).json({ error: 'Inventory not found' })
    }

    inventory.warehouseLocation = warehouseLocation
    await inventory.save()

    response.json({
      message: 'Warehouse location updated successfully',
      inventory
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// ============================================
// PATCH ENDPOINTS - Alerts
// ============================================

// PATCH /api/inventory/alerts/:alertId/acknowledge - Acknowledge alert
inventoryRouter.patch('/alerts/:alertId/acknowledge', userExtractor, async (request, response) => {
  try {
    // For now, just return success (alerts are generated on-the-fly)
    response.json({
      message: 'Alert acknowledged',
      alertId: request.params.alertId
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

module.exports = inventoryRouter
