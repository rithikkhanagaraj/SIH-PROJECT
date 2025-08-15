# Military Asset Management System - Backend

Node.js/Express backend API for the Military Asset Management System with PostgreSQL database, JWT authentication, and role-based access control.

## 🏗️ Architecture

- **Framework**: Express.js with security middleware
- **Database**: PostgreSQL with pg driver
- **Authentication**: JWT with bcryptjs password hashing
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Morgan + custom audit logging

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration and initialization
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── assetController.js   # Asset management
│   ├── purchaseController.js # Purchase management
│   ├── transferController.js # Transfer management
│   ├── assignmentController.js # Assignment management
│   ├── expenditureController.js # Expenditure management
│   └── dashboardController.js # Dashboard metrics
├── middleware/
│   ├── auth.js              # JWT authentication & RBAC
│   ├── logging.js           # Audit trail logging
│   └── validation.js        # Joi validation schemas
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── assets.js            # Asset management routes
│   ├── purchases.js         # Purchase routes
│   ├── transfers.js         # Transfer routes
│   ├── assignments.js       # Assignment routes
│   ├── expenditures.js      # Expenditure routes
│   └── dashboard.js         # Dashboard routes
├── scripts/
│   └── seed.js              # Database seeding script
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
└── server.js                # Main application entry point
```

## 🗄️ Database Schema

### Tables Overview

```sql
-- Core entities
bases (id, name, location)
users (id, name, email, password_hash, role, base_id)
assets (id, name, type, quantity, base_id)

-- Transaction tables
purchases (id, asset_id, quantity, date, base_id, user_id, notes)
transfers (id, asset_id, from_base_id, to_base_id, quantity, date, status)
assignments (id, asset_id, assigned_to, quantity, date, status)
expenditures (id, asset_id, quantity, date, reason, notes)

-- Audit trail
logs (id, action, user_id, timestamp, details, ip_address)
```

### Key Features
- **Foreign Key Constraints**: Maintain data integrity
- **Check Constraints**: Validate data at database level
- **Indexes**: Optimized queries on frequently accessed columns
- **Triggers**: Automatic timestamp updates
- **Unique Constraints**: Prevent duplicate assets per base

## 🔐 Authentication & Authorization

### JWT Authentication
- **Token Generation**: On successful login
- **Token Validation**: Middleware validates all protected routes
- **Token Expiration**: Configurable (default: 7 days)
- **Automatic Logout**: Invalid/expired tokens

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, all bases, user management |
| **Base Commander** | Full access to assigned base only |
| **Logistics Officer** | Purchases and transfers for assigned base |

### Middleware Functions
- `authenticateToken`: Validates JWT tokens
- `authorizeRoles`: Checks user roles
- `authorizeBaseAccess`: Enforces base-specific access

## 📡 API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/profile
PUT  /api/auth/profile
PUT  /api/auth/change-password
```

### Assets
```
GET    /api/assets              # List assets with filters
GET    /api/assets/:id          # Get specific asset
GET    /api/assets/:id/balance  # Get asset balance summary
POST   /api/assets              # Create new asset (Admin/Logistics)
PUT    /api/assets/:id          # Update asset (Admin/Logistics)
DELETE /api/assets/:id          # Delete asset (Admin only)
```

### Purchases
```
GET    /api/purchases           # List purchases with filters
GET    /api/purchases/:id       # Get specific purchase
POST   /api/purchases           # Create purchase (Admin/Logistics)
PUT    /api/purchases/:id       # Update purchase (Admin/Logistics)
DELETE /api/purchases/:id       # Delete purchase (Admin only)
```

### Transfers
```
GET    /api/transfers           # List transfers with filters
GET    /api/transfers/:id       # Get specific transfer
POST   /api/transfers           # Create transfer (Admin/Logistics)
PUT    /api/transfers/:id/status # Update transfer status
DELETE /api/transfers/:id       # Delete transfer (Admin only)
```

### Assignments
```
GET    /api/assignments         # List assignments with filters
GET    /api/assignments/:id     # Get specific assignment
POST   /api/assignments         # Create assignment
PUT    /api/assignments/:id     # Update assignment
PUT    /api/assignments/:id/return # Return assignment
DELETE /api/assignments/:id     # Delete assignment (Admin only)
```

### Expenditures
```
GET    /api/expenditures        # List expenditures with filters
GET    /api/expenditures/:id    # Get specific expenditure
POST   /api/expenditures        # Create expenditure
PUT    /api/expenditures/:id    # Update expenditure
DELETE /api/expenditures/:id    # Delete expenditure (Admin only)
```

### Dashboard
```
GET /api/dashboard/metrics      # Get dashboard metrics with filters
GET /api/dashboard/bases        # Get available bases
GET /api/dashboard/asset-types  # Get asset types
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=military_assets
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup
```bash
# Create database
createdb military_assets

