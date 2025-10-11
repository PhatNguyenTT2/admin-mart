/**
 * Script to check existing products
 */

const mongoose = require('mongoose')
const Product = require('../models/product')
const config = require('../utils/config')

const checkProducts = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(config.MONGODB_URI)
    console.log('Connected to MongoDB')

    const products = await Product.find()
      .select('name sku price purchasePrice stockQuantity category')
      .sort({ sku: 1 })

    console.log(`\nTotal products: ${products.length}\n`)
    console.log('=== Products List ===')

    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.sku || 'NO-SKU'} - ${p.name}`)
      console.log(`   Price: $${p.price}, Purchase: $${p.purchasePrice || 'N/A'}, Stock: ${p.stockQuantity || 0}`)
      console.log(`   Category: ${p.category || 'N/A'}`)
    })

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkProducts()
