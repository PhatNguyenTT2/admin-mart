# API Testing with REST Client

> Test all Mini Store API endpoints using VS Code REST Client extension

## 📋 Prerequisites

1. **Install REST Client Extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "REST Client" by Huachao Mao
   - Install it

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

3. **MongoDB Running**
   ```bash
   mongod
   ```

---

## 🚀 Quick Start

### 🎯 **NEW: Populate Database with Mock Data**

**Want 15 products + 5 categories instantly?**

**→ See**: `QUICK_POPULATE.md` for complete guide!

**Files to use**:
1. `categories.rest` - Create 5 categories (2 min)
2. `create_all_products.rest` - Create 15 products (5 min)

**Total time**: ~7 minutes

---

### Step 1: Đăng nhập để lấy Token tự động

**Mỗi file `.rest` đã có sẵn phần Login ở đầu!**

1. Mở file `.rest` bất kỳ (ví dụ: `categories.rest`)
2. Tìm phần **AUTHENTICATION** ở đầu file
3. Click "Send Request" trên **Login to get token**
4. Token sẽ **tự động** được lưu vào biến `@token`

**Không cần copy/paste token thủ công nữa!** ✨

### Step 2: Sử dụng các Request

Sau khi login, token đã được tự động lưu. Bạn có thể:
- Click "Send Request" trên bất kỳ endpoint nào
- Token sẽ tự động được sử dụng trong header

### Step 3: Test Workflow

**Recommended order**:

1. **Categories** (`categories.rest`)
   - Login (ở đầu file) để lấy token tự động
   - Create categories
   - Copy category ID từ response

2. **Products** (`create_product.rest`, `get_all_products.rest`)
   - Login (ở đầu file)
   - Paste `@categoryId` vào file
   - Create products
   - Copy product ID từ response

3. **Orders** (`orders.rest`)
   - Login (ở đầu file)
   - Paste `@productId` vào file
   - Create orders
   - Update order status

4. **Cart** (`cart.rest`)
   - Login (ở đầu file)
   - Paste `@productId` vào file
   - Add items to cart
   - Update quantities

5. **Users** (`users.rest`)
   - Login (ở đầu file)
   - Create users
   - Update users
   - Manage roles

---

## 📁 Files Overview

| File | Endpoints | Description |
|------|-----------|-------------|
| `login.rest` | 5 | Authentication (register, login, logout, me) |
| `categories.rest` | 7 | Category CRUD + multiple create examples |
| `get_all_products.rest` | 16 | Product listing with all filter combinations |
| `get_product.rest` | 3 | Get single product + error cases |
| `create_product.rest` | 9 | Create products + validation tests |
| `update_product.rest` | 8 | Update products + PATCH stock |
| `delete_product.rest` | 4 | Delete products + error cases |
| `orders.rest` | 22 | Complete order lifecycle + statistics |
| `cart.rest` | 14 | Shopping cart operations |
| `users.rest` | 15 | User management (admin features) |

**Total**: **103 test cases**

---

## 🎯 Usage Examples

### Example 1: Complete Product Testing Flow

```rest
# 1. Login
POST http://localhost:3001/api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

# 2. Create Category
POST http://localhost:3001/api/categories
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Grains"
}

# 3. Create Product (use category ID from step 2)
POST http://localhost:3001/api/products
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Organic Quinoa",
  "sku": "SKU001",
  "category": "CATEGORY_ID_HERE",
  "price": 28.85,
  ...
}
```

### Example 2: Auto Token từ Login Response

Mỗi file đã có sẵn login request:

```rest
### Login to get token
# @name loginResponse
POST {{baseUrl}}/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

### Extract token from login response
@token = {{loginResponse.response.body.data.token}}
```

Token được tự động extract từ response! Sau đó dùng trong các request:

```rest
GET {{baseUrl}}/products
Authorization: Bearer {{token}}
```

### Example 3: Extract IDs từ Response

Bạn có thể extract ID từ response để dùng cho các request sau:

```rest
### Create Category
# @name createCategoryResponse
POST {{baseUrl}}/categories
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Grains",
  "description": "Organic grains"
}

### Extract category ID
@categoryId = {{createCategoryResponse.response.body.data.category._id}}

### Now use it to create product
POST {{baseUrl}}/products
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Quinoa",
  "category": "{{categoryId}}",
  ...
}
```

---

## 🔍 Testing Scenarios

### Positive Tests

✅ **Happy Path**:
- Create → Read → Update → Delete
- All required fields provided
- Valid authentication
- Valid data types

### Negative Tests

❌ **Error Cases**:
- Missing authentication (401)
- Invalid permissions (403)
- Missing required fields (400)
- Invalid data types (400)
- Duplicate unique fields (400)
- Non-existent resources (404)

### Examples in Files:

**`create_product.rest`**:
- ✅ Test 1-5: Valid product creation
- ❌ Test 6: Missing required fields
- ❌ Test 7: Duplicate SKU
- ❌ Test 8: Invalid category ID
- ❌ Test 9: No authentication token

---

## 🎨 Tips & Tricks

### 1. Response Handling

REST Client shows response in a separate panel:
- Status code
- Headers
- JSON body (formatted)

### 2. Quick Execution

