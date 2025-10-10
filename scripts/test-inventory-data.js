/**
 * Script to create test inventory data
 * Run with: node backend/scripts/test-inventory-data.js
 */

const mongoose = require('mongoose')
const Inventory = require('../models/inventory')
const Product = require('../models/product')
const config = require('../utils/config')

const createTestInventoryData = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(config.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Get some products
    const products = await Product.find().limit(10)

    if (products.length === 0) {
      console.log('No products found. Please create products first.')
      process.exit(1)
    }

    console.log(`Found ${products.length} products`)

    // Clear existing inventory
    await Inventory.deleteMany({})
    console.log('Cleared existing inventory data')

    // Create inventory for each product
    const inventoryItems = []

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const isLowStock = i % 3 === 0 // Every 3rd item is low stock
      const isOutOfStock = i % 5 === 0 // Every 5th item is out of stock

      let quantityOnHand, quantityReserved, reorderPoint

      if (isOutOfStock) {
        quantityOnHand = 0
        quantityReserved = 0
        reorderPoint = 10
      } else if (isLowStock) {
        quantityOnHand = 5
        quantityReserved = 0
        reorderPoint = 10
      } else {
        quantityOnHand = Math.floor(Math.random() * 100) + 20
        quantityReserved = Math.floor(Math.random() * 5)
        reorderPoint = 10
      }

      const inventory = new Inventory({
        product: product._id,
        quantityOnHand,
        quantityReserved,
        quantityAvailable: quantityOnHand - quantityReserved, // Calculate manually since insertMany doesn't trigger pre-save
        reorderPoint,
        reorderQuantity: 50,
        warehouseLocation: `Shelf-${String.fromCharCode(65 + Math.floor(i / 10))}-${i % 10 + 1}`,
        lastRestocked: isOutOfStock ? null : new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      })

      inventoryItems.push(inventory)
    }

    await Inventory.insertMany(inventoryItems)
    console.log(`Created ${inventoryItems.length} inventory items`)

    // Display summary
    const allInventory = await Inventory.find()
    const lowStock = allInventory.filter(inv => inv.quantityAvailable > 0 && inv.quantityAvailable <= inv.reorderPoint)
    const outOfStock = allInventory.filter(inv => inv.quantityAvailable === 0)
    const inStock = allInventory.filter(inv => inv.quantityAvailable > inv.reorderPoint)

    console.log('\n=== Inventory Summary ===')
    console.log(`Total Items: ${allInventory.length}`)
    console.log(`In Stock: ${inStock.length}`)
    console.log(`Low Stock: ${lowStock.length}`)
    console.log(`Out of Stock: ${outOfStock.length}`)

    console.log('\n=== Sample Inventory Items ===')
    for (let i = 0; i < Math.min(5, inventoryItems.length); i++) {
      const item = inventoryItems[i]
      await item.populate('product', 'name sku')
      console.log(`${item.product.sku} - ${item.product.name}:`)
      console.log(`  On Hand: ${item.quantityOnHand}, Reserved: ${item.quantityReserved}, Available: ${item.quantityAvailable}`)
      console.log(`  Reorder Point: ${item.reorderPoint}, Location: ${item.warehouseLocation}`)
    }

    console.log('\nTest inventory data created successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error creating test data:', error)
    process.exit(1)
  }
}

createTestInventoryData()

