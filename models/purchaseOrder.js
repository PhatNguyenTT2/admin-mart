const mongoose = require('mongoose')

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    unique: true,
    // Auto-generate: PO2025000001
  },

  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },

  orderDate: {
    type: Date,
    default: Date.now
  },

  expectedDeliveryDate: {
    type: Date
  },

  actualDeliveryDate: {
    type: Date
  },

  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String, // Cached for history
    sku: String, // Cached for history
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    subtotal: {
      type: Number,
      default: 0
    },
    received: {
      type: Number,
      default: 0,
      min: 0
    }
  }],

  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },

  shippingFee: {
    type: Number,
    default: 0,
    min: 0
  },

  tax: {
    type: Number,
    default: 0,
    min: 0
  },

  discount: {
    type: Number,
    default: 0,
    min: 0
  },

  total: {
    type: Number,
    default: 0,
    min: 0
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'received', 'cancelled'],
    default: 'pending'
  },

  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },

  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  approvedAt: {
    type: Date
  },

  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  notes: {
    type: String,
    trim: true
  },

  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for faster queries
purchaseOrderSchema.index({ poNumber: 1 })
purchaseOrderSchema.index({ supplier: 1 })
purchaseOrderSchema.index({ status: 1 })
purchaseOrderSchema.index({ paymentStatus: 1 })
purchaseOrderSchema.index({ orderDate: -1 })

// Pre-save hook to generate PO number
purchaseOrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.poNumber) {
    const year = new Date().getFullYear()
    const count = await mongoose.model('PurchaseOrder').countDocuments()
    this.poNumber = `PO${year}${String(count + 1).padStart(6, '0')}`
  }
  next()
})

// Pre-save hook to calculate totals
purchaseOrderSchema.pre('save', function (next) {
  // Calculate subtotal for each item
  this.items.forEach(item => {
    item.subtotal = item.quantity * item.unitPrice
  })

  // Calculate order subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0)

  // Calculate total
  this.total = this.subtotal + this.shippingFee + this.tax - this.discount

  next()
})

// Method to approve purchase order
purchaseOrderSchema.methods.approve = function (userId) {
  if (this.status !== 'pending') {
    throw new Error('Only pending purchase orders can be approved')
  }

  this.status = 'approved'
  this.approvedBy = userId
  this.approvedAt = new Date()

  return this.save()
}

// Method to receive items
purchaseOrderSchema.methods.receiveItems = async function (receivedItems, userId) {
  const Product = mongoose.model('Product')
  const Inventory = mongoose.model('Inventory')

  for (const receivedItem of receivedItems) {
    const orderItem = this.items.find(
      item => item.product.toString() === receivedItem.productId
    )

    if (!orderItem) {
      throw new Error(`Product ${receivedItem.productId} not found in this purchase order`)
    }

    if (receivedItem.quantity > orderItem.quantity - orderItem.received) {
      throw new Error(`Cannot receive more than ordered quantity for product ${receivedItem.productId}`)
    }

    // Update received quantity
    orderItem.received += receivedItem.quantity

    // Update product stock
    const product = await Product.findById(receivedItem.productId)
    if (product) {
      product.stock += receivedItem.quantity
      await product.save()
    }

    // Update inventory
    let inventory = await Inventory.findOne({ product: receivedItem.productId })
    if (!inventory) {
      inventory = new Inventory({ product: receivedItem.productId })
    }

    inventory.quantityOnHand += receivedItem.quantity
    inventory.lastRestocked = new Date()
    inventory.movements.push({
      type: 'in',
      quantity: receivedItem.quantity,
      reason: 'Purchase Order Received',
      referenceId: this._id.toString(),
      performedBy: userId
    })

    await inventory.save()
  }

  // Mark as received
  this.status = 'received'
  this.actualDeliveryDate = new Date()
  this.receivedBy = userId

  return this.save()
}

// Method to cancel purchase order
purchaseOrderSchema.methods.cancel = function () {
  if (this.status === 'received') {
    throw new Error('Cannot cancel a purchase order that has been received')
  }

  this.status = 'cancelled'
  return this.save()
}

// Method to update payment
purchaseOrderSchema.methods.addPayment = function (amount) {
  if (amount <= 0) {
    throw new Error('Payment amount must be positive')
  }

  if (this.paidAmount + amount > this.total) {
    throw new Error('Payment amount exceeds total')
  }

  this.paidAmount += amount

  if (this.paidAmount >= this.total) {
    this.paymentStatus = 'paid'
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'partial'
  }

  return this.save()
}

purchaseOrderSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema)
