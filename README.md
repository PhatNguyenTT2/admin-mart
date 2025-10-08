# 🛍️ Mini Store Backend

> A comprehensive RESTful API backend for e-commerce management system built with Node.js, Express, and MongoDB

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.1.0-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.18.3-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Database Models](#-database-models)
- [Authentication & Authorization](#-authentication--authorization)
- [Setup & Migration](#-setup--migration)
- [Scripts](#-scripts)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔐 User Management
- Multi-role authentication system (Admin, Manager, Employee, Customer)
- Department-based user organization
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)

### 📦 Product Management
- Complete CRUD operations
- Category management
- Image upload support
- Stock tracking
- Search and filtering

### 🛒 Order Management
- Order creation and tracking
- Order status management
- Customer order history
- Payment integration

### 👥 Customer Management
- Customer profiles
- Order history
- Contact information

### 🏢 Supplier & Purchase Orders
- Supplier management
- Purchase order tracking
- Inventory restocking

### 💰 Payment & Inventory
- Payment processing
- Payment history
- Real-time inventory tracking
- Stock alerts

### 📊 Reports & Analytics
- Sales reports
- Inventory reports
- Custom report generation

### 🏛️ Organization Management
- **Role Management**: Define and manage user roles with custom permissions
- **Department Management**: Organize users into departments with managers
- Hierarchical access control

---

## 🛠️ Tech Stack

- **Runtime**: Node.js v20+
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB v8.18.3 with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Logging**: Morgan & Custom Logger
- **Environment**: dotenv
- **Code Quality**: ESLint

---

## 📁 Project Structure

```
backend/
├── controllers/          # Route controllers (business logic)
│   ├── categories.js
│   ├── customers.js
│   ├── departments.js   # Department management
│   ├── inventory.js
│   ├── login.js
│   ├── orders.js
│   ├── payments.js
│   ├── products.js
│   ├── purchaseOrders.js
│   ├── reports.js
│   ├── roles.js         # Role management
│   ├── suppliers.js
│   └── users.js
│
├── models/              # Mongoose schemas
│   ├── category.js
│   ├── customer.js
│   ├── department.js    # NEW: Department model
│   ├── inventory.js
│   ├── order.js
│   ├── payment.js
│   ├── product.js
│   ├── purchaseOrder.js
│   ├── report.js
│   ├── role.js          # NEW: Role model
│   ├── supplier.js
│   └── user.js          # UPDATED: Now uses Role & Department references
│
├── utils/               # Utility functions
│   ├── auth.js          # Authentication middleware
│   ├── config.js        # Configuration
│   ├── logger.js        # Logging utility
│   ├── middleware.js    # Custom middleware
│   ├── seedAdmin.js     # UPDATED: Create default admin
│   ├── seedRolesAndDepartments.js  # NEW: Seed roles & departments
│   ├── migrateUsersRole.js         # NEW: Migrate users to new schema
│   └── completeSetup.js            # NEW: Complete setup script
│
├── requests/            # REST API test files
│   ├── categories.rest
│   ├── customers.rest
│   ├── departments.rest # NEW: Department API tests
│   ├── inventory.rest
│   ├── orders.rest
│   ├── payments.rest
│   ├── products.rest
│   ├── purchaseOrders.rest
│   ├── reports.rest
│   ├── roles.rest       # NEW: Role API tests
│   ├── suppliers.rest
│   └── users.rest       # UPDATED: New API endpoints
│
├── app.js               # Express application
├── index.js             # Server entry point
├── mongo.js             # MongoDB connection
├── package.json
├── .env                 # Environment variables
├── MIGRATION_GUIDE.md   # NEW: Migration documentation
├── SETUP_SCRIPTS.md     # NEW: Setup guide
├── MODELS_SUMMARY.md    # Model documentation
└── README.md            # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v20 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PhatNguyenTT2/mini-store.git
   cd mini-store/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/martApp
   # or use MongoDB Atlas
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/martApp
   
   PORT=3001
   SECRET=your-secret-key-for-jwt
   NODE_ENV=development
   ```

4. **Run setup script** (First time only)
   ```bash
   npm run setup
   ```
   
   This will:
   - Create default roles (ADMIN, MANAGER, EMPLOYEE, USER)
   - Create default departments (IT, HR, SALES, FIN, OPS, MKT)
   - Migrate existing users (if any)
   - Create default admin account (username: `admin`, password: `admin123`)

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Server is now running!** 🎉
   ```
   Server running on http://localhost:3001
   ```

### Quick Test

Test your API with the default admin credentials:

```bash
# Login
POST http://localhost:3001/api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

⚠️ **Important**: Change the default admin password after first login!

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### API Endpoints

#### 🔐 Authentication
```http
POST   /api/login              # User login
POST   /api/login/register     # User registration
```

#### 👤 Users
```http
GET    /api/users              # Get all users (Admin only)
GET    /api/users/:id          # Get user by ID
POST   /api/users              # Create user (Admin only)
PUT    /api/users/:id          # Update user
PATCH  /api/users/:id/role     # Update user role (Admin only)
PATCH  /api/users/:id/department # Update user department (Admin only)
PATCH  /api/users/:id/status   # Toggle user status (Admin only)
DELETE /api/users/:id          # Delete user (Admin only)
```

#### 🎭 Roles (NEW)
```http
GET    /api/roles              # Get all roles
GET    /api/roles/:id          # Get role by ID
GET    /api/roles/code/:roleId # Get role by code (e.g., ADMIN)
POST   /api/roles              # Create role (Admin only)
PUT    /api/roles/:id          # Update role (Admin only)
PATCH  /api/roles/:id/toggle   # Toggle role status (Admin only)
DELETE /api/roles/:id          # Delete role (Admin only)
```

#### 🏢 Departments (NEW)
```http
GET    /api/departments        # Get all departments
GET    /api/departments/:id    # Get department by ID
GET    /api/departments/code/:deptId # Get dept by code
GET    /api/departments/:id/users    # Get users in department
POST   /api/departments        # Create department (Admin only)
PUT    /api/departments/:id    # Update department (Admin only)
PATCH  /api/departments/:id/toggle   # Toggle dept status (Admin only)
DELETE /api/departments/:id    # Delete department (Admin only)
```

#### 📦 Products
```http
GET    /api/products           # Get all products
GET    /api/products/:id       # Get product by ID
POST   /api/products           # Create product
PUT    /api/products/:id       # Update product
DELETE /api/products/:id       # Delete product
```

#### 📂 Categories
```http
GET    /api/categories         # Get all categories
GET    /api/categories/:id     # Get category by ID
POST   /api/categories         # Create category
PUT    /api/categories/:id     # Update category
DELETE /api/categories/:id     # Delete category
```

#### 🛒 Orders
```http
GET    /api/orders             # Get all orders
GET    /api/orders/:id         # Get order by ID
POST   /api/orders             # Create order
PUT    /api/orders/:id         # Update order
DELETE /api/orders/:id         # Delete order
```

#### 👥 Customers
```http
GET    /api/customers          # Get all customers
GET    /api/customers/:id      # Get customer by ID
POST   /api/customers          # Create customer
PUT    /api/customers/:id      # Update customer
DELETE /api/customers/:id      # Delete customer
```

#### 🏭 Suppliers
```http
GET    /api/suppliers          # Get all suppliers
GET    /api/suppliers/:id      # Get supplier by ID
POST   /api/suppliers          # Create supplier
PUT    /api/suppliers/:id      # Update supplier
DELETE /api/suppliers/:id      # Delete supplier
```

#### 📋 Purchase Orders
```http
GET    /api/purchase-orders    # Get all purchase orders
GET    /api/purchase-orders/:id # Get PO by ID
POST   /api/purchase-orders    # Create purchase order
PUT    /api/purchase-orders/:id # Update purchase order
DELETE /api/purchase-orders/:id # Delete purchase order
```

#### 💰 Payments
```http
GET    /api/payments           # Get all payments
GET    /api/payments/:id       # Get payment by ID
POST   /api/payments           # Create payment
PUT    /api/payments/:id       # Update payment
DELETE /api/payments/:id       # Delete payment
```

#### 📊 Inventory
```http
GET    /api/inventory          # Get inventory status
GET    /api/inventory/:id      # Get inventory by product ID
POST   /api/inventory          # Update inventory
```

#### 📈 Reports
```http
GET    /api/reports            # Get all reports
GET    /api/reports/:id        # Get report by ID
POST   /api/reports            # Generate report
```

For detailed API examples, see the `requests/` directory for REST client files.

---

## 🗄️ Database Models

### Updated Models

#### User Model (UPDATED)
```javascript
{
  username: String,         // Unique username
  email: String,           // Unique email
  fullName: String,        // Full name
  passwordHash: String,    // Hashed password
  role: ObjectId,          // ⭐ Reference to Role (was enum string)
  department: ObjectId,    // ⭐ NEW: Reference to Department
  isActive: Boolean,       // Account status
  tokens: Array,           // JWT tokens
  lastLogin: Date,         // Last login timestamp
  createdAt: Date,
  updatedAt: Date
}
```

#### Role Model (NEW)
```javascript
{
  roleId: String,          // Unique role code (ADMIN, MANAGER, etc.)
  roleName: String,        // Display name
  description: String,     // Role description
  permissions: [String],   // Array of permissions
  isActive: Boolean,       // Status
  createdAt: Date,
  updatedAt: Date
}
```

#### Department Model (NEW)
```javascript
{
  departmentId: String,    // Unique dept code (IT, HR, etc.)
  departmentName: String,  // Display name
  description: String,     // Department description
  manager: ObjectId,       // Reference to User (manager)
  location: String,        // Physical location
  phone: String,           // Contact phone
  email: String,           // Contact email
  isActive: Boolean,       // Status
  createdAt: Date,
  updatedAt: Date
}
```

For all models, see `MODELS_SUMMARY.md`

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. User logs in with username/password
2. Server validates credentials
3. Server generates JWT token
4. Client includes token in subsequent requests
5. Server validates token on protected routes

### Authorization Levels

| Role | Description | Access Level |
|------|-------------|-------------|
| **ADMIN** | System administrator | Full access to all resources |
| **MANAGER** | Department manager | Manage department users and operations |
| **EMPLOYEE** | Regular employee | Basic operational access |
| **USER** | Customer | Limited to own profile and orders |

### Protected Routes
- All routes require authentication
- POST, PUT, PATCH, DELETE operations typically require Admin role
- Users can update their own profile
- Role-based middleware: `userExtractor`, `isAdmin`

---

## 🔄 Setup & Migration

### For New Projects

Simply run:
```bash
npm run setup
```

### For Existing Projects (Migration)

If you have existing users with old role format (string enum), follow these steps:

1. **Backup your database**
   ```bash
   mongodump --uri="your_mongodb_uri" --out=./backup
   ```

2. **Run complete setup**
   ```bash
   npm run setup
   ```

This will:
- ✅ Create default roles and departments
- ✅ Migrate existing users from string roles to ObjectId references
- ✅ Verify all data integrity

### Manual Steps (if needed)

```bash
# Create roles and departments only
npm run seed:roles

# Migrate existing users only
npm run migrate:users

# Create admin account only
npm run seed:admin
```

📖 For detailed migration guide, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

---

## 📜 Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Start** | `npm start` | Start server in production mode |
| **Dev** | `npm run dev` | Start server with auto-reload |
| **Test** | `npm test` | Run tests |
| **Lint** | `npm run lint` | Run ESLint |
| **Setup** | `npm run setup` | 🆕 Complete setup (roles, departments, migration) |
| **Seed Roles** | `npm run seed:roles` | 🆕 Create default roles & departments |
| **Seed Admin** | `npm run seed:admin` | 🆕 Create default admin account |
| **Migrate** | `npm run migrate:users` | 🆕 Migrate users to new schema |

---

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/martApp

# Server
PORT=3001
NODE_ENV=development

# JWT Secret
SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional
LOG_LEVEL=info
```

**⚠️ Security Note**: 
- Never commit `.env` file to version control
- Use strong, random SECRET key in production
- Change default admin password after first login

---

## 🧪 Testing

Use the REST client files in the `requests/` directory:

1. Install **REST Client** extension in VS Code
2. Open any `.rest` file in `requests/` directory
3. Run requests by clicking "Send Request"

Example files:
- `users.rest` - User management endpoints
- `roles.rest` - Role management endpoints (NEW)
- `departments.rest` - Department management endpoints (NEW)
- `products.rest` - Product endpoints
- And more...

---

## 🎯 What's New (Latest Update)

### ✨ Role-Based Access Control System
- 🆕 **Role Model**: Define custom roles with permissions
- 🆕 **Department Model**: Organize users by departments
- 🔄 **Updated User Model**: Now uses ObjectId references instead of enum

### 🚀 New API Endpoints
- `/api/roles` - Complete role management
- `/api/departments` - Complete department management
- `/api/users/:id/department` - Update user department

### 🛠️ Setup & Migration Tools
- ✅ Automated setup script
- ✅ Data migration tools
- ✅ Seed scripts for default data
- ✅ Comprehensive documentation

### 📚 Documentation
- ✅ `MIGRATION_GUIDE.md` - Step-by-step migration guide
- ✅ `SETUP_SCRIPTS.md` - Setup instructions
- ✅ `MODELS_SUMMARY.md` - Database schema documentation
- ✅ Updated REST API examples

---

## 📝 Default Data

After running `npm run setup`, you'll have:

### Default Roles
- **ADMIN** - Full system access
- **MANAGER** - Department management
- **EMPLOYEE** - Basic operations
- **USER** - Customer access

### Default Departments
- **IT** - Information Technology
- **HR** - Human Resources
- **SALES** - Sales Department
- **FIN** - Finance
- **OPS** - Operations
- **MKT** - Marketing

### Default Admin Account
- Username: `admin`
- Password: `admin123`
- Email: `admin@example.com`

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MongoDB is running
mongod --version

# Verify connection string in .env
MONGODB_URI=mongodb://localhost:27017/martApp
```

### Migration Issues
```bash
# If migration fails, check:
1. Roles exist in database (npm run seed:roles)
2. MongoDB connection is stable
3. No duplicate user data
```

### Authentication Issues
```bash
# Verify JWT secret is set
SECRET=your-secret-key

# Check token expiration
# Tokens expire after 7 days by default
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Phat Nguyen** - [PhatNguyenTT2](https://github.com/PhatNguyenTT2)

---

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- MongoDB team for the powerful database
- All contributors and supporters

---

## 📞 Support

If you have any questions or need help, please:

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/PhatNguyenTT2/mini-store/issues)
- 📖 Docs: See `MIGRATION_GUIDE.md` and `SETUP_SCRIPTS.md`

---

## 🎉 Status: Production Ready! ✅

This backend system is now complete with:
- ✅ Full CRUD operations for all resources
- ✅ Advanced role-based access control
- ✅ Department-based organization
- ✅ Comprehensive API documentation
- ✅ Migration tools and guides
- ✅ Production-ready setup

**Happy Coding! 🚀**

---

Made with ❤️ by the Mini Store Team
