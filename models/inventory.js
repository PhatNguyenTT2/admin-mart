const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },

  quantityOnHand: {
    type: Number,
    default: 0,
    min: 0
  },

  quantityReserved: {
    type: Number,
    default: 0,
    min: 0
  },

  quantityAvailable: {
    type: Number,
    default: 0,
    min: 0
  },

  reorderPoint: {
    type: Number,
    default: 10,
    min: 0
  },

  reorderQuantity: {
    type: Number,
    default: 50,
    min: 0
  },

  warehouseLocation: {
    type: String,
    trim: true
  },

  lastRestocked: {
    type: Date
  },

  lastSold: {
    type: Date
  },

  // Inventory movements history
  movements: [{
    type: {
      type: String,
      enum: ['in', 'out', 'adjustment', 'reserved', 'released'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    adjustmentType: {
      type: String,
      enum: ['increase', 'decrease'],
      trim: true
    },
    reason: {
      type: String,
      trim: true
    },
    referenceId: {
      type: String,
      trim: true
    },
    referenceType: {
      type: String,
      enum: ['order', 'purchase_order', 'stock_adjustment', 'reservation', 'release', 'return'],
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for faster queries
inventorySchema.index({ product: 1 })
inventorySchema.index({ quantityAvailable: 1 })
inventorySchema.index({ 'movements.date': -1 })

// Pre-save hook to calculate available quantity
inventorySchema.pre('save', function (next) {
  this.quantityAvailable = this.quantityOnHand - this.quantityReserved
  next()
})

// Method to add stock (receive from purchase order)
inventorySchema.methods.addStock = function (quantity, reason, referenceId, userId) {
  if (quantity <= 0) {
    throw new Error('Quantity must be positive')
  }

  this.quantityOnHand += quantity
  this.lastRestocked = new Date()

  this.movements.push({
    type: 'in',
    quantity,
    reason,
    referenceId,
    referenceType: 'purchase_order',
    performedBy: userId
  })

  return this.save()
}

// Method to remove stock (sell)
inventorySchema.methods.removeStock = function (quantity, reason, referenceId, userId) {
  if (quantity <= 0) {
    throw new Error('Quantity must be positive')
  }

  if (this.quantityAvailable < quantity) {
    throw new Error('Insufficient stock available')
  }

  this.quantityOnHand -= quantity
  this.lastSold = new Date()

  this.movements.push({
    type: 'out',
    quantity,
    reason,
    referenceId,
    referenceType: 'order',
    performedBy: userId
  })

  return this.save()
}

// Method to reserve stock (add to cart)
inventorySchema.methods.reserveStock = function (quantity, referenceId, userId) {
  if (quantity <= 0) {
    throw new Error('Quantity must be positive')
  }

  if (this.quantityAvailable < quantity) {
    throw new Error('Insufficient stock available')
  }

  this.quantityReserved += quantity

  this.movements.push({
    type: 'reserved',
    quantity,
    reason: 'Reserved for order',
    referenceId,
    referenceType: 'order',
    performedBy: userId
  })

  return this.save()
}

// Method to release reserved stock (remove from cart or cancel order)
inventorySchema.methods.releaseStock = function (quantity, referenceId, userId) {
  if (quantity <= 0) {
    throw new Error('Quantity must be positive')
  }

  if (this.quantityReserved < quantity) {
    throw new Error('Insufficient reserved stock')
  }

  this.quantityReserved -= quantity

  this.movements.push({
    type: 'released',
    quantity,
    reason: 'Released from reservation',
    referenceId,
    referenceType: 'order',
    performedBy: userId
  })

  return this.save()
}

// Method to adjust stock (manual correction)
inventorySchema.methods.adjustStock = function (newQuantity, reason, userId) {
  const difference = newQuantity - this.quantityOnHand

  this.quantityOnHand = newQuantity

  this.movements.push({
    type: 'adjustment',
    quantity: Math.abs(difference),
    adjustmentType: difference > 0 ? 'increase' : 'decrease',
    reason: `${reason} (${difference > 0 ? '+' : ''}${difference})`,
    referenceType: 'adjustment',
    performedBy: userId
  })

  return this.save()
}

// Method to add stock as adjustment (for refunds)
inventorySchema.methods.adjustStockIncrease = function (quantity, reason, referenceId, userId) {
  if (quantity <= 0) {
    throw new Error('Quantity must be positive')
  }

  this.quantityOnHand += quantity
  this.lastRestocked = new Date()

  this.movements.push({
    type: 'adjustment',
    quantity,
    adjustmentType: 'increase',
    reason,
    referenceId,
    referenceType: 'order',
    performedBy: userId
  })

  return this.save()
}

// Virtual to check if stock is low
inventorySchema.virtual('isLowStock').get(function () {
  return this.quantityAvailable <= this.reorderPoint
})

// Virtual to get turnover rate (simplified)
inventorySchema.virtual('turnoverInfo').get(function () {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const outMovements = this.movements.filter(
    m => m.type === 'out' && m.date >= thirtyDaysAgo
  )

  const totalOut = outMovements.reduce((sum, m) => sum + m.quantity, 0)

  return {
    soldLast30Days: totalOut,
    averagePerDay: totalOut / 30
  }
})

// Static method to get reserved items by order
inventorySchema.statics.getReservedByOrder = async function (orderId) {
  const inventories = await this.find({
    'movements': {
      $elemMatch: {
        type: 'reserved',
        referenceId: orderId,
        referenceType: 'order'
      }
    }
  }).populate('product')

  return inventories.map(inv => {
    const reservedMovement = inv.movements.find(
      m => m.type === 'reserved' && m.referenceId === orderId
    )
    return {
      product: inv.product,
      quantityReserved: reservedMovement?.quantity || 0,
      inventory: inv
    }
  }).filter(item => item.quantityReserved > 0)
}

inventorySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Inventory', inventorySchema)
