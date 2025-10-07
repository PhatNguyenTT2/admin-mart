const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ['sales', 'inventory', 'revenue', 'profit', 'customer', 'product', 'supplier'],
    required: true
  },

  reportName: {
    type: String,
    required: true,
    trim: true
  },

  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },

  // Dynamic data structure based on reportType
  data: {
    type: mongoose.Schema.Types.Mixed
  },

  summary: {
    totalRevenue: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    profitMargin: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    customerCount: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 }
  },

  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  format: {
    type: String,
    enum: ['json', 'pdf', 'excel', 'csv'],
    default: 'json'
  },

  filePath: {
    type: String,
    trim: true
  },

  notes: {
    type: String,
    trim: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for faster queries
reportSchema.index({ reportType: 1 })
reportSchema.index({ 'period.startDate': 1, 'period.endDate': 1 })
reportSchema.index({ generatedBy: 1 })
reportSchema.index({ createdAt: -1 })

// Virtual for period duration in days
reportSchema.virtual('periodDuration').get(function () {
  const duration = this.period.endDate - this.period.startDate
  return Math.ceil(duration / (1000 * 60 * 60 * 24))
})

reportSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Report', reportSchema)
