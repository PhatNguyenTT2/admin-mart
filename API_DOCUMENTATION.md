# Mini Store - Backend API Documentation

> Complete API reference for the Mini Store Admin Dashboard Backend

**Base URL**: `http://localhost:3001/api`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Products](#products)
4. [Categories](#categories)
5. [Orders](#orders)
6. [Cart](#cart)
7. [Error Responses](#error-responses)

---

## 🔐 Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Register Admin

**POST** `/api/login/register`

**Body**:
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "fullName": "Admin User",
  "password": "password123"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Registration successful. Please login.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "email": "admin@example.com",
      "fullName": "Admin User",
      "role": "admin"
    }
  }
}
```

### Login

**POST** `/api/login`

**Body**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "email": "admin@example.com",
      "fullName": "Admin User",
      "role": "admin"
    }
  }
}
```

### Logout

**POST** `/api/login/logout`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User

**GET** `/api/login/me`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "email": "admin@example.com",
      "fullName": "Admin User",
      "role": "admin",
      "isActive": true,
      "lastLogin": "2025-10-05T10:30:00.000Z",
      "createdAt": "2025-10-01T08:00:00.000Z"
    }
  }
}
```

---

## 👥 Users

### Get All Users (Admin Only)

**GET** `/api/users`

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `per_page` (number): Items per page (default: 20)
- `role` (string): Filter by role (admin, user, employee)
- `is_active` (boolean): Filter by active status

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 50,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### Get User by ID

**GET** `/api/users/:id`

**Headers**: `Authorization: Bearer <token>`

### Create User (Admin Only)

**POST** `/api/users`

**Body**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "fullName": "New User",
  "password": "password123",
  "role": "admin"
}
```

### Update User

**PUT** `/api/users/:id`

**Body**:
```json
{
  "email": "updated@example.com",
  "fullName": "Updated Name",
  "password": "newpassword123"
}
```

### Update User Role (Admin Only)

**PATCH** `/api/users/:id/role`

**Body**:
```json
{
  "role": "employee"
}
```

### Update User Status (Admin Only)

**PATCH** `/api/users/:id/status`

**Body**:
```json
{
  "isActive": false
}
```

### Delete User (Admin Only)

**DELETE** `/api/users/:id`

---

## 📦 Products

### Get All Products

**GET** `/api/products`

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `per_page` (number): Items per page (default: 8)
- `category` (string): Filter by category ID
- `min_price` (number): Minimum price
- `max_price` (number): Maximum price
- `type` (string): Filter by type (Organic, Regular)
- `in_stock` (boolean): Filter in-stock products
- `search` (string): Text search
- `sort_by` (string): Sort option (price_asc, price_desc, name_asc, name_desc, newest, rating)

**Example**:
```
GET /api/products?page=1&per_page=8&category=507f1f77bcf86cd799439011&min_price=10&max_price=50&sort_by=price_asc
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Organic Quinoa",
        "slug": "organic-quinoa",
        "sku": "SKU001",
        "category": {
          "id": "507f...",
          "name": "Grains",
          "slug": "grains"
        },
        "price": 28.85,
        "originalPrice": 32.80,
        "discountPercent": 12,
        "image": "https://example.com/image.jpg",
        "rating": 4.5,
        "reviewCount": 32,
        "stock": 100,
        "isInStock": true
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 8,
      "total": 15,
      "total_pages": 2,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### Get Product by ID

**GET** `/api/products/:id`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Organic Quinoa",
      "description": "Premium organic quinoa...",
      "detailDescription": {
        "intro": ["Paragraph 1", "Paragraph 2"],
        "specifications": [
          { "label": "Type", "value": "Organic" }
        ],
        "packaging": ["Store in cool place"],
        "suggestedUse": ["Cook for 15 minutes"],
        "warnings": ["May contain traces of nuts"]
      },
      "price": 28.85,
      "stock": 100,
      "category": { ... },
      "vendor": "Organic Farms",
      "tags": ["organic", "gluten-free"],
      "mfgDate": "2024-06-01",
      "shelfLife": "365 days"
    }
  }
}
```

### Create Product (Admin Only)

**POST** `/api/products`

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "name": "New Product",
  "sku": "SKU123",
  "category": "507f1f77bcf86cd799439011",
  "price": 29.99,
  "originalPrice": 35.99,
  "image": "https://example.com/image.jpg",
  "images": [
    "https://example.com/img1.jpg",
    "https://example.com/img2.jpg"
  ],
  "description": "Product description",
  "vendor": "Vendor Name",
  "stock": 50,
  "type": "Organic",
  "tags": ["organic", "fresh"],
  "shelfLife": "30 days"
}
```

### Update Product (Admin Only)

**PUT** `/api/products/:id`

**Headers**: `Authorization: Bearer <token>`

**Body**: Same as Create Product

### Delete Product (Admin Only)

**DELETE** `/api/products/:id`

**Headers**: `Authorization: Bearer <token>`

### Update Stock (Admin Only)

**PATCH** `/api/products/:id/stock`

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "stock": 100
}
```

