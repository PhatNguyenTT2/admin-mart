# 🚀 Quick Start Guide

> Get your backend up and running in 5 minutes

---

## ⚡ Fast Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create `.env` File

Create `backend/.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ministore
JWT_SECRET=my-super-secret-jwt-key-change-in-production-32-chars-minimum
NODE_ENV=development
```

### 3. Start MongoDB

**Windows**:
```bash
# If MongoDB is installed as a service
net start MongoDB

# Or run manually
mongod
```

**Mac/Linux**:
```bash
# If installed via Homebrew
brew services start mongodb-community

# Or run manually
mongod
```

### 4. Start Backend Server

```bash
npm run dev
```

You should see:
```
connecting to mongodb://localhost:27017/ministore
connected to MongoDB
Server running on port 3001
```

✅ **Backend is now running at `http://localhost:3001`**

---

## 🧪 Test Your Setup

### Test 1: Check Server

Open browser: `http://localhost:3001/api/products`

Expected response:
```json
{
  "success": true,
  "data": {
    "products": [],
    "pagination": {...}
  }
}
```

### Test 2: Register Admin (Using PowerShell)

```powershell
$body = @{
    username = "admin"
    email = "admin@example.com"
    fullName = "Admin User"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/login/register" -Method Post -Body $body -ContentType "application/json"
```

### Test 3: Login

```powershell
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/login" -Method Post -Body $body -ContentType "application/json"

# Save token for next requests
$token = $response.data.token
Write-Host "Token: $token"
```

### Test 4: Create Category

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$body = @{
    name = "Grains"
    description = "Organic grains and cereals"
} | ConvertTo-Json

$category = Invoke-RestMethod -Uri "http://localhost:3001/api/categories" -Method Post -Body $body -ContentType "application/json" -Headers $headers

Write-Host "Category ID: $($category.data.category.id)"
```

### Test 5: Create Product

```powershell
$body = @{
    name = "Organic Quinoa"
    sku = "SKU001"
    category = $category.data.category.id
    price = 28.85
    originalPrice = 32.80
    image = "https://example.com/quinoa.jpg"
    description = "Premium organic quinoa from Peru"
    vendor = "Organic Farms"
    stock = 100
    type = "Organic"
    tags = @("organic", "gluten-free", "protein")
} | ConvertTo-Json

$product = Invoke-RestMethod -Uri "http://localhost:3001/api/products" -Method Post -Body $body -ContentType "application/json" -Headers $headers

Write-Host "Product created: $($product.data.product.name)"
```

### Test 6: Get Products

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/products" -Method Get
```

---

## 🎯 Common Use Cases

### Using Thunder Client / Postman

1. **Set base URL**: `http://localhost:3001/api`

2. **Save environment variables**:
   - `baseUrl`: `http://localhost:3001/api`
   - `token`: (get from login response)

3. **Register**:
   ```
   POST {{baseUrl}}/login/register
   Body (JSON):
   {
     "username": "admin",
     "email": "admin@example.com",
     "fullName": "Admin User",
     "password": "admin123"
   }
   ```

4. **Login**:
   ```
   POST {{baseUrl}}/login
   Body (JSON):
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
   
   → Copy `token` from response

5. **Create Product** (set Authorization header):
   ```
   POST {{baseUrl}}/products
   Headers:
   Authorization: Bearer {{token}}
   
   Body (JSON):
   {
     "name": "Product Name",
     "sku": "SKU001",
     "category": "CATEGORY_ID",
     "price": 29.99,
     "image": "https://...",
     "description": "...",
     "vendor": "...",
     "stock": 50
   }
   ```

---

## 📱 Frontend Integration

### 1. Update Frontend `.env`

In `admin/.env` (frontend directory):

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### 2. Create API Service

Create `admin/src/services/api.js`:

```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
```

### 3. Replace Mock Data

**Before** (mock data):
```javascript
import { ALL_PRODUCTS } from '../../data/products';
```

**After** (API):
```javascript
import API from '../../services/api';

const fetchProducts = async () => {
  const response = await API.get('/products');
  return response.data.data.products;
};
```

---

## 🛠️ Troubleshooting

### Problem: Cannot connect to MongoDB

**Solution 1**: Check if MongoDB is running
```bash
# Windows
tasklist | findstr mongod

# Mac/Linux
ps aux | grep mongod
```

**Solution 2**: Check MongoDB URI in `.env`
```env
MONGODB_URI=mongodb://localhost:27017/ministore
```

**Solution 3**: Check firewall settings

---

### Problem: JWT_SECRET not defined

**Solution**: Add to `.env`
```env
JWT_SECRET=your-secret-key-here-at-least-32-characters
```

Generate secure key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Problem: Port 3001 already in use

**Solution 1**: Change port in `.env`
```env
PORT=3002
```

**Solution 2**: Kill process using port
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill
```

---

### Problem: CORS errors from frontend

**Solution**: Add CORS to `backend/app.js`:

```javascript
const cors = require('cors');
app.use(cors());
```

Install cors:
```bash
npm install cors
```

---

## 📚 Next Steps

✅ Backend running  
→ **Read**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)  
→ **Integrate**: Replace frontend mock data with API calls  
→ **Test**: Use Thunder Client / Postman  
→ **Deploy**: See README.md for deployment guide

---

## 🆘 Need Help?

- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Full Guide**: [README.md](./README.md)
- **Environment Setup**: [ENV_SETUP.md](./ENV_SETUP.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

**Happy Coding! 🎉**