# Initialize and seed database
npm run seed
```

### 4. Start Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📊 Database Seeding

The seed script creates comprehensive demo data:

### Demo Users
```javascript
// Admin user
{ email: 'admin@military.gov', password: 'admin123', role: 'Admin' }

// Base Commanders
{ email: 'commander1@military.gov', password: 'commander123', role: 'Base Commander' }
{ email: 'commander2@military.gov', password: 'commander123', role: 'Base Commander' }

// Logistics Officers
{ email: 'logistics1@military.gov', password: 'logistics123', role: 'Logistics Officer' }
{ email: 'logistics2@military.gov', password: 'logistics123', role: 'Logistics Officer' }
```

### Demo Data Includes
- **4 Military Bases**: Fort Liberty, Camp Pendleton, Joint Base Lewis-McChord, Fort Hood
- **25+ Assets**: Weapons, vehicles, ammunition, equipment across all bases
- **Sample Transactions**: Realistic purchase, transfer, assignment, and expenditure data
- **Complete Relationships**: All foreign keys properly linked

### Running Seed Script
```bash
# Run seeding (will clear existing data)
npm run seed

# Or run directly
node scripts/seed.js
```

## 🔍 Logging & Auditing

### Audit Trail Features
- **Action Logging**: All CRUD operations logged
- **User Attribution**: Track which user performed each action
- **IP Address Tracking**: Security audit trail
- **Request Details**: Full request/response logging
- **Timestamp Tracking**: Precise timing of all actions

### Log Entry Structure
```javascript
{
  id: 1,
  action: 'CREATE_PURCHASE',
  user_id: 3,
  timestamp: '2024-01-15T10:30:00Z',
  details: {
    method: 'POST',
    url: '/api/purchases',
    params: {},
    query: {},
    body: { asset_id: 1, quantity: 50, ... },
    response: { success: true, ... }
  },
  ip_address: '192.168.1.100',
  user_agent: 'Mozilla/5.0...'
}
```

### Authentication Logging
- **Login Attempts**: Success and failure tracking
- **Registration Events**: New user creation
- **Token Issues**: Authentication problems

## 🛡️ Security Features

### Input Validation
```javascript
// Joi schemas for all endpoints
const purchaseSchema = Joi.object({
  asset_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  date: Joi.date().iso().optional(),
  base_id: Joi.number().integer().positive().required(),
  notes: Joi.string().max(500).optional()
});
```

### Security Middleware
- **Helmet**: Security headers
- **CORS**: Cross-origin request control
- **Rate Limiting**: Prevent API abuse (100 requests/15 minutes)
- **Request Size Limits**: 10MB max payload
- **SQL Injection Protection**: Parameterized queries

### Password Security
- **bcrypt Hashing**: 12 salt rounds
- **Password Requirements**: Minimum 6 characters
- **Secure Comparison**: Timing attack prevention

## 🚀 Production Deployment

### Environment Setup
```bash
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_NAME=your_production_db_name
DB_USER=your_production_db_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_production_jwt_secret_minimum_256_bits
FRONTEND_URL=https://your-domain.com
```

### Process Management
```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name "military-assets-api"
pm2 startup
pm2 save

# Using systemd
sudo systemctl enable military-assets-api
sudo systemctl start military-assets-api
```

### Database Optimization
- **Connection Pooling**: Configured for 20 max connections
- **Indexes**: Optimized for common queries
- **Query Optimization**: Efficient joins and filtering

## 🧪 Testing

### API Testing with curl
```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@military.gov","password":"admin123"}'

# Get assets (with token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/assets
```

### Database Testing
```bash
# Connect to database
psql -h localhost -U postgres -d military_assets

# Check data
SELECT * FROM users;
SELECT * FROM assets LIMIT 5;
SELECT COUNT(*) FROM logs;
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -c "SELECT version();"
```

**Port Already in Use**
```bash
# Find process using port 5000
sudo lsof -ti:5000

# Kill process
sudo kill -9 $(sudo lsof -ti:5000)
```

**JWT Secret Error**
- Ensure JWT_SECRET is set in .env
- Use a secure random string (minimum 256 bits)

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Database query logging
NODE_ENV=development npm run dev
```

## 📈 Performance Monitoring

### Database Performance
- **Connection Pool Monitoring**: Track active connections
- **Query Performance**: Monitor slow queries
- **Index Usage**: Ensure indexes are utilized

### API Performance
- **Response Times**: Monitor endpoint latency
- **Error Rates**: Track 4xx/5xx responses
- **Request Volume**: Monitor API usage patterns

### Health Checks
```javascript
// Built-in health endpoint
GET /health

// Response includes:
{
  success: true,
  message: "Military Asset Management System API is running",
  timestamp: "2024-01-15T10:30:00.000Z",
  environment: "development"
}
```

---

**Backend API Documentation**
*Secure • Scalable • Maintainable*