---

## 📂 Categories

### Get All Categories

**GET** `/api/categories`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Grains",
        "slug": "grains",
        "image": "https://example.com/cat.jpg",
        "description": "Organic grains and cereals",
        "order": 1,
        "productCount": 25
      }
    ]
  }
}
```

### Get Category by ID

**GET** `/api/categories/:id`

### Get Category by Slug

**GET** `/api/categories/slug/:slug`

### Create Category (Admin Only)

**POST** `/api/categories`

**Body**:
```json
{
  "name": "New Category",
  "image": "https://example.com/cat.jpg",
  "description": "Category description",
  "order": 5
}
```

### Update Category (Admin Only)

**PUT** `/api/categories/:id`

### Delete Category (Admin Only)

**DELETE** `/api/categories/:id`

*Note: Cannot delete categories with existing products*

---

## 🛍️ Orders

### Get All Orders (Admin Only)

**GET** `/api/orders`

**Query Parameters**:
- `page`, `per_page`
- `status`: pending, processing, shipping, delivered, cancelled
- `payment_status`: pending, paid, failed, refunded
- `sort_by`: newest, oldest, total_high, total_low

**Headers**: `Authorization: Bearer <token>`

### Get Order by ID

**GET** `/api/orders/:id`

**Headers**: `Authorization: Bearer <token>`

### Get My Orders

**GET** `/api/orders/user/my-orders`

**Headers**: `Authorization: Bearer <token>`

### Create Order

**POST** `/api/orders`

**Body**:
```json
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "paymentMethod": "card",
  "customerNote": "Please deliver after 5 PM"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "...",
      "orderNumber": "ORD2510000001",
      "customer": { ... },
      "items": [ ... ],
      "subtotal": 57.70,
      "shippingFee": 10,
      "tax": 5.77,
      "total": 73.47,
      "status": "pending",
      "paymentStatus": "pending"
    }
  }
}
```

### Update Order Status (Admin Only)

**PATCH** `/api/orders/:id/status`

**Body**:
```json
{
  "status": "processing"
}
```

*Valid statuses: pending, processing, shipping, delivered, cancelled*

### Update Payment Status (Admin Only)

**PATCH** `/api/orders/:id/payment`

**Body**:
```json
{
  "paymentStatus": "paid"
}
```

### Update Tracking Number (Admin Only)

**PUT** `/api/orders/:id/tracking`

**Body**:
```json
{
  "trackingNumber": "TRACK123456789"
}
```

### Get Order Statistics (Admin Only)

**GET** `/api/orders/stats/dashboard`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "pendingOrders": 10,
    "processingOrders": 25,
    "deliveredOrders": 100,
    "totalRevenue": 15000.50
  }
}
```

---

## 🛒 Cart

### Get Cart

**GET** `/api/cart`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "...",
      "items": [
        {
          "_id": "...",
          "product": {
            "id": "...",
            "name": "Product Name",
            "price": 29.99,
            "image": "...",
            "stock": 50
          },
          "quantity": 2
        }
      ]
    },
    "summary": {
      "itemCount": 1,
      "totalQuantity": 2,
      "subtotal": 59.98
    }
  }
}
```

### Add to Cart

**POST** `/api/cart/add`

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 1
}
```

### Update Cart Item

**PUT** `/api/cart/update/:itemId`

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "quantity": 3
}
```

### Remove from Cart

**DELETE** `/api/cart/remove/:itemId`

**Headers**: `Authorization: Bearer <token>`

### Clear Cart

**DELETE** `/api/cart/clear`

**Headers**: `Authorization: Bearer <token>`

---

## ❌ Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- **400 Bad Request**: Invalid input or validation error
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Common Error Examples

**401 Unauthorized**:
```json
{
  "error": "Token missing or invalid"
}
```

**403 Forbidden**:
```json
{
  "error": "Admin access required"
}
```

**400 Bad Request**:
```json
{
  "error": "Username and password are required"
}
```

**404 Not Found**:
```json
{
  "error": "Product not found"
}
```

---

## 📝 Notes

### Pagination

All list endpoints support pagination with consistent response format:

```json
{
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 50,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

### Authentication Flow

1. Register: `POST /api/login/register`
2. Login: `POST /api/login` → Receive token
3. Use token in `Authorization: Bearer <token>` header
4. Logout: `POST /api/login/logout`

### Product Filtering

Products endpoint supports multiple filters simultaneously:

```
/api/products?category=ID&min_price=10&max_price=50&type=Organic&in_stock=true&sort_by=price_asc
```

### Stock Management

- Stock automatically decreases when orders are created
- Stock is restored when orders are cancelled
- Products with stock=0 have `isInStock: false`

---

**Last Updated**: October 5, 2025  
**API Version**: 1.0.0
