const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  // User (null cho guest users - dùng session)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Session ID cho guest users
  sessionId: {
    type: String,
    default: null
  },

  // Cart items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Auto-delete after 30 days of inactivity
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000),
    index: { expires: 0 } // TTL index
  }

}, {
  timestamps: true
});

// Ensure either user or sessionId exists
cartSchema.index({ user: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });

cartSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Cart', cartSchema);