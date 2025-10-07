const reportsRouter = require('express').Router()
const Report = require('../models/report')
const Order = require('../models/order')
const Product = require('../models/product')
const Customer = require('../models/customer')
const Inventory = require('../models/inventory')
const Payment = require('../models/payment')
const PurchaseOrder = require('../models/purchaseOrder')
const Supplier = require('../models/supplier')
const { userExtractor } = require('../utils/auth')

// GET /api/reports - Get all reports with filtering
reportsRouter.get('/', userExtractor, async (request, response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      reportType
    } = request.query

    const filter = {}
    if (reportType) {
      filter.reportType = reportType
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const reports = await Report
      .find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('generatedBy', 'username email')
      .select('-data') // Exclude large data field from list

    const total = await Report.countDocuments(filter)

    response.json({
      reports,
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

// POST /api/reports - Generic report generation (routes to specific type)
reportsRouter.post('/', userExtractor, async (request, response) => {
  try {
    const { reportType, title, period, format = 'pdf', parameters = {} } = request.body

    // Validate required fields
    if (!reportType) {
      return response.status(400).json({ error: 'reportType is required' })
    }

    if (!title) {
      return response.status(400).json({ error: 'title is required' })
    }

    // Create report record
    const report = new Report({
      reportType,
      title,
      period: period || {},
      format,
      parameters,
      generatedBy: request.user.id,
      status: 'pending'
    })

    await report.save()

    // Generate report data based on type
    let reportData = {}

    try {
      switch (reportType) {
        case 'sales':
          reportData = await generateSalesReport(period, parameters)
          break
        case 'inventory':
          reportData = await generateInventoryReport(period, parameters)
          break
        case 'revenue':
          reportData = await generateRevenueReport(period, parameters)
          break
        case 'profit':
          reportData = await generateProfitReport(period, parameters)
          break
        case 'customer':
          reportData = await generateCustomerReport(period, parameters)
          break
        case 'product':
          reportData = await generateProductReport(period, parameters)
          break
        case 'supplier':
          reportData = await generateSupplierReport(period, parameters)
          break
        default:
          throw new Error(`Unsupported report type: ${reportType}`)
      }

      // Update report with data
      report.data = reportData
      report.status = 'completed'
      report.generatedAt = new Date()
      report.fileUrl = `/reports/${report._id}/download` // Mock URL
      await report.save()

      response.status(201).json({
        message: 'Report generated successfully',
        report
      })
    } catch (error) {
      report.status = 'failed'
      report.data = { error: error.message }
      await report.save()
      throw error
    }
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// Helper functions for generating reports
async function generateSalesReport(period, parameters) {
  const filter = {}
  if (period?.startDate) filter.createdAt = { $gte: new Date(period.startDate) }
  if (period?.endDate) {
    filter.createdAt = { ...filter.createdAt, $lte: new Date(period.endDate) }
  }

  const orders = await Order.find(filter).populate('items.product')

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return {
    summary: { totalRevenue, totalOrders, averageOrderValue },
    orders: parameters.includeDetails ? orders : undefined
  }
}

async function generateInventoryReport(period, parameters) {
  const inventory = await Inventory.find().populate('product')

  const totalValue = inventory.reduce((sum, inv) =>
    sum + (inv.quantityOnHand * (inv.product?.price || 0)), 0
  )

  return {
    summary: {
      totalItems: inventory.length,
      totalValue,
      lowStock: inventory.filter(i => i.quantityAvailable <= i.reorderPoint).length,
      outOfStock: inventory.filter(i => i.quantityAvailable === 0).length
    },
    items: parameters.includeDetails ? inventory : undefined
  }
}

async function generateRevenueReport(period, parameters) {
  const filter = {}
  if (period?.startDate) filter.paymentDate = { $gte: new Date(period.startDate) }
  if (period?.endDate) {
    filter.paymentDate = { ...filter.paymentDate, $lte: new Date(period.endDate) }
  }
  filter.status = 'completed'

  const payments = await Payment.find(filter)
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

  return {
    summary: { totalRevenue, totalTransactions: payments.length },
    payments: parameters.includeDetails ? payments : undefined
  }
}

async function generateProfitReport(period, parameters) {
  // Simplified profit calculation
  const filter = {}
  if (period?.startDate) filter.createdAt = { $gte: new Date(period.startDate) }
  if (period?.endDate) {
    filter.createdAt = { ...filter.createdAt, $lte: new Date(period.endDate) }
  }

  const orders = await Order.find(filter)
  const revenue = orders.reduce((sum, o) => sum + o.total, 0)

  // Mock cost calculation (70% of revenue)
  const cost = revenue * 0.7
  const profit = revenue - cost
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0

  return {
    summary: { revenue, cost, profit, margin: margin.toFixed(2) + '%' }
  }
}

async function generateCustomerReport(period, parameters) {
  const customers = await Customer.find()

  const topCustomers = customers
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, parameters.topCustomersLimit || 10)

  return {
    summary: {
      totalCustomers: customers.length,
      averageSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length
    },
    topCustomers: parameters.includeTopCustomers ? topCustomers : undefined
  }
}

async function generateProductReport(period, parameters) {
  const products = await Product.find().populate('category')

  const topSellers = products
    .sort((a, b) => b.stock - a.stock)
    .slice(0, parameters.topProductsLimit || 10)

  return {
    summary: { totalProducts: products.length },
    topSellers: parameters.includeBestSellers ? topSellers : undefined
  }
}

async function generateSupplierReport(period, parameters) {
  const suppliers = await Supplier.find()

  return {
    summary: { totalSuppliers: suppliers.length },
    suppliers: parameters.includeDetails ? suppliers : undefined
  }
}

// GET /api/reports/:id - Get report by ID
reportsRouter.get('/:id', userExtractor, async (request, response) => {
  try {
    const report = await Report
      .findById(request.params.id)
      .populate('generatedBy', 'username email')

    if (!report) {
      return response.status(404).json({ error: 'Report not found' })
    }

    response.json(report)
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// POST /api/reports/sales - Generate sales report
reportsRouter.post('/sales', userExtractor, async (request, response) => {
  try {
    const { startDate, endDate, reportName } = request.body

    if (!startDate || !endDate) {
      return response.status(400).json({
        error: 'Start date and end date are required'
      })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Get orders in the period
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['processing', 'shipped', 'delivered', 'completed'] }
    }).populate('items.product', 'name sku category')

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const orderCount = orders.length
    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0

    // Group by date
    const dailySales = {}
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0]
      if (!dailySales[date]) {
        dailySales[date] = { revenue: 0, orders: 0 }
      }
      dailySales[date].revenue += order.total
      dailySales[date].orders += 1
    })

    // Top products
    const productSales = {}
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product?._id?.toString()
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              product: item.product,
              quantity: 0,
              revenue: 0
            }
          }
          productSales[productId].quantity += item.quantity
          productSales[productId].revenue += item.price * item.quantity
        }
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Payment methods breakdown
    const paymentMethods = {}
    orders.forEach(order => {
      const method = order.paymentMethod || 'unknown'
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, revenue: 0 }
      }
      paymentMethods[method].count += 1
      paymentMethods[method].revenue += order.total
    })

    const report = new Report({
      reportType: 'sales',
      reportName: reportName || `Sales Report ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      period: { startDate: start, endDate: end },
      data: {
        orders: orders.map(o => ({
          orderNumber: o.orderNumber,
          date: o.createdAt,
          total: o.total,
          status: o.status,
          paymentMethod: o.paymentMethod
        })),
        dailySales,
        topProducts,
        paymentMethods
      },
      summary: {
        totalRevenue,
        orderCount,
        averageOrderValue
      },
      generatedBy: request.user.id
    })

    const savedReport = await report.save()
    await savedReport.populate('generatedBy', 'username email')

    response.status(201).json(savedReport)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// POST /api/reports/inventory - Generate inventory report
reportsRouter.post('/inventory', userExtractor, async (request, response) => {
  try {
    const { reportName } = request.body

    const inventory = await Inventory
      .find()
      .populate('product', 'name sku price category vendor')

    const totalItems = inventory.length
    const totalValue = inventory.reduce(
      (sum, inv) => sum + (inv.quantityOnHand * (inv.product?.price || 0)),
      0
    )

    const lowStockItems = inventory.filter(inv => inv.isLowStock)
    const outOfStockItems = inventory.filter(inv => inv.quantityAvailable === 0)

    // Category breakdown
    const categoryBreakdown = {}
    inventory.forEach(inv => {
      const category = inv.product?.category || 'uncategorized'
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = {
          items: 0,
          quantity: 0,
          value: 0
        }
      }
      categoryBreakdown[category].items += 1
      categoryBreakdown[category].quantity += inv.quantityOnHand
      categoryBreakdown[category].value += inv.quantityOnHand * (inv.product?.price || 0)
    })

    const report = new Report({
      reportType: 'inventory',
      reportName: reportName || `Inventory Report ${new Date().toLocaleDateString()}`,
      period: {
        startDate: new Date(),
        endDate: new Date()
      },
      data: {
        inventory: inventory.map(inv => ({
          product: inv.product,
          quantityOnHand: inv.quantityOnHand,
          quantityReserved: inv.quantityReserved,
          quantityAvailable: inv.quantityAvailable,
          reorderPoint: inv.reorderPoint,
          value: inv.quantityOnHand * (inv.product?.price || 0),
          isLowStock: inv.isLowStock
        })),
        lowStockItems: lowStockItems.map(inv => ({
          product: inv.product,
          quantityAvailable: inv.quantityAvailable,
          reorderPoint: inv.reorderPoint
        })),
        outOfStockItems: outOfStockItems.map(inv => ({
          product: inv.product
        })),
        categoryBreakdown
      },
      summary: {
        productCount: totalItems,
        totalRevenue: totalValue // Using totalRevenue field for inventory value
      },
      generatedBy: request.user.id
    })

    const savedReport = await report.save()
    await savedReport.populate('generatedBy', 'username email')

    response.status(201).json(savedReport)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// POST /api/reports/revenue - Generate revenue report
reportsRouter.post('/revenue', userExtractor, async (request, response) => {
  try {
    const { startDate, endDate, reportName } = request.body

    if (!startDate || !endDate) {
      return response.status(400).json({
        error: 'Start date and end date are required'
      })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Sales revenue
    const salesOrders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['processing', 'shipped', 'delivered', 'completed'] }
    })

    const salesRevenue = salesOrders.reduce((sum, order) => sum + order.total, 0)

    // Purchase costs
    const purchaseOrders = await PurchaseOrder.find({
      orderDate: { $gte: start, $lte: end },
      status: { $in: ['received', 'partially_received'] }
    })

    const purchaseCosts = purchaseOrders.reduce((sum, po) => sum + po.total, 0)

    // Gross profit
    const grossProfit = salesRevenue - purchaseCosts
    const profitMargin = salesRevenue > 0 ? (grossProfit / salesRevenue) * 100 : 0

    // Payments received
    const payments = await Payment.find({
      paymentDate: { $gte: start, $lte: end },
      paymentType: 'sales',
      status: 'completed'
    })

    const paymentsReceived = payments.reduce(
      (sum, payment) => sum + payment.netAmount,
      0
    )

    // Monthly breakdown
    const monthlyData = {}
    salesOrders.forEach(order => {
      const month = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, orders: 0 }
      }
      monthlyData[month].revenue += order.total
      monthlyData[month].orders += 1
    })

    const report = new Report({
      reportType: 'revenue',
      reportName: reportName || `Revenue Report ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      period: { startDate: start, endDate: end },
      data: {
        salesRevenue,
        purchaseCosts,
        grossProfit,
        profitMargin,
        paymentsReceived,
        monthlyData,
        salesOrders: salesOrders.length,
        purchaseOrders: purchaseOrders.length
      },
      summary: {
        totalRevenue: salesRevenue,
        totalCost: purchaseCosts,
        profit: grossProfit,
        profitMargin,
        orderCount: salesOrders.length
      },
      generatedBy: request.user.id
    })

    const savedReport = await report.save()
    await savedReport.populate('generatedBy', 'username email')

    response.status(201).json(savedReport)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// POST /api/reports/customer - Generate customer report
reportsRouter.post('/customer', userExtractor, async (request, response) => {
  try {
    const { startDate, endDate, reportName } = request.body

    if (!startDate || !endDate) {
      return response.status(400).json({
        error: 'Start date and end date are required'
      })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    const customers = await Customer.find()
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.isActive).length

    // Customer type breakdown
    const customerTypes = {
      retail: customers.filter(c => c.customerType === 'retail').length,
      wholesale: customers.filter(c => c.customerType === 'wholesale').length,
      vip: customers.filter(c => c.customerType === 'vip').length
    }

    // Top customers by spending
    const topCustomers = customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map(c => ({
        customerCode: c.customerCode,
        fullName: c.fullName,
        totalSpent: c.totalSpent,
        totalPurchases: c.totalPurchases,
        customerType: c.customerType
      }))

    // New customers in period
    const newCustomers = customers.filter(
      c => c.createdAt >= start && c.createdAt <= end
    )

    const report = new Report({
      reportType: 'customer',
      reportName: reportName || `Customer Report ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      period: { startDate: start, endDate: end },
      data: {
        totalCustomers,
        activeCustomers,
        customerTypes,
        topCustomers,
        newCustomers: newCustomers.length,
        totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
        averageSpent: totalCustomers > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers : 0
      },
      summary: {
        customerCount: totalCustomers
      },
      generatedBy: request.user.id
    })

    const savedReport = await report.save()
    await savedReport.populate('generatedBy', 'username email')

    response.status(201).json(savedReport)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// DELETE /api/reports/:id - Delete report
reportsRouter.delete('/:id', userExtractor, async (request, response) => {
  try {
    const report = await Report.findById(request.params.id)

    if (!report) {
      return response.status(404).json({ error: 'Report not found' })
    }

    await Report.findByIdAndDelete(request.params.id)
    response.json({ message: 'Report deleted successfully' })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

module.exports = reportsRouter
