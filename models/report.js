const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
  reportNumber: {
    type: String,
    unique: true
    // Auto-generate: RPT2025000001
  },

  reportType: {
    type: String,
    enum: ['sales', 'inventory', 'revenue', 'profit', 'customer', 'product', 'supplier'],
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  // Keep old field for backward compatibility
  reportName: {
    type: String,
    trim: true
  },

  period: {
    startDate: Date,
    endDate: Date
  },

  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'scheduled'],
    default: 'pending'
  },

  generatedAt: Date,

  fileUrl: {
    type: String,
    trim: true
  },

  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
reportSchema.index({ reportNumber: 1 })
reportSchema.index({ reportType: 1 })
reportSchema.index({ status: 1 })
reportSchema.index({ 'period.startDate': 1, 'period.endDate': 1 })
reportSchema.index({ generatedBy: 1 })
reportSchema.index({ createdAt: -1 })

// Pre-save hook to generate report number
reportSchema.pre('save', async function (next) {
  if (this.isNew && !this.reportNumber) {
    const year = new Date().getFullYear()
    const count = await mongoose.model('Report').countDocuments()
    this.reportNumber = `RPT${year}${String(count + 1).padStart(6, '0')}`
  }

  // Sync reportName with title for backward compatibility
  if (this.title && !this.reportName) {
    this.reportName = this.title
  }

  next()
})

// Virtual for period duration in days
reportSchema.virtual('periodDuration').get(function () {
  if (this.period?.startDate && this.period?.endDate) {
    const duration = this.period.endDate - this.period.startDate
    return Math.ceil(duration / (1000 * 60 * 60 * 24))
  }
  return 0
})

reportSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Report', reportSchema)
