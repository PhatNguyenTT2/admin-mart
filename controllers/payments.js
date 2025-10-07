const paymentsRouter = require('express').Router()
const Payment = require('../models/payment')
const Order = require('../models/order')
const PurchaseOrder = require('../models/purchaseOrder')
const Customer = require('../models/customer')
const Supplier = require('../models/supplier')
const { userExtractor } = require('../utils/auth')

// GET /api/payments - Get all payments with filtering
paymentsRouter.get('/', userExtractor, async (request, response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-paymentDate',
      paymentType,
      paymentMethod,
      status,
      startDate,
      endDate
    } = request.query

    // Build filter object
    const filter = {}

    if (paymentType) {
      filter.paymentType = paymentType
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod
    }

    if (status) {
      filter.status = status
    }

    if (startDate || endDate) {
      filter.paymentDate = {}
      if (startDate) filter.paymentDate.$gte = new Date(startDate)
      if (endDate) filter.paymentDate.$lte = new Date(endDate)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const payments = await Payment
      .find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('customer', 'customerCode fullName')
      .populate('supplier', 'supplierCode companyName')
      .populate('receivedBy', 'username')

    const total = await Payment.countDocuments(filter)

    response.json({
      payments,
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

// GET /api/payments/stats - Get payment statistics
paymentsRouter.get('/stats', userExtractor, async (request, response) => {
  try {
    const totalPayments = await Payment.countDocuments()

    // Total sales payments
    const salesPayments = await Payment.aggregate([
      { $match: { paymentType: 'sales', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    // Total purchase payments
    const purchasePayments = await Payment.aggregate([
      { $match: { paymentType: 'purchase', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    // Payments by method
    const paymentsByMethod = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ])

    response.json({
      totalPayments,
      totalSalesAmount: salesPayments[0]?.total || 0,
      totalPurchaseAmount: purchasePayments[0]?.total || 0,
      paymentsByMethod
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/payments/:id - Get payment by ID
paymentsRouter.get('/:id', userExtractor, async (request, response) => {
  try {
    const payment = await Payment
      .findById(request.params.id)
      .populate('customer', 'customerCode fullName email phone')
      .populate('supplier', 'supplierCode companyName email phone')
      .populate('receivedBy', 'username email')

    if (!payment) {
      return response.status(404).json({ error: 'Payment not found' })
    }

    response.json(payment)
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// GET /api/payments/order/:orderId - Get payments for an order
paymentsRouter.get('/order/:orderId', userExtractor, async (request, response) => {
  try {
    const payments = await Payment
      .find({ relatedOrderId: request.params.orderId })
      .sort('-paymentDate')
      .populate('receivedBy', 'username')

    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.netAmount, 0)

    response.json({
      payments,
      totalPaid
    })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

// POST /api/payments - Create new payment
paymentsRouter.post('/', userExtractor, async (request, response) => {
  try {
    const {
      paymentType,
      relatedOrderId,
      amount,
      paymentMethod,
      paymentDate,
      transactionId,
      bankReference,
      cardLastFourDigits,
      notes
    } = request.body

    // Validate required fields
    if (!paymentType || !relatedOrderId || !amount || !paymentMethod) {
      return response.status(400).json({
        error: 'Payment type, related order, amount, and payment method are required'
      })
    }

    let order
    let relatedOrderNumber
    let customer
    let supplier

    // Verify order exists and get details
    if (paymentType === 'sales') {
      order = await Order.findById(relatedOrderId)
      if (!order) {
        return response.status(404).json({ error: 'Order not found' })
      }
      relatedOrderNumber = order.orderNumber
      customer = order.customer?.customerId
    } else if (paymentType === 'purchase') {
      order = await PurchaseOrder.findById(relatedOrderId)
      if (!order) {
        return response.status(404).json({ error: 'Purchase order not found' })
      }
      relatedOrderNumber = order.poNumber
      supplier = order.supplier
    }

    const payment = new Payment({
      paymentType,
      relatedOrderId,
      relatedOrderNumber,
      amount,
      paymentMethod,
      paymentDate: paymentDate || new Date(),
      transactionId,
      bankReference,
      cardLastFourDigits,
      customer,
      supplier,
      receivedBy: request.user.id,
      notes
    })

    const savedPayment = await payment.save()

    // Update order payment status
    if (paymentType === 'sales') {
      const totalPaid = await Payment.aggregate([
        {
          $match: {
            relatedOrderId: order._id,
            status: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$refundedAmount'] } } } }
      ])

      const paidAmount = totalPaid[0]?.total || 0

      if (paidAmount >= order.total) {
        order.paymentStatus = 'paid'
      } else if (paidAmount > 0) {
        order.paymentStatus = 'partial'
      }

      await order.save()
    } else if (paymentType === 'purchase') {
      await order.addPayment(amount)
    }

    await savedPayment.populate('customer', 'customerCode fullName')
    await savedPayment.populate('supplier', 'supplierCode companyName')
    await savedPayment.populate('receivedBy', 'username')

    response.status(201).json(savedPayment)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// POST /api/payments/:id/refund - Process refund
paymentsRouter.post('/:id/refund', userExtractor, async (request, response) => {
  try {
    const { amount, reason } = request.body

    if (!amount || amount <= 0) {
      return response.status(400).json({
        error: 'Refund amount must be positive'
      })
    }

    if (!reason) {
      return response.status(400).json({
        error: 'Refund reason is required'
      })
    }

    const payment = await Payment.findById(request.params.id)

    if (!payment) {
      return response.status(404).json({ error: 'Payment not found' })
    }

    await payment.processRefund(amount, reason)

    // Update order payment status if sales payment
    if (payment.paymentType === 'sales') {
      const order = await Order.findById(payment.relatedOrderId)
      if (order) {
        const totalPaid = await Payment.aggregate([
          {
            $match: {
              relatedOrderId: order._id,
              status: 'completed'
            }
          },
          { $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$refundedAmount'] } } } }
        ])

        const paidAmount = totalPaid[0]?.total || 0

        if (paidAmount >= order.total) {
          order.paymentStatus = 'paid'
        } else if (paidAmount > 0) {
          order.paymentStatus = 'partial'
        } else {
          order.paymentStatus = 'unpaid'
        }

        await order.save()
      }
    }

    response.json({
      message: 'Refund processed successfully',
      payment
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PUT /api/payments/:id/cancel - Cancel payment
paymentsRouter.put('/:id/cancel', userExtractor, async (request, response) => {
  try {
    const { reason } = request.body

    if (!reason) {
      return response.status(400).json({
        error: 'Cancellation reason is required'
      })
    }

    const payment = await Payment.findById(request.params.id)

    if (!payment) {
      return response.status(404).json({ error: 'Payment not found' })
    }

    await payment.cancel(reason)

    response.json({
      message: 'Payment cancelled successfully',
      payment
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// PUT /api/payments/:id/fail - Mark payment as failed
paymentsRouter.put('/:id/fail', userExtractor, async (request, response) => {
  try {
    const { reason } = request.body

    if (!reason) {
      return response.status(400).json({
        error: 'Failure reason is required'
      })
    }

    const payment = await Payment.findById(request.params.id)

    if (!payment) {
      return response.status(404).json({ error: 'Payment not found' })
    }

    await payment.markAsFailed(reason)

    response.json({
      message: 'Payment marked as failed',
      payment
    })
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

// DELETE /api/payments/:id - Delete payment (only pending/failed)
paymentsRouter.delete('/:id', userExtractor, async (request, response) => {
  try {
    const payment = await Payment.findById(request.params.id)

    if (!payment) {
      return response.status(404).json({ error: 'Payment not found' })
    }

    // Only pending or failed payments can be deleted
    if (!['pending', 'failed', 'cancelled'].includes(payment.status)) {
      return response.status(400).json({
        error: 'Only pending, failed, or cancelled payments can be deleted'
      })
    }

    await Payment.findByIdAndDelete(request.params.id)
    response.json({ message: 'Payment deleted successfully' })
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

module.exports = paymentsRouter
