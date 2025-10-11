/**
 * Script to create test inventory data for all 15 products
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

    // Get all products sorted by SKU
    const products = await Product.find().sort({ sku: 1 })

    if (products.length === 0) {
      console.log('No products found. Please create products first.')
      process.exit(1)
    }

    console.log(`Found ${products.length} products`)

    // Clear existing inventory
    await Inventory.deleteMany({})
    console.log('Cleared existing inventory data')

    // Define realistic inventory data for each product
    // Mix of: in-stock, low-stock, and out-of-stock items
    const inventoryData = [
      // 1. Angie's Boomchickapop - Popular snack, good stock
      { quantityOnHand: 85, quantityReserved: 12, reorderPoint: 20, location: 'Shelf-A-1' },

      // 2. Blue Diamond Almonds - Medium stock
      { quantityOnHand: 45, quantityReserved: 5, reorderPoint: 15, location: 'Shelf-A-2' },

      // 3. Canada Dry Ginger Ale - Low stock (needs reorder)
      { quantityOnHand: 12, quantityReserved: 2, reorderPoint: 25, location: 'Shelf-B-1' },

      // 4. Chobani Yogurt - Very good stock (dairy product)
      { quantityOnHand: 120, quantityReserved: 15, reorderPoint: 30, location: 'Cooler-A-1' },

      // 5. Encore Seafoods Salmon - Low stock (premium item)
      { quantityOnHand: 8, quantityReserved: 0, reorderPoint: 10, location: 'Freezer-A-1' },

      // 6. Foster Farms - Out of stock (needs urgent reorder)
      { quantityOnHand: 0, quantityReserved: 0, reorderPoint: 20, location: 'Freezer-A-2' },

      // 7. Fresh Organic Broccoli - Good stock (fresh produce)
      { quantityOnHand: 65, quantityReserved: 8, reorderPoint: 20, location: 'Produce-A-1' },

      // 8. Fresh Organic Bananas - Excellent stock (popular item)
      { quantityOnHand: 150, quantityReserved: 25, reorderPoint: 40, location: 'Produce-A-2' },

      // 9. Fresh Organic Carrots - Medium stock
      { quantityOnHand: 50, quantityReserved: 10, reorderPoint: 15, location: 'Produce-A-3' },

      // 10. Fresh Organic Strawberries - Low stock (seasonal)
      { quantityOnHand: 18, quantityReserved: 3, reorderPoint: 25, location: 'Produce-B-1' },

      // 11. Seeds of Change Quinoa - Good stock
      { quantityOnHand: 70, quantityReserved: 8, reorderPoint: 20, location: 'Shelf-C-1' },

      // 12. Gorton's Fish Fillets - Medium stock
      { quantityOnHand: 35, quantityReserved: 5, reorderPoint: 15, location: 'Freezer-B-1' },

      // 13. Haagen-Dazs Ice Cream - Low stock (needs reorder)
      { quantityOnHand: 14, quantityReserved: 2, reorderPoint: 20, location: 'Freezer-C-1' },

      // 14. Organic Whole Milk - Very good stock (essential item)
      { quantityOnHand: 95, quantityReserved: 18, reorderPoint: 30, location: 'Cooler-B-1' },

      // 15. Italian Chicken Meatballs - Good stock
      { quantityOnHand: 55, quantityReserved: 7, reorderPoint: 20, location: 'Freezer-B-2' }
    ]

    // Create inventory for each product
    const inventoryItems = []

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const data = inventoryData[i] || {
        quantityOnHand: 50,
        quantityReserved: 5,
        reorderPoint: 15,
        location: `Shelf-Z-${i + 1}`
      }

      const quantityAvailable = data.quantityOnHand - data.quantityReserved
      const isOutOfStock = data.quantityOnHand === 0

      // Calculate reorder quantity as 2x reorder point
      const reorderQuantity = data.reorderPoint * 2

      // Last restocked: random date in the past 1-30 days (or null if out of stock)
      const daysAgo = isOutOfStock ? null : Math.floor(Math.random() * 30) + 1
      const lastRestocked = isOutOfStock ? null : new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

      const inventory = new Inventory({
        product: product._id,
        quantityOnHand: data.quantityOnHand,
        quantityReserved: data.quantityReserved,
        quantityAvailable: quantityAvailable,
        reorderPoint: data.reorderPoint,
        reorderQuantity: reorderQuantity,
        warehouseLocation: data.location,
        lastRestocked: lastRestocked
      })

      inventoryItems.push(inventory)
    }

    await Inventory.insertMany(inventoryItems)
    console.log(`\n✅ Created ${inventoryItems.length} inventory items`)

    // Display summary with populated product details
    const allInventory = await Inventory.find().populate('product', 'name sku')
    const lowStock = allInventory.filter(inv => inv.quantityAvailable > 0 && inv.quantityAvailable <= inv.reorderPoint)
    const outOfStock = allInventory.filter(inv => inv.quantityAvailable === 0)
    const inStock = allInventory.filter(inv => inv.quantityAvailable > inv.reorderPoint)

    console.log('\n' + '='.repeat(70))
    console.log('📊 INVENTORY SUMMARY')
    console.log('='.repeat(70))
    console.log(`Total Items:     ${allInventory.length}`)
    console.log(`✅ In Stock:     ${inStock.length} (above reorder point)`)
    console.log(`⚠️  Low Stock:    ${lowStock.length} (at or below reorder point)`)
    console.log(`❌ Out of Stock: ${outOfStock.length} (needs immediate attention)`)

    console.log('\n' + '='.repeat(70))
    console.log('📦 DETAILED INVENTORY')
    console.log('='.repeat(70))

    for (let i = 0; i < allInventory.length; i++) {
      const item = allInventory[i]
      const statusIcon = item.quantityAvailable === 0 ? '❌' :
        item.quantityAvailable <= item.reorderPoint ? '⚠️ ' : '✅'

      console.log(`\n${i + 1}. ${statusIcon} ${item.product.sku} - ${item.product.name}`)
      console.log(`   Location: ${item.warehouseLocation}`)
      console.log(`   On Hand: ${item.quantityOnHand} | Reserved: ${item.quantityReserved} | Available: ${item.quantityAvailable}`)
      console.log(`   Reorder Point: ${item.reorderPoint} | Reorder Qty: ${item.reorderQuantity}`)

      if (item.lastRestocked) {
        const daysAgo = Math.floor((Date.now() - item.lastRestocked.getTime()) / (24 * 60 * 60 * 1000))
        console.log(`   Last Restocked: ${item.lastRestocked.toLocaleDateString()} (${daysAgo} days ago)`)
      } else {
        console.log(`   Last Restocked: Never`)
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('✅ Test inventory data created successfully!')
    console.log('='.repeat(70))

    process.exit(0)
  } catch (error) {
    console.error('Error creating test data:', error)
    process.exit(1)
  }
}

createTestInventoryData()

