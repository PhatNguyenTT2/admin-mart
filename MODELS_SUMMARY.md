# 📊 Database Models - Complete Summary

> Comprehensive overview of all MongoDB models in the Mini Store backend system

**Last Updated**: October 7, 2025  
**Total Models**: 10

---

## 📋 Table of Contents

- [Models Overview](#models-overview)
- [Detailed Models Reference](#detailed-models-reference)
- [Entity Relationships](#entity-relationships)
- [Auto-Generated Fields](#auto-generated-fields)
- [Implementation Status](#implementation-status)

---

## 🎯 Models Overview

| Model | File | Primary Purpose | Status | Related Models |
|-------|------|-----------------|--------|----------------|
| **User** | `models/user.js` | Authentication & admin management | ✅ Active | Order, Payment, Report |
| **Product** | `models/product.js` | Product catalog & inventory | ✅ Active | Category, Order, Inventory, PurchaseOrder |
| **Category** | `models/category.js` | Product categorization | ✅ Active | Product |
| **Order** | `models/order.js` | Customer sales orders | ✅ Active | Product, Customer, User, Payment |
| **Customer** | `models/customer.js` | Customer management (B2C) | ✅ Active | Order, Payment |
| **Inventory** | `models/inventory.js` | Stock tracking & movements | 🟡 Partial | Product, User, Order, PurchaseOrder |
| **Payment** | `models/payment.js` | Payment transactions | 🟡 Partial | Order, PurchaseOrder, Customer, Supplier |
| **PurchaseOrder** | `models/purchaseOrder.js` | Supplier purchase orders (B2B) | 🟡 Partial | Supplier, Product, User, Payment, Inventory |
| **Supplier** | `models/supplier.js` | Supplier management | 🟡 Partial | PurchaseOrder, Product, Payment |
| **Report** | `models/report.js` | Analytics & reporting | 🟡 Partial | User, Order, Product, Customer |

**Legend**: ✅ Active (có controller) | 🟡 Partial (có model, chưa có controller) | ❌ Not Implemented

---

## 📖 Detailed Models Reference

### 1️⃣ User Model

**File**: `models/user.js`  
**Purpose**: Authentication, authorization, and admin/employee management

#### Schema Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `username` | String | ✅ | - | Unique, 3-20 chars | Login username |
| `email` | String | ✅ | - | Unique, valid email | User email address |
| `fullName` | String | ✅ | - | 3-50 chars | User's full name |
| `passwordHash` | String | ✅ | - | Min 6 chars | Hashed password |
| `role` | String | ✅ | 'admin' | admin/user/employee | User role for authorization |
| `isActive` | Boolean | ❌ | true | - | Account status |
| `tokens[]` | Array | ❌ | [] | - | JWT tokens for sessions |
| `tokens[].token` | String | ✅ | - | - | JWT token string |
| `tokens[].createdAt` | Date | ❌ | Date.now | - | Token creation time |
| `tokens[].expiresAt` | Date | ❌ | - | - | Token expiration |
| `lastLogin` | Date | ❌ | - | - | Last login timestamp |
| `createdAt` | Date | Auto | Date.now | - | Account creation |
| `updatedAt` | Date | Auto | Date.now | - | Last update |

#### Relationships
- **1:N** → `Order` (user who processed order)
- **1:N** → `Payment` (receivedBy)
- **1:N** → `PurchaseOrder` (createdBy)
- **1:N** → `Report` (generatedBy)
- **1:N** → `Inventory.movements[]` (performedBy)

#### Business Rules
- Usernames must be unique and 3-20 characters
- Passwords hashed with bcrypt before storage
- JWT tokens stored for session management
- Role-based access control (admin > employee > user)

---

### 2️⃣ Product Model

**File**: `models/product.js`  
**Purpose**: Product catalog with pricing, inventory, and detailed information

#### Schema Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `name` | String | ✅ | - | Max 255 chars | Product name |
| `slug` | String | ❌ | Auto-generated | Unique, lowercase | URL-friendly name |
| `sku` | String | ✅ | - | Unique, uppercase | Stock Keeping Unit |
| `category` | ObjectId | ✅ | - | Ref: Category | Product category |
| `price` | Number | ✅ | - | Min 0 | Current selling price |
| `originalPrice` | Number | ❌ | - | Min 0 | Original price (for discounts) |
| `image` | String | ✅ | - | URL | Main product image |
| `images[]` | Array[String] | ❌ | [] | URLs | Additional images |
| `description` | String | ❌ | - | Max 1000 chars | Short description |
| `rating` | Number | ❌ | 0 | 0-5 | Average rating |
| `reviews` | Number | ❌ | 0 | Min 0 | Number of reviews |
| `vendor` | String | ❌ | - | Max 100 chars | Brand/vendor name |
| `tags[]` | Array[String] | ❌ | [] | - | Search tags |
| `type` | String | ❌ | - | - | Product classification |
| `stock` | Number | ❌ | 0 | Min 0 | Available quantity |
| `mfgDate` | Date | ❌ | - | - | Manufacturing date |
| `shelfLife` | String | ❌ | - | - | Shelf life (e.g. "70 days") |
| `detailDescription` | Object | ❌ | {} | - | Complex nested description |
| `detailDescription.intro[]` | Array[String] | ❌ | [] | - | Intro paragraphs |
| `detailDescription.specifications[]` | Array[Object] | ❌ | [] | - | Product specs |
| `detailDescription.additionalDesc` | String | ❌ | - | - | Additional info |
| `detailDescription.packaging[]` | Array[String] | ❌ | [] | - | Packaging details |
| `detailDescription.suggestedUse[]` | Array[String] | ❌ | [] | - | Usage instructions |
| `detailDescription.otherIngredients[]` | Array[String] | ❌ | [] | - | Ingredients list |
| `detailDescription.warnings[]` | Array[String] | ❌ | [] | - | Warning messages |
| `isActive` | Boolean | ❌ | true | - | Product availability |
| `isFeatured` | Boolean | ❌ | false | - | Featured product flag |
| `createdAt` | Date | Auto | Date.now | - | Creation timestamp |
| `updatedAt` | Date | Auto | Date.now | - | Last update |

#### Relationships
- **N:1** ← `Category` (belongs to one category)
- **1:1** → `Inventory` (has one inventory record)
- **N:M** ↔ `Order.items[]` (many-to-many via items)
- **N:M** ↔ `PurchaseOrder.items[]` (many-to-many via items)
- **N:M** ↔ `Supplier.productsSupplied[]` (supplied by multiple suppliers)

#### Business Rules
- SKU must be unique across all products
- Slug auto-generated from name if not provided
- Stock updates automatically on order placement
- Price must be positive number
- Images stored as URLs (use CDN or cloud storage)

#### Virtuals
- `discountPercent`: Calculated from price and originalPrice
- `isInStock`: Boolean based on stock > 0
- `stockStatus`: 'in-stock' | 'low-stock' | 'out-of-stock'

---

### 3️⃣ Category Model

**File**: `models/category.js`  
**Purpose**: Hierarchical product categorization

#### Schema Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `name` | String | ✅ | - | Unique, max 100 | Category name |
| `slug` | String | ❌ | Auto-generated | Unique, lowercase | URL-friendly name |
| `image` | String | ❌ | null | URL | Category image |
| `description` | String | ❌ | - | Max 500 chars | Category description |
| `parent` | ObjectId | ❌ | null | Ref: Category | Parent category (for nested) |
| `order` | Number | ❌ | 0 | - | Display order |
| `isActive` | Boolean | ❌ | true | - | Category status |
| `createdAt` | Date | Auto | Date.now | - | Creation timestamp |
| `updatedAt` | Date | Auto | Date.now | - | Last update |

#### Relationships
- **1:N** → `Product` (has many products)
- **1:N** → `Category` (has subcategories)
- **N:1** ← `Category` (belongs to parent)

#### Business Rules
- Supports nested/hierarchical structure
- Parent can be null for root categories
- Cannot delete category with existing products
- Order field for custom sorting

#### Virtuals
- `productCount`: Count of products in category
- `level`: Depth in hierarchy tree

---

### 4️⃣ Order Model

**File**: `models/order.js`  
**Purpose**: Customer sales order management

#### Schema Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `orderNumber` | String | ✅ | Auto-generated | Unique | Order identifier (ORD2025000001) |
| `customer.name` | String | ✅ | - | - | Customer name |
| `customer.email` | String | ✅ | - | Valid email | Customer email |
| `customer.phone` | String | ✅ | - | - | Customer phone |
| `user` | ObjectId | ❌ | null | Ref: User | User who created order |
| `shippingAddress.street` | String | ❌ | - | - | Street address |
| `shippingAddress.city` | String | ❌ | - | - | City |
| `shippingAddress.state` | String | ❌ | - | - | State/Province |
| `shippingAddress.zipCode` | String | ❌ | - | - | Postal code |
| `shippingAddress.country` | String | ❌ | 'Vietnam' | - | Country |
| `items[]` | Array | ✅ | [] | Min 1 item | Order line items |
| `items[].product` | ObjectId | ✅ | - | Ref: Product | Product reference |
| `items[].productName` | String | ❌ | - | - | Cached product name |
| `items[].sku` | String | ❌ | - | - | Cached SKU |
| `items[].quantity` | Number | ✅ | - | Min 1 | Quantity ordered |
| `items[].price` | Number | ✅ | - | Min 0 | Unit price at time of order |
| `items[].subtotal` | Number | ❌ | Auto-calc | - | quantity × price |
| `subtotal` | Number | ❌ | Auto-calc | Min 0 | Sum of item subtotals |
| `shippingFee` | Number | ❌ | 0 | Min 0 | Shipping cost |
| `tax` | Number | ❌ | 0 | Min 0 | Tax amount |
| `discount` | Number | ❌ | 0 | Min 0 | Discount amount |
| `total` | Number | ❌ | Auto-calc | Min 0 | Final total amount |
| `status` | String | ❌ | 'pending' | Enum | Order status |
| `paymentStatus` | String | ❌ | 'unpaid' | Enum | Payment status |
| `paymentMethod` | String | ❌ | - | Enum | Payment method used |
| `paidAmount` | Number | ❌ | 0 | Min 0 | Amount paid |
| `notes` | String | ❌ | - | - | Order notes |
| `createdAt` | Date | Auto | Date.now | - | Order creation |
| `updatedAt` | Date | Auto | Date.now | - | Last update |

#### Enums

**Order Status**:
- `pending` - Order placed, awaiting processing
- `confirmed` - Order confirmed
- `processing` - Being prepared
- `shipped` - Out for delivery
- `delivered` - Completed successfully
- `cancelled` - Cancelled by customer/admin
- `refunded` - Payment refunded

**Payment Status**:
- `unpaid` - No payment received
- `partial` - Partially paid
- `paid` - Fully paid
- `refunded` - Payment returned

**Payment Method**:
- `cash` - Cash on delivery
- `card` - Credit/Debit card
- `bank_transfer` - Bank transfer
- `e_wallet` - E-wallet (Momo, ZaloPay, etc.)

#### Relationships
- **N:M** ↔ `Product` (via items array)
- **N:1** ← `User` (processed by user)
- **1:N** → `Payment` (can have multiple payments)
- **1:N** → `Inventory.movements[]` (creates inventory out movements)

#### Business Rules
- Order number auto-generated (ORD2025000001)
- Items cached (productName, sku) for history preservation
- Stock automatically decremented on order confirmation
- Total calculated from subtotal + shipping + tax - discount
- Cannot delete order, only cancel
- Status transitions must follow workflow

---

### 5️⃣ Customer Model

**File**: `models/customer.js`  
**Purpose**: Customer relationship management (separate from User accounts)

#### Schema Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `customerCode` | String | ✅ | Auto-generated | Unique | Customer ID (CUST2025000001) |
| `fullName` | String | ✅ | - | Trim | Customer full name |
| `email` | String | ❌ | null | Unique, sparse | Email (optional for walk-ins) |
| `phone` | String | ✅ | - | Trim | Phone number |
| `address.street` | String | ❌ | - | - | Street address |
| `address.city` | String | ❌ | - | - | City |
| `address.state` | String | ❌ | - | - | State |
| `address.zipCode` | String | ❌ | - | - | ZIP code |
| `address.country` | String | ❌ | 'Vietnam' | - | Country |
| `dateOfBirth` | Date | ❌ | - | - | Birth date |
| `gender` | String | ❌ | - | male/female/other | Gender |
| `customerType` | String | ❌ | 'retail' | Enum | Customer type |
| `loyaltyPoints` | Number | ❌ | 0 | Min 0 | Loyalty program points |
| `totalSpent` | Number | ❌ | 0 | Min 0 | Lifetime spending |
| `totalOrders` | Number | ❌ | 0 | Min 0 | Number of orders |
| `averageOrderValue` | Number | ❌ | 0 | Min 0 | Average order amount |
| `lastPurchaseDate` | Date | ❌ | - | - | Last order date |
| `notes` | String | ❌ | - | - | Internal notes |
| `isActive` | Boolean | ❌ | true | - | Account status |
| `createdAt` | Date | Auto | Date.now | - | Registration date |
| `updatedAt` | Date | Auto | Date.now | - | Last update |

#### Enums

**Customer Type**:
- `retail` - Regular retail customer
- `wholesale` - Wholesale customer
- `vip` - VIP/Premium customer

#### Relationships
- **1:N** → `Order` (has many orders)
- **1:N** → `Payment` (has payment history)

#### Business Rules
- customerCode auto-generated (CUST2025000001)
- Email is optional (sparse index) for walk-in customers
- Statistics (totalSpent, totalOrders, etc.) updated automatically
- Cannot delete customer with order history
- Loyalty points can be earned and redeemed

#### Virtuals
- `membershipDuration`: Days since registration
- `isVIP`: Based on totalSpent or loyaltyPoints

---

### 6️⃣ Inventory Model

**File**: `models/inventory.js`  
**Purpose**: Real-time stock tracking and inventory movement history

#### Schema Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `product` | ObjectId | ✅ | - | Ref: Product, Unique | Product reference |
| `quantityOnHand` | Number | ❌ | 0 | Min 0 | Physical stock count |
| `quantityReserved` | Number | ❌ | 0 | Min 0 | Reserved for pending orders |
| `quantityAvailable` | Number | ❌ | 0 | Min 0 | Available for sale |
| `reorderPoint` | Number | ❌ | 10 | Min 0 | Min quantity before reorder |
| `reorderQuantity` | Number | ❌ | 50 | Min 0 | Quantity to reorder |
| `warehouseLocation` | String | ❌ | - | - | Physical location in warehouse |
| `lastRestocked` | Date | ❌ | - | - | Last restock date |
| `lastSold` | Date | ❌ | - | - | Last sale date |
| `movements[]` | Array | ❌ | [] | - | Inventory movement history |
| `movements[].type` | String | ✅ | - | Enum | Movement type |
| `movements[].quantity` | Number | ✅ | - | - | Quantity change (+/-) |
| `movements[].reason` | String | ❌ | - | - | Reason for movement |
| `movements[].referenceId` | String | ❌ | - | - | Related document ID |
| `movements[].referenceType` | String | ❌ | - | Enum | Related document type |
| `movements[].date` | Date | ❌ | Date.now | - | Movement timestamp |
| `movements[].performedBy` | ObjectId | ❌ | - | Ref: User | User who performed action |
| `movements[].notes` | String | ❌ | - | - | Additional notes |
| `createdAt` | Date | Auto | Date.now | - | Record creation |
| `updatedAt` | Date | Auto | Date.now | - | Last update |

#### Enums

**Movement Type**:
- `in` - Stock increase (purchase, return)
- `out` - Stock decrease (sale, damage)
- `adjustment` - Manual adjustment
- `reserved` - Reserved for order
- `released` - Reservation released

**Reference Type**:
- `order` - Sales order
- `purchase_order` - Purchase order
- `adjustment` - Manual adjustment
- `return` - Customer return

#### Relationships
- **1:1** ← `Product` (one inventory per product)
- **N:1** ← `User` (movements performedBy)
- **N:1** ← `Order` (movements reference)
- **N:1** ← `PurchaseOrder` (movements reference)

#### Business Rules
- One inventory record per product (unique constraint)
- `quantityAvailable = quantityOnHand - quantityReserved`
- Auto-calculated before save (pre-save hook)
- Movements array maintains complete audit trail
- Cannot have negative available quantity
- Auto-alert when quantity < reorderPoint

#### Virtuals
- `stockStatus`: 'in-stock' | 'low-stock' | 'out-of-stock'
- `needsReorder`: Boolean based on reorderPoint
- `turnoverRate`: Calculated from movements

---

### 7️⃣ Payment Model

**File**: `models/payment.js`  
**Purpose**: Payment transaction tracking for both sales and purchases

#### Schema Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `paymentNumber` | String | ✅ | Auto-generated | Unique | Payment ID (PAY2025000001) |
| `paymentType` | String | ✅ | - | sales/purchase | Transaction type |
| `relatedOrderId` | ObjectId | ✅ | - | - | Order or PO reference |
| `relatedOrderNumber` | String | ❌ | - | - | Cached order number |
| `amount` | Number | ✅ | - | Min 0 | Payment amount |
| `paymentMethod` | String | ✅ | - | Enum | Payment method |
| `paymentDate` | Date | ❌ | Date.now | - | Payment timestamp |
| `transactionId` | String | ❌ | - | - | External transaction ID |
| `bankReference` | String | ❌ | - | - | Bank reference number |
| `cardLastFourDigits` | String | ❌ | - | - | Last 4 digits of card |
| `status` | String | ❌ | 'completed' | Enum | Payment status |
| `refundedAmount` | Number | ❌ | 0 | Min 0 | Amount refunded |
| `refundReason` | String | ❌ | - | - | Refund reason |
| `refundedAt` | Date | ❌ | - | - | Refund timestamp |
| `customer` | ObjectId | ❌ | - | Ref: Customer | For sales payments |
| `supplier` | ObjectId | ❌ | - | Ref: Supplier | For purchase payments |
| `receivedBy` | ObjectId | ✅ | - | Ref: User | User who processed payment |
| `notes` | String | ❌ | - | - | Payment notes |
| `createdAt` | Date | Auto | Date.now | - | Record creation |
| `updatedAt` | Date | Auto | Date.now | - | Last update |

#### Enums

**Payment Type**:
- `sales` - Customer payment (Order)
- `purchase` - Supplier payment (PurchaseOrder)

**Payment Method**:
- `cash` - Cash payment
- `card` - Credit/Debit card
- `bank_transfer` - Bank transfer
- `e_wallet` - E-wallet
- `check` - Check payment
- `credit` - Credit/Account payment

**Payment Status**:
- `pending` - Awaiting confirmation
- `completed` - Successfully processed
- `failed` - Transaction failed
- `refunded` - Payment refunded
- `cancelled` - Payment cancelled

#### Relationships
- **N:1** ← `Order` (payment for order)
- **N:1** ← `PurchaseOrder` (payment for PO)
- **N:1** ← `Customer` (customer's payment)
- **N:1** ← `Supplier` (payment to supplier)
- **N:1** ← `User` (processed by user)

#### Business Rules
- paymentNumber auto-generated (PAY2025000001)
- paymentType determines if customer or supplier is required
- Cannot delete payments, only mark as refunded
- Refund creates new payment record with negative amount
- Updates Order/PO paymentStatus automatically

---

### 8️⃣ PurchaseOrder Model

**File**: `models/purchaseOrder.js`  
**Purpose**: Supplier purchase order management (B2B)

#### Schema Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `poNumber` | String | ✅ | Auto-generated | Unique | PO identifier (PO2025000001) |
| `supplier` | ObjectId | ✅ | - | Ref: Supplier | Supplier reference |
| `orderDate` | Date | ❌ | Date.now | - | PO creation date |
| `expectedDeliveryDate` | Date | ❌ | - | - | Expected delivery |
| `actualDeliveryDate` | Date | ❌ | - | - | Actual delivery |
| `items[]` | Array | ✅ | [] | Min 1 | PO line items |
| `items[].product` | ObjectId | ✅ | - | Ref: Product | Product reference |
| `items[].productName` | String | ❌ | - | - | Cached product name |
| `items[].sku` | String | ❌ | - | - | Cached SKU |
| `items[].quantity` | Number | ✅ | - | Min 1 | Quantity ordered |
| `items[].unitPrice` | Number | ✅ | - | Min 0 | Unit cost price |
| `items[].subtotal` | Number | ❌ | Auto-calc | - | quantity × unitPrice |
| `items[].received` | Number | ❌ | 0 | Min 0 | Quantity received |
| `subtotal` | Number | ❌ | Auto-calc | Min 0 | Sum of item subtotals |
| `shippingFee` | Number | ❌ | 0 | Min 0 | Shipping cost |
| `tax` | Number | ❌ | 0 | Min 0 | Tax amount |
| `discount` | Number | ❌ | 0 | Min 0 | Discount amount |
| `total` | Number | ❌ | Auto-calc | Min 0 | Final total |
| `status` | String | ❌ | 'draft' | Enum | PO status |
| `paymentStatus` | String | ❌ | 'unpaid' | Enum | Payment status |
| `paidAmount` | Number | ❌ | 0 | Min 0 | Amount paid |
| `createdBy` | ObjectId | ❌ | - | Ref: User | User who created PO |
| `approvedBy` | ObjectId | ❌ | - | Ref: User | User who approved |
| `approvedAt` | Date | ❌ | - | - | Approval timestamp |
| `notes` | String | ❌ | - | - | PO notes |
| `createdAt` | Date | Auto | Date.now | - | PO creation |
| `updatedAt` | Date | Auto | Date.now | - | Last update |

#### Enums

**PO Status**:
- `draft` - Being created
- `pending` - Awaiting approval
- `approved` - Approved, awaiting delivery
- `partially_received` - Partial delivery
- `received` - Fully received
- `cancelled` - Cancelled

**Payment Status**:
- `unpaid` - No payment made
- `partial` - Partially paid
- `paid` - Fully paid

#### Relationships
- **N:1** ← `Supplier` (ordered from supplier)
- **N:M** ↔ `Product` (via items array)
- **N:1** ← `User` (createdBy, approvedBy)
- **1:N** → `Payment` (can have multiple payments)
- **1:N** → `Inventory.movements[]` (creates inventory in movements)

#### Business Rules
- poNumber auto-generated (PO2025000001)
- Items cached for history preservation
- Stock increases when status changes to 'received'
- Cannot delete PO, only cancel
- Approval workflow required
- Updates supplier statistics automatically

---

### 9️⃣ Supplier Model

**File**: `models/supplier.js`  
**Purpose**: Supplier/vendor management for procurement

#### Schema Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `supplierCode` | String | ✅ | Auto-generated | Unique | Supplier ID (SUP2025000001) |
| `companyName` | String | ✅ | - | Trim | Company name |
| `contactPerson.name` | String | ❌ | - | - | Contact person name |
| `contactPerson.position` | String | ❌ | - | - | Contact position |
| `contactPerson.phone` | String | ❌ | - | - | Contact phone |
| `contactPerson.email` | String | ❌ | - | - | Contact email |
| `email` | String | ✅ | - | Unique, lowercase | Company email |
| `phone` | String | ✅ | - | - | Company phone |
| `address.street` | String | ❌ | - | - | Street address |
| `address.city` | String | ❌ | - | - | City |
| `address.state` | String | ❌ | - | - | State |
| `address.zipCode` | String | ❌ | - | - | ZIP code |
| `address.country` | String | ❌ | 'Vietnam' | - | Country |
| `taxId` | String | ❌ | - | Unique, sparse | Tax ID number |
| `bankAccount.bankName` | String | ❌ | - | - | Bank name |
| `bankAccount.accountNumber` | String | ❌ | - | - | Account number |
| `bankAccount.accountName` | String | ❌ | - | - | Account holder name |
| `bankAccount.swiftCode` | String | ❌ | - | - | SWIFT code |
| `paymentTerms` | String | ❌ | 'net30' | Enum | Payment terms |
| `creditLimit` | Number | ❌ | 0 | Min 0 | Credit limit |
| `currentDebt` | Number | ❌ | 0 | Min 0 | Current outstanding debt |
| `productsSupplied[]` | Array[ObjectId] | ❌ | [] | Ref: Product | Products supplied |
| `rating` | Number | ❌ | 0 | 0-5 | Supplier rating |
| `totalPurchaseOrders` | Number | ❌ | 0 | Min 0 | Total PO count |
| `totalPurchaseAmount` | Number | ❌ | 0 | Min 0 | Lifetime purchase amount |
| `lastPurchaseDate` | Date | ❌ | - | - | Last PO date |
| `notes` | String | ❌ | - | - | Internal notes |
| `isActive` | Boolean | ❌ | true | - | Supplier status |
| `createdAt` | Date | Auto | Date.now | - | Registration date |
| `updatedAt` | Date | Auto | Date.now | - | Last update |

#### Enums

**Payment Terms**:
- `cod` - Cash on delivery
- `net15` - Payment due in 15 days
- `net30` - Payment due in 30 days
- `net60` - Payment due in 60 days
- `net90` - Payment due in 90 days

#### Relationships
- **1:N** → `PurchaseOrder` (has many POs)
- **N:M** ↔ `Product` (supplies multiple products)
- **1:N** → `Payment` (has payment history)

#### Business Rules
- supplierCode auto-generated (SUP2025000001)
- Cannot exceed creditLimit for unpaid POs
- Statistics updated automatically from POs
- Cannot delete supplier with PO history
- Rating affects supplier selection priority

---

### 🔟 Report Model

**File**: `models/report.js`  
**Purpose**: System analytics and business intelligence reporting

#### Schema Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `reportType` | String | ✅ | - | Enum | Type of report |
| `reportName` | String | ✅ | - | Trim | Report title |
| `period.startDate` | Date | ✅ | - | - | Report period start |
| `period.endDate` | Date | ✅ | - | - | Report period end |
| `data` | Mixed | ❌ | - | - | Dynamic report data |
| `summary.totalRevenue` | Number | ❌ | 0 | - | Total revenue |
| `summary.totalCost` | Number | ❌ | 0 | - | Total cost |
| `summary.profit` | Number | ❌ | 0 | - | Net profit |
| `summary.profitMargin` | Number | ❌ | 0 | - | Profit margin % |
| `summary.orderCount` | Number | ❌ | 0 | - | Number of orders |
| `summary.customerCount` | Number | ❌ | 0 | - | Number of customers |
| `summary.productCount` | Number | ❌ | 0 | - | Number of products |
| `summary.averageOrderValue` | Number | ❌ | 0 | - | Average order value |
| `generatedBy` | ObjectId | ✅ | - | Ref: User | User who generated report |
| `format` | String | ❌ | 'json' | Enum | Report format |
| `filePath` | String | ❌ | - | - | File path if exported |
| `notes` | String | ❌ | - | - | Report notes |
| `createdAt` | Date | Auto | Date.now | - | Generation timestamp |
| `updatedAt` | Date | Auto | Date.now | - | Last update |

#### Enums

**Report Type**:
- `sales` - Sales analysis report
- `inventory` - Inventory status report
- `revenue` - Revenue report
- `profit` - Profit & loss report
- `customer` - Customer analytics
- `product` - Product performance
- `supplier` - Supplier performance

**Report Format**:
- `json` - JSON data
- `pdf` - PDF document
- `excel` - Excel spreadsheet
- `csv` - CSV file

#### Relationships
- **N:1** ← `User` (generated by user)
- Aggregates data from: `Order`, `Product`, `Customer`, `PurchaseOrder`, `Supplier`

#### Business Rules
- Data structure varies by reportType
- Historical reports are immutable
- Can be exported to multiple formats
- Scheduled reports run automatically
- Summary fields calculated from data

#### Virtuals
- `periodDuration`: Days in report period
- `profitMargin`: Calculated percentage

---

## 🔗 Entity Relationships

### Visual Relationship Diagram

```
┌─────────┐
│  User   │────┐
└─────────┘    │
    │ 1:N      │
    ▼          │
┌─────────┐   │ 1:N
│  Order  │◄──┤
└─────────┘    │
    │ N:M      │
    ▼          │
┌──────────┐  │
│ Product  │  │
└──────────┘  │
    │ N:1     │
    ▼         │
┌──────────┐  │
│Category  │  │
└──────────┘  │
              │
┌──────────┐  │
│Customer  │──┘
└──────────┘
    │ 1:N
    ▼
┌──────────┐
│ Payment  │
└──────────┘
    │ N:1
    ▼
┌──────────────┐
│PurchaseOrder │
└──────────────┘
    │ N:1
    ▼
┌──────────┐      ┌───────────┐
│Supplier  │      │Inventory  │
└──────────┘      └───────────┘
                       │ 1:1
                       ▼
                  ┌──────────┐
                  │ Product  │
                  └──────────┘
```

### Detailed Relationships

#### User Relationships
- **User** → **Order** (1:N): User processes orders
- **User** → **Payment** (1:N): User records payments
- **User** → **PurchaseOrder** (1:N): User creates/approves POs
- **User** → **Report** (1:N): User generates reports
- **User** → **Inventory.movements** (1:N): User performs inventory actions

#### Product Relationships
- **Product** → **Category** (N:1): Product belongs to category
- **Product** → **Inventory** (1:1): Product has inventory record
- **Product** → **Order.items** (N:M): Product in multiple orders
- **Product** → **PurchaseOrder.items** (N:M): Product in multiple POs
- **Product** → **Supplier** (N:M): Product supplied by multiple suppliers

#### Order Relationships
- **Order** → **User** (N:1): Order processed by user
- **Order** → **Customer** (N:1): Order belongs to customer
- **Order** → **Product** (N:M): Order contains multiple products
- **Order** → **Payment** (1:N): Order can have multiple payments

#### Customer Relationships
- **Customer** → **Order** (1:N): Customer has multiple orders
- **Customer** → **Payment** (1:N): Customer has payment history

#### Inventory Relationships
- **Inventory** → **Product** (1:1): One inventory per product
- **Inventory** → **User** (N:1): Movements performed by users
- **Inventory** → **Order** (N:1): Movements reference orders
- **Inventory** → **PurchaseOrder** (N:1): Movements reference POs

#### Payment Relationships
- **Payment** → **Order** (N:1): Payment for order
- **Payment** → **PurchaseOrder** (N:1): Payment for PO
- **Payment** → **Customer** (N:1): Payment from customer
- **Payment** → **Supplier** (N:1): Payment to supplier
- **Payment** → **User** (N:1): Payment processed by user

#### PurchaseOrder Relationships
- **PurchaseOrder** → **Supplier** (N:1): PO from supplier
- **PurchaseOrder** → **Product** (N:M): PO contains products
- **PurchaseOrder** → **User** (N:1): PO created/approved by user
- **PurchaseOrder** → **Payment** (1:N): PO has payments

#### Supplier Relationships
- **Supplier** → **PurchaseOrder** (1:N): Supplier has POs
- **Supplier** → **Product** (N:M): Supplier supplies products
- **Supplier** → **Payment** (1:N): Supplier receives payments

---

## 🔢 Auto-Generated Fields

Several models use auto-generated unique identifiers:

| Model | Field | Pattern | Example |
|-------|-------|---------|---------|
| Order | `orderNumber` | `ORD{YYYY}{000001}` | ORD2025000001 |
| Customer | `customerCode` | `CUST{YYYY}{000001}` | CUST2025000001 |
| Payment | `paymentNumber` | `PAY{YYYY}{000001}` | PAY2025000001 |
| PurchaseOrder | `poNumber` | `PO{YYYY}{000001}` | PO2025000001 |
| Supplier | `supplierCode` | `SUP{YYYY}{000001}` | SUP2025000001 |
| Product | `slug` | `kebab-case-name` | seeds-of-change-organic-quinoa |
| Category | `slug` | `kebab-case-name` | baking-material |

**Implementation**: Use pre-save hooks in Mongoose to auto-generate these fields if not provided.

---

## 📊 Implementation Status

### ✅ Fully Implemented (Controllers + API)
- **User** - Authentication, registration, profile management
- **Product** - Full CRUD with filters, pagination, search
- **Category** - CRUD operations, hierarchical support
- **Order** - Order creation, status updates, history

### 🟡 Partially Implemented (Models Only)
- **Customer** - Model exists, needs CRUD controllers
- **Inventory** - Model exists, needs tracking controllers
- **Payment** - Model exists, needs transaction controllers
- **PurchaseOrder** - Model exists, needs procurement controllers
- **Supplier** - Model exists, needs vendor management controllers
- **Report** - Model exists, needs analytics generation

### 🎯 Priority Implementation Order

1. **High Priority** (Core E-commerce):
   - ✅ User, Product, Category, Order (Done)
   - 🔥 Customer (CRUD operations)
   - 🔥 Inventory (Stock tracking)
   - 🔥 Payment (Transaction processing)

2. **Medium Priority** (Business Operations):
   - 📦 PurchaseOrder (Procurement workflow)
   - 🏢 Supplier (Vendor management)

3. **Low Priority** (Analytics):
   - 📊 Report (Business intelligence)

---

## 🎯 Next Steps

### Backend Development Tasks

1. **Create Controllers** for remaining models:
   - `controllers/customers.js` ✅ (exists)
   - `controllers/inventory.js` ✅ (exists)
   - `controllers/payments.js` ✅ (exists)
   - `controllers/purchaseOrders.js` ✅ (exists)
   - `controllers/suppliers.js` ✅ (exists)
   - `controllers/reports.js` ✅ (exists)

2. **Implement API Endpoints** (see API_ENDPOINTS.md)

3. **Add Business Logic**:
   - Auto-generate codes (orderNumber, customerCode, etc.)
   - Inventory movement tracking
   - Payment processing workflows
   - Purchase order approval workflow
   - Report generation algorithms

4. **Testing**:
   - Unit tests for models
   - Integration tests for controllers
   - API endpoint tests

### Frontend Development Tasks

1. **Create Pages**:
   - Customer Management
   - Inventory Dashboard
   - Payment History
   - Purchase Orders
   - Supplier Management
   - Reports & Analytics

2. **Update API Service Layer** (`admin/src/services/`)

3. **Create UI Components** for new features

---

## 📚 Additional Documentation

- **API_ENDPOINTS.md** - Complete API reference
- **ENV_SETUP.md** - Environment configuration
- **AUTHENTICATION.md** - Auth system details
- **DEPLOYMENT.md** - Deployment guide

---

**Last Updated**: October 7, 2025  
**Document Version**: 1.0.0  
**Maintainer**: Backend Team