- **Click "Send Request"** above each section
- Or use keyboard shortcut: `Ctrl+Alt+R` (Windows/Linux) or `Cmd+Alt+R` (Mac)

### 3. Multiple Requests

Send multiple requests in sequence:
```rest
### Create 3 categories quickly

POST {{baseUrl}}/categories
Authorization: Bearer {{token}}
Content-Type: application/json

{ "name": "Grains" }

###

POST {{baseUrl}}/categories
Authorization: Bearer {{token}}
Content-Type: application/json

{ "name": "Vegetables" }

###

POST {{baseUrl}}/categories
Authorization: Bearer {{token}}
Content-Type: application/json

{ "name": "Fruits" }
```

### 4. Save Responses

Right-click on response → "Save Response"

### 5. Environment Switching

Change base URL for different environments:

```rest
### Development
@baseUrl = http://localhost:3001/api

### Production
# @baseUrl = https://api.ministore.com/api
```

---

## 📊 Test Coverage

### By Endpoint Type

| Category | Public | Auth Required | Admin Only |
|----------|--------|---------------|------------|
| Auth | 1 (login) | 2 (logout, me) | 1 (register) |
| Products | 2 (list, get) | 0 | 4 (create, update, delete, stock) |
| Categories | 3 (list, get) | 0 | 3 (create, update, delete) |
| Orders | 0 | 2 (my orders, get) | 7 (list, update, stats) |
| Cart | 0 | 5 (all) | 0 |
| Users | 0 | 1 (get self) | 6 (list, create, update, delete) |

### By HTTP Method

- **GET**: 32 requests
- **POST**: 41 requests
- **PUT**: 12 requests
- **PATCH**: 10 requests
- **DELETE**: 8 requests

---

## 🐛 Common Issues

### Issue 1: "Connection refused"

**Cause**: Backend server not running

**Solution**:
```bash
cd backend
npm run dev
```

### Issue 2: "401 Unauthorized" hoặc "Token invalid"

**Cause**: Chưa login hoặc token đã hết hạn

**Solution**: 
1. Scroll lên đầu file `.rest`
2. Click "Send Request" trên phần **Login to get token**
3. Token sẽ tự động được cập nhật

### Issue 3: "404 Not Found"

**Cause**: Sử dụng placeholder IDs

**Solution**: 
1. Tạo resource trước (category, product, etc.)
2. Copy ID từ response
3. Paste vào biến tương ứng (ví dụ: `@categoryId = 67817...`)

### Issue 4: "400 Bad Request - Duplicate SKU"

**Cause**: SKU already exists

**Solution**: Change SKU value in request

---

## 📝 Best Practices

1. **Mỗi file đều có login ở đầu** - Chạy login trước khi test endpoints khác
2. **Token tự động** - Không cần copy/paste token giữa các file
3. **Extract IDs từ responses** - Sử dụng `# @name` và `{{response.body.data...}}`
4. **Thứ tự tạo dữ liệu**: Categories → Products → Orders
5. **Test positive cases trước** negative cases
6. **Dọn dẹp test data** sau khi test (delete created items)
7. **Kiểm tra status codes** - phải khớp với expected values
8. **Mỗi file là độc lập** - Có thể test bất kỳ file nào mà không phụ thuộc file khác

---

## 🎯 Testing Checklist

### Initial Setup
- [ ] Backend server running (`npm run dev` trong folder backend)
- [ ] MongoDB running
- [ ] REST Client extension installed
- [ ] Mở bất kỳ file `.rest` nào và login để lấy token tự động

### Categories
- [ ] Create 3-5 categories
- [ ] Get all categories
- [ ] Get single category
- [ ] Update category
- [ ] Test delete (should fail if products exist)

### Products
- [ ] Create products with all fields
- [ ] Create products with minimal fields
- [ ] Test all filters (category, price, type, stock)
- [ ] Test all sort options
- [ ] Test text search
- [ ] Update product
- [ ] Update stock
- [ ] Delete product

### Orders
- [ ] Create order as guest
- [ ] Create order with multiple items
- [ ] Update order status through workflow
- [ ] Update payment status
- [ ] Add tracking number
- [ ] Get order statistics

### Cart
- [ ] Add items to cart
- [ ] Update quantities
- [ ] Remove items
- [ ] Clear cart
- [ ] Test stock validation

### Users
- [ ] Create users with different roles
- [ ] Update user info
- [ ] Change user role
- [ ] Deactivate/activate users
- [ ] Test access control

### Error Cases
- [ ] Test without authentication
- [ ] Test with invalid IDs
- [ ] Test with missing fields
- [ ] Test with duplicate data
- [ ] Test with insufficient permissions

---

## 🚀 Advanced Usage

### Chaining Requests

Extract values from responses:

```rest
### 1. Create Category
# @name createCat
POST {{baseUrl}}/categories
Authorization: Bearer {{token}}
Content-Type: application/json

{ "name": "Grains" }

### 2. Use category ID from above
@catId = {{createCat.response.body.data.category.id}}

### 3. Create Product with that category
POST {{baseUrl}}/products
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Product",
  "category": "{{catId}}",
  ...
}
```

---

## 📖 Additional Resources

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Backend README**: See `backend/README.md`
- **Quick Start**: See `QUICK_START.md`

---

**Happy Testing! 🎉**

Last Updated: October 5, 2025
