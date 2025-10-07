const inventoryRouter = require('express').Router()
const Inventory = require('../models/inventory')
const Product = require('../models/product')
const { userExtractor } = require('../utils/auth')

// GET /api/inventory - Get all inventory with filtering
inventoryRouter.get('/', userExtractor, async (request, response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-quantityAvailable',
      lowStock,
      outOfStock
    } = request.query

    // Build filter object
    const filter = {}

    if (lowStock === 'true') {
      // Find items where available <= reorderPoint
      const inventory = await Inventory.find()
      const lowStockIds = inventory
        .filter(inv => inv.quantityAvailable <= inv.reorderPoint)
        .map(inv => inv._id)

      filter._id = { $in: lowStockIds }
    }

    if (outOfStock === 'true') {
      filter.quantityAvailable = 0
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const inventoryItems = await Inventory
      .find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('product', 'name sku price vendor')
      .populate('movements.performedBy', 'username')

    const total = await Inventory.countDocuments(filter)

    response.json({
      inventory: inventoryItems,
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

// GET /api/inventory/stats - Get inventory statistics
inventoryRouter.get('/stats', userExtractor, async (request, response) => {
  try {
    const totalItems = await Inventory.countDocuments()

    // Low stock items
    const allInventory = await Inventory.find()
    const lowStockItems = allInventory.filter(inv => inv.quantityAvailable <= inv.reorderPoint)
    const outOfStockItems = allInventory.filter(inv => inv.quantityAvailable === 0)

    // Total inventory value
    const inventoryWithProducts = await Inventory.find().populate('product', 'price')
    const totalValue = inventoryWithProducts.reduce(
      (sum, inv) => sum + (inv.quantityOnHand * (inv.product?.price || 0)),
      0
    )

    response.json({
      totalItems,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      totalValue,
      lowStockItems: lowStockItems.slice(0, 10).map(inv => ({
        product: inv.product,
        quantityAvailable: inv.quantityAvailable,
        reorderPoint: inv.reorderPoint
      }))
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/inventory/low-stock - Get low stock items
inventoryRouter.get('/low-stock', userExtractor, async (request, response) => {
  try {
    const allInventory = await Inventory
      .find()
      .populate('product', 'name sku price vendor')

    const lowStockItems = allInventory.filter(
      inv => inv.quantityAvailable <= inv.reorderPoint && inv.quantityAvailable > 0
    )

    const outOfStockItems = allInventory.filter(
      inv => inv.quantityAvailable === 0
    )

    response.json({
      lowStock: lowStockItems,
      outOfStock: outOfStockItems
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/inventory/product/:productId - Get inventory for a specific product
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

// GET /api/inventory/:id/movements - Get movement history
inventoryRouter.get('/:id/movements', userExtractor, async (request, response) => {
  try {
    const { page = 1, limit = 20, type } = request.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const inventory = await Inventory
      .findById(request.params.id)
      .populate('movements.performedBy', 'username')

    if (!inventory) {
      return response.status(404).json({ error: 'Inventory not found' })
    }

    let movements = inventory.movements

    if (type) {
      movements = movements.filter(m => m.type === type)
    }

    // Sort by date descending
    movements.sort((a, b) => b.date - a.date)

    const paginatedMovements = movements.slice(skip, skip + parseInt(limit))
    const total = movements.length

    response.json({
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

// POST /api/inventory - Create inventory for a product
inventoryRouter.post('/', userExtractor, async (request, response) => {
  try {
    const {
      productId,
      quantityOnHand,
      reorderPoint,
      reorderQuantity,
      warehouseLocation
    } = request.body

    if (!productId) {
      return response.status(400).json({ error: 'Product ID is required' })
    }

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return response.status(404).json({ error: 'Product not found' })
    }

    // Check if inventory already exists
    const existingInventory = await Inventory.findOne({ product: productId })
    if (existingInventory) {
      return response.status(400).json({
        error: 'Inventory already exists for this product'
      })
    }

    const inventory = new Inventory({
      product: productId,
      quantityOnHand: quantityOnHand || 0,
      reorderPoint: reorderPoint || 10,
      reorderQuantity: reorderQuantity || 50,
      warehouseLocation
    })

    // Add initial movement if quantity > 0
    if (quantityOnHand > 0) {
      inventory.movements.push({
        type: 'in',
        quantity: quantityOnHand,
        reason: 'Initial stock',
        referenceType: 'adjustment',
        performedBy: request.user.id
      })
      inventory.lastRestocked = new Date()
    }

    const savedInventory = await inventory.save()

    // Update product stock
    product.stock = quantityOnHand || 0
    await product.save()

    await savedInventory.populate('product', 'name sku price')

    response.status(201).json(savedInventory)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PUT /api/inventory/:id/adjust - Adjust stock quantity
inventoryRouter.put('/:id/adjust', userExtractor, async (request, response) => {
  try {
    const { newQuantity, reason } = request.body

    if (newQuantity === undefined || newQuantity < 0) {
      return response.status(400).json({
        error: 'New quantity is required and must be non-negative'
      })
    }

    if (!reason) {
      return response.status(400).json({ error: 'Reason is required' })
    }

    const inventory = await Inventory
      .findById(request.params.id)
      .populate('product')

    if (!inventory) {
      return response.status(404).json({ error: 'Inventory not found' })
    }

    await inventory.adjustStock(newQuantity, reason, request.user.id)

    // Update product stock
    if (inventory.product) {
      inventory.product.stock = inventory.quantityOnHand
      await inventory.product.save()
    }

    response.json({
      message: 'Stock adjusted successfully',
      inventory
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PUT /api/inventory/:id/reserve - Reserve stock
inventoryRouter.put('/:id/reserve', userExtractor, async (request, response) => {
  try {
    const { quantity, referenceId } = request.body

    if (!quantity || quantity <= 0) {
      return response.status(400).json({
        error: 'Quantity must be a positive number'
      })
    }

    const inventory = await Inventory.findById(request.params.id)

    if (!inventory) {
      return response.status(404).json({ error: 'Inventory not found' })
    }

    await inventory.reserveStock(quantity, referenceId, request.user.id)

    response.json({
      message: 'Stock reserved successfully',
      quantityReserved: inventory.quantityReserved,
      quantityAvailable: inventory.quantityAvailable
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PUT /api/inventory/:id/release - Release reserved stock
inventoryRouter.put('/:id/release', userExtractor, async (request, response) => {
  try {
    const { quantity, referenceId } = request.body

    if (!quantity || quantity <= 0) {
      return response.status(400).json({
        error: 'Quantity must be a positive number'
      })
    }

    const inventory = await Inventory.findById(request.params.id)

    if (!inventory) {
      return response.status(404).json({ error: 'Inventory not found' })
    }

    await inventory.releaseStock(quantity, referenceId, request.user.id)

    response.json({
      message: 'Stock released successfully',
      quantityReserved: inventory.quantityReserved,
      quantityAvailable: inventory.quantityAvailable
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PUT /api/inventory/:id/settings - Update inventory settings
inventoryRouter.put('/:id/settings', userExtractor, async (request, response) => {
  try {
    const { reorderPoint, reorderQuantity, warehouseLocation } = request.body

    const inventory = await Inventory.findById(request.params.id)

    if (!inventory) {
      return response.status(404).json({ error: 'Inventory not found' })
    }

    if (reorderPoint !== undefined) inventory.reorderPoint = reorderPoint
    if (reorderQuantity !== undefined) inventory.reorderQuantity = reorderQuantity
    if (warehouseLocation !== undefined) inventory.warehouseLocation = warehouseLocation

    await inventory.save()

    response.json({
      message: 'Inventory settings updated successfully',
      inventory
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// DELETE /api/inventory/:id - Delete inventory
inventoryRouter.delete('/:id', userExtractor, async (request, response) => {
  try {
    const inventory = await Inventory.findById(request.params.id)

    if (!inventory) {
      return response.status(404).json({ error: 'Inventory not found' })
    }

    // Only allow deletion if no stock
    if (inventory.quantityOnHand > 0 || inventory.quantityReserved > 0) {
      return response.status(400).json({
        error: 'Cannot delete inventory with existing stock'
      })
    }

    await Inventory.findByIdAndDelete(request.params.id)
    response.json({ message: 'Inventory deleted successfully' })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

module.exports = inventoryRouter
