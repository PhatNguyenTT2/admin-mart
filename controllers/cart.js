const cartRouter = require('express').Router()
const Cart = require('../models/cart')
const Product = require('../models/product')
const { userExtractor } = require('../utils/auth')

// GET /api/cart - Get user's cart
cartRouter.get('/', userExtractor, async (request, response) => {
  try {
    let cart = await Cart.findOne({ user: request.user._id })
      .populate('items.product', 'name price originalPrice image stock isActive')

    // Create empty cart if doesn't exist
    if (!cart) {
      cart = new Cart({
        user: request.user._id,
        items: []
      })
      await cart.save()
    }

    // Calculate cart totals
    let subtotal = 0
    const validItems = cart.items.filter(item =>
      item.product && item.product.isActive && item.product.stock > 0
    )

    validItems.forEach(item => {
      subtotal += item.product.price * item.quantity
    })

    // Remove invalid items
    if (validItems.length !== cart.items.length) {
      cart.items = validItems
      await cart.save()
    }

    response.status(200).json({
      success: true,
      data: {
        cart,
        summary: {
          itemCount: validItems.length,
          totalQuantity: validItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal
        }
      }
    })
  } catch (error) {
    response.status(500).json({
      error: 'Failed to fetch cart'
    })
  }
})

// POST /api/cart/add - Add item to cart
cartRouter.post('/add', userExtractor, async (request, response) => {
  const { productId, quantity = 1 } = request.body

  if (!productId) {
    return response.status(400).json({
      error: 'Product ID is required'
    })
  }

  if (quantity < 1) {
    return response.status(400).json({
      error: 'Quantity must be at least 1'
    })
  }

  try {
    // Verify product exists and is in stock
    const product = await Product.findById(productId)

    if (!product) {
      return response.status(404).json({
        error: 'Product not found'
      })
    }

    if (!product.isActive) {
      return response.status(400).json({
        error: 'Product is not available'
      })
    }

    if (product.stock < quantity) {
      return response.status(400).json({
        error: `Insufficient stock. Available: ${product.stock}`
      })
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: request.user._id })

    if (!cart) {
      cart = new Cart({
        user: request.user._id,
        items: []
      })
    }

    // Check if item already in cart
    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    )

    if (existingItem) {
      // Check if adding quantity exceeds stock
      if (existingItem.quantity + quantity > product.stock) {
        return response.status(400).json({
          error: `Cannot add more. Maximum available: ${product.stock}`
        })
      }
      existingItem.quantity += quantity
    } else {
      cart.items.push({
        product: productId,
        quantity
      })
    }

    await cart.save()
    await cart.populate('items.product', 'name price image stock')

    response.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: { cart }
    })
  } catch (error) {
    if (error.name === 'CastError') {
      return response.status(400).json({
        error: 'Invalid product ID'
      })
    }
    response.status(500).json({
      error: 'Failed to add item to cart'
    })
  }
})

// PUT /api/cart/update/:itemId - Update cart item quantity
cartRouter.put('/update/:itemId', userExtractor, async (request, response) => {
  const { quantity } = request.body

  if (!quantity || quantity < 1) {
    return response.status(400).json({
      error: 'Valid quantity is required (minimum 1)'
    })
  }

  try {
    const cart = await Cart.findOne({ user: request.user._id })

    if (!cart) {
      return response.status(404).json({
        error: 'Cart not found'
      })
    }

    const item = cart.items.id(request.params.itemId)

    if (!item) {
      return response.status(404).json({
        error: 'Item not found in cart'
      })
    }

    // Verify stock availability
    const product = await Product.findById(item.product)

    if (!product) {
      return response.status(404).json({
        error: 'Product not found'
      })
    }

    if (product.stock < quantity) {
      return response.status(400).json({
        error: `Insufficient stock. Available: ${product.stock}`
      })
    }

    item.quantity = quantity
    await cart.save()
    await cart.populate('items.product', 'name price image stock')

    response.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: { cart }
    })
  } catch (error) {
    response.status(500).json({
      error: 'Failed to update cart'
    })
  }
})

// DELETE /api/cart/remove/:itemId - Remove item from cart
cartRouter.delete('/remove/:itemId', userExtractor, async (request, response) => {
  try {
    const cart = await Cart.findOne({ user: request.user._id })

    if (!cart) {
      return response.status(404).json({
        error: 'Cart not found'
      })
    }

    const item = cart.items.id(request.params.itemId)

    if (!item) {
      return response.status(404).json({
        error: 'Item not found in cart'
      })
    }

    // Use pull to remove the item
    cart.items.pull(request.params.itemId)
    await cart.save()
    await cart.populate('items.product', 'name price image stock')

    response.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: { cart }
    })
  } catch (error) {
    response.status(500).json({
      error: 'Failed to remove item from cart'
    })
  }
})

// DELETE /api/cart/clear - Clear entire cart
cartRouter.delete('/clear', userExtractor, async (request, response) => {
  try {
    const cart = await Cart.findOne({ user: request.user._id })

    if (!cart) {
      return response.status(404).json({
        error: 'Cart not found'
      })
    }

    cart.items = []
    await cart.save()

    response.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart }
    })
  } catch (error) {
    response.status(500).json({
      error: 'Failed to clear cart'
    })
  }
})

module.exports = cartRouter
