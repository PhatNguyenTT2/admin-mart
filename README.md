# 🛒 Mini Store - Backend API

> Node.js + Express + MongoDB backend for Mini Store E-commerce Admin Dashboard  
> Complete business management system with inventory, procurement, and analytics

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green.svg)](https://www.mongodb.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.18.3-red.svg)](https://mongoosejs.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Implementation Status](#implementation-status)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Development Roadmap](#development-roadmap)
- [Testing](#testing)

---

## 🎯 Overview

**Mini Store Backend** is a comprehensive REST API system for e-commerce business management. It goes beyond basic product/order handling to include **inventory tracking**, **supplier management**, **procurement**, **payment processing**, and **business analytics**.

### System Modules

#### ✅ **Core E-commerce** (Implemented)
- **JWT Authentication** - Secure login/register with role-based access
- **User Management** - Admin, employee, user roles
- **Product Catalog** - Full CRUD with filtering, search, pagination
- **Category Management** - Hierarchical categories
- **Order Processing** - Complete order lifecycle with status tracking
- **Shopping Cart** - Cart operations with stock validation

#### 🟡 **Business Operations** (Models Ready, Controllers Pending)
- **Customer Management (CRM)** - Customer profiles, purchase history, loyalty
- **Inventory System** - Real-time stock tracking, movement history, reorder alerts
- **Payment Processing** - Transaction tracking, multiple payment methods, refunds
- **Procurement (B2B)** - Purchase orders, supplier orders, approval workflow
- **Supplier Management** - Vendor database, payment terms, performance tracking
- **Business Intelligence** - Sales reports, revenue analytics, inventory reports

### Key Features

- 🔐 **JWT Authentication** - Token-based secure authentication
- 👥 **Role-Based Access Control** - Admin, Employee, User permissions
- 📦 **Advanced Inventory** - Stock tracking, movements, reorder points
- 💰 **Financial Management** - Payments, refunds, supplier payments
- 📊 **Business Analytics** - Revenue, profit, customer insights
- 🔄 **Procurement Workflow** - PO creation, approval, receiving
- 🏢 **B2B Support** - Supplier management, purchase orders
- 📈 **Reporting System** - Customizable reports, multiple formats
- ⚡ **Performance** - Indexed queries, pagination, caching
- 🛡️ **Error Handling** - Comprehensive error responses

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
├── controllers/              # Route handlers & business logic
│   ├── login.js             # ✅ Authentication endpoints
│   ├── users.js             # ✅ User management
│   ├── products.js          # ✅ Product CRUD + filters
│   ├── categories.js        # ✅ Category management
│   ├── orders.js            # ✅ Order processing
│   ├── customers.js         # 🟡 Customer CRM (pending implementation)
│   ├── inventory.js         # 🟡 Stock tracking (pending implementation)
│   ├── payments.js          # 🟡 Payment processing (pending implementation)
│   ├── purchaseOrders.js    # 🟡 Procurement (pending implementation)
│   ├── suppliers.js         # 🟡 Supplier management (pending implementation)
│   └── reports.js           # 🟡 Analytics (pending implementation)
├── models/                  # Mongoose schemas (10 models)
│   ├── user.js             # ✅ User authentication & management
│   ├── product.js          # ✅ Product catalog
│   ├── category.js         # ✅ Product categories
│   ├── order.js            # ✅ Customer sales orders
│   ├── customer.js         # 🟡 Customer profiles (B2C)
│   ├── inventory.js        # 🟡 Stock tracking & movements
│   ├── payment.js          # 🟡 Payment transactions
│   ├── purchaseOrder.js    # 🟡 Supplier purchase orders (B2B)
│   ├── supplier.js         # 🟡 Supplier/vendor management
│   └── report.js           # 🟡 Business analytics reports
├── utils/                   # Helper functions & middleware
│   ├── auth.js             # JWT middleware & authentication
│   ├── config.js           # Environment configuration
│   ├── logger.js           # Logging utility
│   ├── middleware.js       # Error handling & validation
│   └── seedAdmin.js        # Admin user seeding
├── requests/                # REST client test files
│   ├── login.rest          # Auth API tests
│   ├── users.rest          # User API tests
│   ├── products.rest       # Product API tests
│   ├── categories.rest     # Category API tests
│   ├── orders.rest         # Order API tests
│   ├── customers.rest      # Customer API tests
│   ├── inventory.rest      # Inventory API tests
│   ├── payments.rest       # Payment API tests
│   ├── purchaseOrders.rest # PO API tests
│   └── suppliers.rest      # Supplier API tests
├── app.js                   # Express app setup
├── index.js                 # Server entry point
├── mongo.js                 # MongoDB connection
├── package.json             # Dependencies & scripts
├── .env                     # Environment variables (create this)
├── ENV_SETUP.md             # Environment setup guide
├── README.md                # This file
└── MODELS_SUMMARY.md        # 📖 Complete models documentation
```

**Legend**: ✅ Implemented | 🟡 Model Ready (Controller Pending) | ❌ Not Started

---

## � Implementation Status

### Module Status Overview

| Module | Model | Controller | API Endpoints | Frontend UI | Status |
|--------|-------|------------|---------------|-------------|--------|
| **Authentication** | ✅ | ✅ | ✅ | ✅ | 🟢 Complete |
| **Users** | ✅ | ✅ | ✅ | ❌ | 🟡 Backend Ready |
| **Products** | ✅ | ✅ | ✅ | ✅ | 🟢 Complete |
| **Categories** | ✅ | ✅ | ✅ | ✅ | 🟢 Complete |
| **Orders** | ✅ | ✅ | ✅ | ✅ | 🟢 Complete |
| **Customers** | ✅ | 🟡 | ❌ | ❌ | 🟡 Model Ready |
| **Inventory** | ✅ | 🟡 | ❌ | ❌ | 🟡 Model Ready |
| **Payments** | ✅ | 🟡 | ❌ | ❌ | 🟡 Model Ready |
| **Purchase Orders** | ✅ | 🟡 | ❌ | ❌ | 🟡 Model Ready |
| **Suppliers** | ✅ | 🟡 | ❌ | ❌ | 🟡 Model Ready |
| **Reports** | ✅ | 🟡 | ❌ | ❌ | 🟡 Model Ready |

**Legend**:  
🟢 Complete | 🟡 Partial (Model Ready) | ❌ Not Started | ✅ Done | 🟡 Pending

### Implementation Priority

#### 🔥 **High Priority** (Core Features)
1. ✅ **Authentication** - Login, register, JWT tokens
2. ✅ **Products** - CRUD, filters, search, pagination
3. ✅ **Categories** - CRUD, hierarchical structure
4. ✅ **Orders** - Order creation, status management
5. 🟡 **Customers** - Customer profiles, purchase history
6. 🟡 **Inventory** - Stock tracking, movements, alerts

#### 📦 **Medium Priority** (Business Operations)
7. 🟡 **Payments** - Transaction tracking, refunds
8. 🟡 **Purchase Orders** - Procurement workflow
9. 🟡 **Suppliers** - Vendor management

#### 📊 **Low Priority** (Analytics)
10. 🟡 **Reports** - Business intelligence, analytics

---

## �🚀 Getting Started

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

### ✅ Implemented Endpoints

#### **Authentication**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/login` | Public | Login (get JWT token) |
| `POST` | `/api/login/register` | Public | Register admin account |
| `POST` | `/api/login/logout` | Required | Logout (invalidate token) |
| `GET` | `/api/login/me` | Required | Get current user profile |

#### **Products**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | Public | List products (with filters & pagination) |
| `GET` | `/api/products/:id` | Public | Get product detail |
| `POST` | `/api/products` | Admin | Create new product |
| `PUT` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Delete product |

**Product Filters**: `?category=id&minPrice=0&maxPrice=100&search=query&page=1&limit=10&sort=price`

#### **Categories**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/categories` | Public | List all categories |
| `GET` | `/api/categories/:id` | Public | Get category detail |
| `POST` | `/api/categories` | Admin | Create category |
| `PUT` | `/api/categories/:id` | Admin | Update category |
| `DELETE` | `/api/categories/:id` | Admin | Delete category |

#### **Orders**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/orders` | Admin | List all orders |
| `GET` | `/api/orders/:id` | Required | Get order detail |
| `POST` | `/api/orders` | Public | Create new order |
| `PATCH` | `/api/orders/:id/status` | Admin | Update order status |
| `GET` | `/api/orders/my-orders` | Required | Get current user's orders |

#### **Users**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users` | Admin | List all users |
| `GET` | `/api/users/:id` | Admin | Get user detail |
| `POST` | `/api/users` | Admin | Create new user |
| `PUT` | `/api/users/:id` | Admin | Update user |
| `DELETE` | `/api/users/:id` | Admin | Delete user |

---

### 🟡 Pending Implementation (Controllers Needed)

#### **Customers** (CRM)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/customers` | Admin | List all customers |
| `GET` | `/api/customers/:id` | Admin | Get customer detail |
| `GET` | `/api/customers/:id/orders` | Admin | Get customer order history |
| `GET` | `/api/customers/:id/stats` | Admin | Get customer statistics |
| `POST` | `/api/customers` | Admin | Create customer profile |
| `PUT` | `/api/customers/:id` | Admin | Update customer |
| `DELETE` | `/api/customers/:id` | Admin | Delete customer |
| `POST` | `/api/customers/:id/loyalty` | Admin | Add loyalty points |

#### **Inventory** (Stock Management)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/inventory` | Admin | List all inventory |
| `GET` | `/api/inventory/:productId` | Admin | Get product inventory |
| `GET` | `/api/inventory/low-stock` | Admin | Get low stock items |
| `GET` | `/api/inventory/:productId/movements` | Admin | Get stock movement history |
| `POST` | `/api/inventory/adjust` | Admin | Manual stock adjustment |
| `POST` | `/api/inventory/reserve` | System | Reserve stock for order |
| `POST` | `/api/inventory/release` | System | Release reserved stock |

#### **Payments** (Transactions)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/payments` | Admin | List all payments |
| `GET` | `/api/payments/:id` | Admin | Get payment detail |
| `GET` | `/api/payments/order/:orderId` | Admin | Get order payments |
| `POST` | `/api/payments` | Admin | Record payment |
| `POST` | `/api/payments/:id/refund` | Admin | Process refund |
| `GET` | `/api/payments/stats` | Admin | Payment statistics |

#### **Purchase Orders** (B2B Procurement)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/purchase-orders` | Admin | List all POs |
| `GET` | `/api/purchase-orders/:id` | Admin | Get PO detail |
| `POST` | `/api/purchase-orders` | Admin | Create PO |
| `PUT` | `/api/purchase-orders/:id` | Admin | Update PO |
| `POST` | `/api/purchase-orders/:id/approve` | Admin | Approve PO |
| `POST` | `/api/purchase-orders/:id/receive` | Admin | Mark items as received |
| `DELETE` | `/api/purchase-orders/:id` | Admin | Cancel PO |

#### **Suppliers** (Vendor Management)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/suppliers` | Admin | List all suppliers |
| `GET` | `/api/suppliers/:id` | Admin | Get supplier detail |
| `GET` | `/api/suppliers/:id/purchase-orders` | Admin | Get supplier PO history |
| `GET` | `/api/suppliers/:id/stats` | Admin | Get supplier statistics |
| `POST` | `/api/suppliers` | Admin | Create supplier |
| `PUT` | `/api/suppliers/:id` | Admin | Update supplier |
| `DELETE` | `/api/suppliers/:id` | Admin | Delete supplier |

#### **Reports** (Business Intelligence)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/reports` | Admin | List all reports |
| `GET` | `/api/reports/:id` | Admin | Get report detail |
| `POST` | `/api/reports/generate` | Admin | Generate new report |
| `GET` | `/api/reports/sales` | Admin | Sales report |
| `GET` | `/api/reports/inventory` | Admin | Inventory report |
| `GET` | `/api/reports/revenue` | Admin | Revenue report |
| `GET` | `/api/reports/profit` | Admin | Profit & loss report |
| `GET` | `/api/reports/customer` | Admin | Customer analytics |
| `GET` | `/api/reports/product` | Admin | Product performance |
| `GET` | `/api/reports/supplier` | Admin | Supplier performance |

---

### 📝 Request/Response Examples

#### Create Order
```bash
POST /api/orders
Content-Type: application/json

{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+84123456789"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Ho Chi Minh",
    "state": "HCM",
    "zipCode": "70000",
    "country": "Vietnam"
  },
  "items": [
    {
      "product": "product_id_here",
      "quantity": 2
    }
  ],
  "paymentMethod": "cash"
}
```

#### Response Format (Success)
```json
{
  "success": true,
  "data": {
    "order": {
      "orderNumber": "ORD2025000001",
      "customer": {...},
      "items": [...],
      "total": 57.70,
      "status": "pending"
    }
  },
  "message": "Order created successfully"
}
```

#### Response Format (Error)
```json
{
  "success": false,
  "error": {
    "message": "Product not found",
    "code": "PRODUCT_NOT_FOUND",
    "status": 404
  }
}
```

---

📖 **Complete API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) (Coming Soon)  
🧪 **API Testing**: Use `.rest` files in `/requests` folder with REST Client extension

---

## 🗄️ Database Models

**Total Models**: 10 (4 fully implemented + 6 pending controller implementation)

### Quick Reference Table

| Model | Status | Purpose | Auto-Generated Code |
|-------|--------|---------|---------------------|
| **User** | ✅ Active | Authentication & admin management | - |
| **Product** | ✅ Active | Product catalog with inventory | `slug` |
| **Category** | ✅ Active | Hierarchical product categorization | `slug` |
| **Order** | ✅ Active | Customer sales orders | `ORD2025000001` |
| **Customer** | 🟡 Model Ready | Customer CRM & loyalty program | `CUST2025000001` |
| **Inventory** | 🟡 Model Ready | Stock tracking & movement history | - |
| **Payment** | 🟡 Model Ready | Payment transaction tracking | `PAY2025000001` |
| **PurchaseOrder** | 🟡 Model Ready | Supplier procurement orders | `PO2025000001` |
| **Supplier** | 🟡 Model Ready | Supplier/vendor management | `SUP2025000001` |
| **Report** | 🟡 Model Ready | Business analytics & reports | - |

### Schema Overview

#### 1. **User** (Authentication & Authorization)
```javascript
{
  username: String (unique, 3-20 chars),
  email: String (unique),
  fullName: String (3-50 chars),
  passwordHash: String (bcrypt hashed),
  role: Enum ['admin', 'user', 'employee'],
  isActive: Boolean,
  tokens: [{ token, createdAt, expiresAt }],
  lastLogin: Date
}
```
**Relationships**: 1:N with Orders, Payments, PurchaseOrders, Reports

---

#### 2. **Product** (Product Catalog)
```javascript
{
  name: String,
  slug: String (auto-generated, URL-friendly),
  sku: String (unique, uppercase),
  category: ObjectId (ref: Category),
  price: Number (min: 0),
  originalPrice: Number (for discounts),
  image: String (main image URL),
  images: [String] (gallery),
  description: String (max 1000 chars),
  detailDescription: {
    intro: [String],
    specifications: [{label, value}],
    additionalDesc: String,
    packaging: [String],
    suggestedUse: [String],
    otherIngredients: [String],
    warnings: [String]
  },
  vendor: String,
  stock: Number (min: 0),
  rating: Number (0-5),
  reviews: Number,
  tags: [String],
  mfgDate: Date,
  shelfLife: String,
  type: String,
  isActive: Boolean,
  isFeatured: Boolean
}
```
**Relationships**: N:1 with Category | 1:1 with Inventory | N:M with Orders, PurchaseOrders

---

#### 3. **Category** (Product Organization)
```javascript
{
  name: String (unique, max 100 chars),
  slug: String (auto-generated),
  image: String (URL),
  description: String (max 500 chars),
  parent: ObjectId (ref: Category, for nested categories),
  order: Number (display order),
  isActive: Boolean
}
```
**Relationships**: 1:N with Products | Self-referencing for hierarchy

---

#### 4. **Order** (Sales Orders)
```javascript
{
  orderNumber: String (auto: ORD2025000001),
  customer: {
    name: String,
    email: String,
    phone: String
  },
  user: ObjectId (ref: User, who processed),
  shippingAddress: {
    street, city, state, zipCode, country
  },
  items: [{
    product: ObjectId (ref: Product),
    productName: String (cached),
    sku: String (cached),
    quantity: Number (min: 1),
    price: Number,
    subtotal: Number (auto-calc)
  }],
  subtotal: Number (auto-calc),
  shippingFee: Number,
  tax: Number,
  discount: Number,
  total: Number (auto-calc),
  status: Enum ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
  paymentStatus: Enum ['unpaid', 'partial', 'paid', 'refunded'],
  paymentMethod: Enum ['cash', 'card', 'bank_transfer', 'e_wallet'],
  paidAmount: Number,
  notes: String
}
```
**Relationships**: N:1 with User | N:M with Products | 1:N with Payments

---

#### 5. **Customer** (CRM System) 🟡
```javascript
{
  customerCode: String (auto: CUST2025000001),
  fullName: String,
  email: String (unique, sparse - optional for walk-ins),
  phone: String,
  address: {
    street, city, state, zipCode, country
  },
  dateOfBirth: Date,
  gender: Enum ['male', 'female', 'other'],
  customerType: Enum ['retail', 'wholesale', 'vip'],
  loyaltyPoints: Number (default: 0),
  totalSpent: Number (auto-updated),
  totalOrders: Number (auto-updated),
  averageOrderValue: Number (auto-calc),
  lastPurchaseDate: Date,
  notes: String,
  isActive: Boolean
}
```
**Relationships**: 1:N with Orders | 1:N with Payments

---

#### 6. **Inventory** (Stock Management) 🟡
```javascript
{
  product: ObjectId (ref: Product, unique),
  quantityOnHand: Number (physical stock),
  quantityReserved: Number (pending orders),
  quantityAvailable: Number (auto-calc: onHand - reserved),
  reorderPoint: Number (alert threshold),
  reorderQuantity: Number (reorder amount),
  warehouseLocation: String,
  lastRestocked: Date,
  lastSold: Date,
  movements: [{
    type: Enum ['in', 'out', 'adjustment', 'reserved', 'released'],
    quantity: Number,
    reason: String,
    referenceId: String (Order ID, PO ID, etc.),
    referenceType: Enum ['order', 'purchase_order', 'adjustment', 'return'],
    date: Date,
    performedBy: ObjectId (ref: User),
    notes: String
  }]
}
```
**Relationships**: 1:1 with Product | N:1 with Orders, PurchaseOrders (via movements)

---

#### 7. **Payment** (Transaction Tracking) 🟡
```javascript
{
  paymentNumber: String (auto: PAY2025000001),
  paymentType: Enum ['sales', 'purchase'],
  relatedOrderId: ObjectId (Order or PurchaseOrder),
  relatedOrderNumber: String (cached),
  amount: Number,
  paymentMethod: Enum ['cash', 'card', 'bank_transfer', 'e_wallet', 'check', 'credit'],
  paymentDate: Date,
  transactionId: String,
  bankReference: String,
  cardLastFourDigits: String,
  status: Enum ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
  refundedAmount: Number,
  refundReason: String,
  refundedAt: Date,
  customer: ObjectId (ref: Customer, for sales),
  supplier: ObjectId (ref: Supplier, for purchases),
  receivedBy: ObjectId (ref: User),
  notes: String
}
```
**Relationships**: N:1 with Order or PurchaseOrder | N:1 with Customer or Supplier

---

#### 8. **PurchaseOrder** (B2B Procurement) 🟡
```javascript
{
  poNumber: String (auto: PO2025000001),
  supplier: ObjectId (ref: Supplier),
  orderDate: Date,
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  items: [{
    product: ObjectId (ref: Product),
    productName: String (cached),
    sku: String (cached),
    quantity: Number,
    unitPrice: Number (cost price),
    subtotal: Number (auto-calc),
    received: Number (quantity received)
  }],
  subtotal: Number,
  shippingFee: Number,
  tax: Number,
  discount: Number,
  total: Number (auto-calc),
  status: Enum ['draft', 'pending', 'approved', 'partially_received', 'received', 'cancelled'],
  paymentStatus: Enum ['unpaid', 'partial', 'paid'],
  paidAmount: Number,
  createdBy: ObjectId (ref: User),
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  notes: String
}
```
**Relationships**: N:1 with Supplier | N:M with Products | 1:N with Payments

---

#### 9. **Supplier** (Vendor Management) 🟡
```javascript
{
  supplierCode: String (auto: SUP2025000001),
  companyName: String,
  contactPerson: {
    name, position, phone, email
  },
  email: String (unique),
  phone: String,
  address: {
    street, city, state, zipCode, country
  },
  taxId: String (unique, sparse),
  bankAccount: {
    bankName, accountNumber, accountName, swiftCode
  },
  paymentTerms: Enum ['cod', 'net15', 'net30', 'net60', 'net90'],
  creditLimit: Number,
  currentDebt: Number (auto-updated),
  productsSupplied: [ObjectId] (ref: Product),
  rating: Number (0-5),
  totalPurchaseOrders: Number (auto-updated),
  totalPurchaseAmount: Number (auto-updated),
  lastPurchaseDate: Date,
  notes: String,
  isActive: Boolean
}
```
**Relationships**: 1:N with PurchaseOrders | N:M with Products | 1:N with Payments

---

#### 10. **Report** (Business Intelligence) 🟡
```javascript
{
  reportType: Enum ['sales', 'inventory', 'revenue', 'profit', 'customer', 'product', 'supplier'],
  reportName: String,
  period: {
    startDate: Date,
    endDate: Date
  },
  data: Mixed (dynamic based on reportType),
  summary: {
    totalRevenue: Number,
    totalCost: Number,
    profit: Number,
    profitMargin: Number,
    orderCount: Number,
    customerCount: Number,
    productCount: Number,
    averageOrderValue: Number
  },
  generatedBy: ObjectId (ref: User),
  format: Enum ['json', 'pdf', 'excel', 'csv'],
  filePath: String,
  notes: String
}
```
**Relationships**: N:1 with User | Aggregates from Order, Product, Customer, PurchaseOrder

---

### Entity Relationship Diagram

```
      ┌──────────┐
      │   User   │──────┐
      └──────────┘      │
           │ 1:N        │ 1:N
           ▼            ▼
      ┌──────────┐  ┌────────────┐
      │  Order   │  │PurchaseOrder│
      └──────────┘  └────────────┘
           │ N:M         │ N:M
           ▼             ▼
      ┌──────────┐──┐┌──────────┐
      │ Product  │  ││ Supplier │
      └──────────┘  │└──────────┘
           │ N:1    │
           ▼        │
      ┌──────────┐  │
      │Category  │  │
      └──────────┘  │
                    │
      ┌──────────┐  │
      │Inventory │──┘ 1:1
      └──────────┘
           
      ┌──────────┐
      │Customer  │──┐ 1:N
      └──────────┘  │
                    ▼
                ┌──────────┐
                │ Payment  │
                └──────────┘
```

📖 **Complete Models Documentation**: See [MODELS_SUMMARY.md](./MODELS_SUMMARY.md) for detailed field specifications, business rules, and implementation guidelines.

---

## 🔐 Authentication

### JWT Token-Based Authentication

1. **Register** or **Login** to receive JWT token
2. Include token in Authorization header for protected routes:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Role-Based Access Control

#### Access Levels

| Level | Permissions | Example Endpoints |
|-------|-------------|-------------------|
| **Public** | View products, categories, create orders | `GET /products`, `POST /orders` |
| **Authenticated** | View own orders, cart operations | `GET /orders/my-orders`, `POST /cart/add` |
| **Employee** | Manage inventory, process orders | `POST /inventory/adjust`, `PATCH /orders/:id/status` |
| **Admin** | Full system access | All CRUD operations |

#### Role Hierarchy
```
Admin (all permissions)
  └── Employee (limited permissions)
      └── User (basic permissions)
          └── Public (no auth required)
```

### Protected Route Implementation

```javascript
// Public endpoint (no auth)
app.use('/api/products', productsRouter)

// Authenticated endpoint (any logged-in user)
app.use('/api/cart', userExtractor, cartRouter)

// Admin-only endpoint
app.use('/api/users', userExtractor, isAdmin, usersRouter)

// Employee or Admin endpoint
app.use('/api/orders', userExtractor, isEmployeeOrAdmin, ordersRouter)
```

### Middleware Chain
```javascript
userExtractor    // Extracts user from JWT token
  → isAdmin      // Checks if user.role === 'admin'
  → isEmployee   // Checks if user.role === 'employee'
  → isEmployeeOrAdmin  // Checks if user.role is 'employee' or 'admin'
```

---

## 🗺️ Development Roadmap

### Phase 1: Core E-commerce ✅ (Completed)
- [x] Authentication system (JWT)
- [x] User management with roles
- [x] Product catalog with filtering
- [x] Category management (hierarchical)
- [x] Order processing
- [x] Shopping cart operations
- [x] Basic error handling
- [x] API documentation (basic)

### Phase 2: Customer Management 🟡 (In Progress)
**Goal**: Complete CRM functionality

- [ ] **Customer CRUD Operations**
  - [ ] Create customer profiles
  - [ ] Update customer information
  - [ ] View customer list with filters
  - [ ] Delete/deactivate customers
  
- [ ] **Customer Analytics**
  - [ ] Purchase history
  - [ ] Spending statistics
  - [ ] Loyalty points system
  - [ ] Customer segmentation (retail/wholesale/VIP)
  
- [ ] **Business Logic**
  - [ ] Auto-update customer statistics on orders
  - [ ] Loyalty points calculation
  - [ ] Customer lifetime value
  
- [ ] **Frontend Integration**
  - [ ] Customer management page
  - [ ] Customer detail view
  - [ ] Customer search & filters

**Estimated Time**: 2-3 weeks

---

### Phase 3: Inventory Management 🟡 (Next)
**Goal**: Real-time stock tracking and warehouse management

- [ ] **Inventory CRUD**
  - [ ] View inventory list
  - [ ] View product inventory detail
  - [ ] Manual stock adjustments
  - [ ] Stock movement history
  
- [ ] **Stock Operations**
  - [ ] Auto-reserve stock on order
  - [ ] Auto-increase stock on PO receiving
  - [ ] Low stock alerts
  - [ ] Reorder point notifications
  
- [ ] **Warehouse Management**
  - [ ] Location tracking
  - [ ] Movement audit trail
  - [ ] Stock reconciliation
  
- [ ] **Frontend Integration**
  - [ ] Inventory dashboard
  - [ ] Stock adjustment interface
  - [ ] Movement history viewer
  - [ ] Low stock alerts UI

**Estimated Time**: 3-4 weeks

---

### Phase 4: Payment Processing 🟡 (Planned)
**Goal**: Complete payment transaction management

- [ ] **Payment CRUD**
  - [ ] Record payments
  - [ ] View payment history
  - [ ] Payment detail view
  - [ ] Payment statistics
  
- [ ] **Payment Operations**
  - [ ] Multiple payment methods
  - [ ] Partial payments
  - [ ] Refund processing
  - [ ] Payment reconciliation
  
- [ ] **Integration**
  - [ ] Link payments to orders
  - [ ] Link payments to purchase orders
  - [ ] Update order payment status automatically
  
- [ ] **Frontend Integration**
  - [ ] Payment history page
  - [ ] Payment recording form
  - [ ] Refund interface
  - [ ] Payment reports

**Estimated Time**: 2-3 weeks

---

### Phase 5: Procurement (B2B) 🟡 (Planned)
**Goal**: Complete supplier and purchase order management

#### Part A: Supplier Management
- [ ] **Supplier CRUD**
  - [ ] Create supplier profiles
  - [ ] Update supplier information
  - [ ] View supplier list
  - [ ] Delete/deactivate suppliers
  
- [ ] **Supplier Analytics**
  - [ ] Purchase history
  - [ ] Supplier performance ratings
  - [ ] Credit management
  - [ ] Payment terms tracking

#### Part B: Purchase Orders
- [ ] **PO Workflow**
  - [ ] Create purchase orders
  - [ ] Approval workflow (draft → pending → approved)
  - [ ] Receive items (partial/full)
  - [ ] PO cancellation
  
- [ ] **PO Operations**
  - [ ] Auto-generate PO numbers
  - [ ] Track expected vs actual delivery
  - [ ] Link to inventory (auto-increase stock)
  - [ ] Payment tracking
  
- [ ] **Frontend Integration**
  - [ ] Supplier management page
  - [ ] PO creation form
  - [ ] PO list with filters
  - [ ] Receiving interface
  - [ ] PO approval workflow UI

**Estimated Time**: 4-5 weeks

---

### Phase 6: Business Intelligence 🟡 (Future)
**Goal**: Comprehensive reporting and analytics

- [ ] **Report Generation**
  - [ ] Sales reports (daily/weekly/monthly)
  - [ ] Inventory reports (stock status, movements)
  - [ ] Revenue reports (by period, category, product)
  - [ ] Profit & loss reports
  - [ ] Customer analytics (top customers, segments)
  - [ ] Product performance (best sellers, slow movers)
  - [ ] Supplier performance
  
- [ ] **Export Formats**
  - [ ] JSON (default)
  - [ ] PDF generation
  - [ ] Excel export
  - [ ] CSV export
  
- [ ] **Frontend Integration**
  - [ ] Reports dashboard
  - [ ] Report generation interface
  - [ ] Data visualization (charts, graphs)
  - [ ] Report scheduling
  - [ ] Report history

**Estimated Time**: 4-6 weeks

---

### Phase 7: Advanced Features (Future)
- [ ] **Multi-warehouse support**
- [ ] **Batch operations**
- [ ] **Barcode scanning integration**
- [ ] **Advanced search (Elasticsearch)**
- [ ] **Email notifications**
- [ ] **SMS notifications**
- [ ] **Automated backups**
- [ ] **API rate limiting**
- [ ] **Caching (Redis)**
- [ ] **Real-time updates (WebSocket)**

---

### Overall Timeline

```
┌─────────────────────────────────────────────────────────────┐
│  Q4 2024        │  Q1 2025        │  Q2 2025        │  Q3 2025 │
├─────────────────┼─────────────────┼─────────────────┼──────────┤
│ Phase 1 ✅      │ Phase 2 🟡      │ Phase 4 🟡      │ Phase 6 🟡│
│ Core E-commerce │ CRM             │ Payments        │ Reports   │
│                 │ Phase 3 🟡      │ Phase 5 🟡      │ Phase 7 🟡│
│                 │ Inventory       │ Procurement     │ Advanced  │
└─────────────────────────────────────────────────────────────┘
```

**Current Focus**: Phase 2 (Customer Management) + Phase 3 (Inventory)

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
