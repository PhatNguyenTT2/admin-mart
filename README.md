# Mini Store - Backend API

> Node.js + Express + MongoDB backend for the Mini Store Admin Dashboard

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green.svg)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.18.3-red.svg)](https://mongoosejs.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Testing](#testing)

---

## 🎯 Overview

REST API backend for the Mini Store e-commerce admin dashboard. Provides complete CRUD operations for products, categories, orders, users, and cart management with JWT authentication.

### Features

- ✅ **JWT Authentication** - Secure login/register system
- ✅ **User Management** - Admin, employee, user roles
- ✅ **Product CRUD** - Full product management with filters
- ✅ **Category Management** - Organize products by categories
- ✅ **Order Processing** - Complete order lifecycle management
- ✅ **Shopping Cart** - Cart operations with stock validation
- ✅ **Pagination** - All list endpoints support pagination
- ✅ **Search & Filter** - Advanced product filtering
- ✅ **Stock Management** - Automatic stock updates on orders
- ✅ **Error Handling** - Comprehensive error responses

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20.x | Runtime environment |
| **Express.js** | 5.1.0 | Web framework |
| **MongoDB** | 8.x | Database |
| **Mongoose** | 8.18.3 | ODM for MongoDB |
| **JWT** | 9.0.2 | Authentication tokens |
| **bcrypt** | 5.1.1 | Password hashing |
| **dotenv** | 17.2.3 | Environment variables |
| **Morgan** | 1.10.1 | HTTP request logger |

---

## 📁 Project Structure

```
backend/
├── controllers/           # Route handlers
│   ├── login.js          # Authentication endpoints
│   ├── users.js          # User management
│   ├── products.js       # Product CRUD + filters
│   ├── categories.js     # Category management
│   ├── orders.js         # Order processing
│   └── cart.js           # Shopping cart operations
├── models/               # Mongoose schemas
│   ├── user.js          # User model
│   ├── product.js       # Product model
│   ├── category.js      # Category model
│   ├── order.js         # Order model
│   └── cart.js          # Cart model
├── utils/               # Helper functions
│   ├── auth.js         # JWT middleware
│   ├── config.js       # Environment config
│   ├── logger.js       # Logging utility
│   └── middleware.js   # Error handling
├── app.js              # Express app setup
├── index.js            # Server entry point
├── package.json        # Dependencies
├── .env                # Environment variables (create this)
├── ENV_SETUP.md        # Environment setup guide
└── API_DOCUMENTATION.md # Complete API reference
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0 (local or MongoDB Atlas)
- **npm** >= 9.0.0

### Installation

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   
   Create `.env` file in the `backend/` directory:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/ministore
   TEST_MONGODB_URI=mongodb://localhost:27017/ministore-test
   JWT_SECRET=your-secret-jwt-key-change-this-in-production-min-32-chars
   NODE_ENV=development
   ```
   
   📖 **See [ENV_SETUP.md](./ENV_SETUP.md) for detailed setup guide**

4. **Start MongoDB** (if using local):
   ```bash
   mongod
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3001`

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with hot reload
npm run lint       # Run ESLint
npm test           # Run tests
npm run start:test # Start test server
```

---

## 🔌 API Endpoints

**Base URL**: `http://localhost:3001/api`

### Quick Reference

| Category | Endpoints | Description |
|----------|-----------|-------------|
| **Auth** | `POST /api/login` | Login |
|  | `POST /api/login/register` | Register admin |
|  | `POST /api/login/logout` | Logout |
|  | `GET /api/login/me` | Get current user |
| **Products** | `GET /api/products` | List products (with filters) |
|  | `GET /api/products/:id` | Get product detail |
|  | `POST /api/products` | Create product (admin) |
|  | `PUT /api/products/:id` | Update product (admin) |
|  | `DELETE /api/products/:id` | Delete product (admin) |
| **Categories** | `GET /api/categories` | List categories |
|  | `GET /api/categories/:id` | Get category |
|  | `POST /api/categories` | Create category (admin) |
|  | `PUT /api/categories/:id` | Update category (admin) |
|  | `DELETE /api/categories/:id` | Delete category (admin) |
| **Orders** | `GET /api/orders` | List orders (admin) |
|  | `GET /api/orders/:id` | Get order detail |
|  | `POST /api/orders` | Create order |
|  | `PATCH /api/orders/:id/status` | Update order status (admin) |
| **Cart** | `GET /api/cart` | Get user cart |
|  | `POST /api/cart/add` | Add to cart |
|  | `PUT /api/cart/update/:itemId` | Update quantity |
|  | `DELETE /api/cart/remove/:itemId` | Remove item |
| **Users** | `GET /api/users` | List users (admin) |
|  | `GET /api/users/:id` | Get user |
|  | `POST /api/users` | Create user (admin) |
|  | `PUT /api/users/:id` | Update user |

📖 **Complete API documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🗄️ Database Models

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  fullName: String,
  passwordHash: String,
  role: String (admin, user, employee),
  isActive: Boolean,
  tokens: [{ token, createdAt }],
  lastLogin: Date
}
```

### Product Model
```javascript
{
  name: String,
  slug: String (auto-generated),
  sku: String (unique),
  category: ObjectId (ref: Category),
  price: Number,
  originalPrice: Number,
  image: String,
  images: [String],
  description: String,
  detailDescription: Object,
  vendor: String,
  stock: Number,
  rating: Number,
  reviewCount: Number,
  tags: [String]
}
```

### Category Model
```javascript
{
  name: String (unique),
  slug: String (auto-generated),
  image: String,
  description: String,
  order: Number,
  isActive: Boolean
}
```

### Order Model
```javascript
{
  orderNumber: String (auto-generated: ORD2510000001),
  customer: {
    name, email, phone
  },
  user: ObjectId (ref: User),
  shippingAddress: Object,
  items: [{
    product: ObjectId,
    productName: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  subtotal: Number,
  shippingFee: Number,
  tax: Number,
  total: Number,
  status: String (pending, processing, shipping, delivered, cancelled),
  paymentStatus: String (pending, paid, failed, refunded)
}
```

### Cart Model
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number
  }],
  expiresAt: Date (auto-delete after 30 days)
}
```

---

## 🔐 Authentication

### JWT Token-Based Authentication

1. **Register** or **Login** to receive JWT token
2. Include token in Authorization header for protected routes:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Role-Based Access Control

- **Public**: Product listing, product detail, order creation
- **Authenticated**: Cart operations, my orders
- **Admin Only**: User management, product/category CRUD, all orders, order status updates

### Protected Route Example

```javascript
// Admin-only endpoint
app.use('/api/products', userExtractor, isAdmin, productsRouter)

// Authenticated endpoint
app.use('/api/cart', userExtractor, cartRouter)
```

---

## 🧪 Testing

### Test Order Creation

```bash
# 1. Register admin
curl -X POST http://localhost:3001/api/login/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "password": "admin123"
  }'

# 2. Login
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Save the returned token

# 3. Create category
curl -X POST http://localhost:3001/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grains",
    "description": "Organic grains and cereals"
  }'

# 4. Create product
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Quinoa",
    "sku": "SKU001",
    "category": "CATEGORY_ID_FROM_STEP_3",
    "price": 28.85,
    "originalPrice": 32.80,
    "image": "https://example.com/quinoa.jpg",
    "description": "Premium organic quinoa",
    "vendor": "Organic Farms",
    "stock": 100
  }'
```

---

## 🔧 Development Notes

### Adding New Endpoints

1. Create controller in `controllers/`
2. Define routes with express.Router()
3. Import and mount in `app.js`
4. Add authentication middleware if needed

### Database Indexing

Models include indexes for performance:
- Products: Text search on name/description/tags
- Orders: orderNumber, user+createdAt, status
- Categories: slug

### Error Handling

All errors are caught by the centralized error handler in `utils/middleware.js`:
- Validation errors → 400
- Cast errors → 400
- JWT errors → 401
- Duplicate key errors → 400

---

## 📦 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ministore
JWT_SECRET=secure-random-string-at-least-32-characters-long
```

### Deployment Platforms

- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo
- **DigitalOcean**: Use App Platform

---

## 🤝 Frontend Integration

Frontend is located in the parent directory (`../`). To connect frontend to backend:

1. **Update frontend `.env`**:
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

2. **Build frontend**:
   ```bash
   cd ..
   npm run build
   ```

3. **Backend serves frontend**:
   The `dist/` folder is automatically served by Express at `/`

---

## 📖 Additional Documentation

- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment variables setup guide
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference

---

## 🐛 Troubleshooting

### Cannot connect to MongoDB
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- For Atlas: Check IP whitelist

### JWT errors
- Verify `JWT_SECRET` is set in `.env`
- Check token format in Authorization header

### Port already in use
- Change `PORT` in `.env`
- Or kill process: `lsof -ti:3001 | xargs kill`

---

**Last Updated**: October 5, 2025  
**Backend Version**: 0.0.1  
**Status**: ✅ Complete & Ready for Integration
