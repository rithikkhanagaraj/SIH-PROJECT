# Military Asset Management System

A comprehensive full-stack web application for managing military assets across multiple bases, enabling commanders and logistics personnel to track movements, assignments, and expenditures of critical assets including vehicles, weapons, ammunition, and equipment.

## 🏗️ System Architecture

### Frontend (React + Tailwind CSS)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom military theme
- **UI Components**: Headless UI, Heroicons
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Charts**: Recharts (for future analytics)

### Backend (Node.js + Express)
- **Framework**: Express.js with security middleware
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT with role-based access control (RBAC)
- **Validation**: Joi schema validation
- **Logging**: Morgan for HTTP requests, custom audit logging
- **Security**: Helmet, CORS, rate limiting

### Database (PostgreSQL)
- **Tables**: 8 core tables with proper relationships
- **Features**: Triggers, indexes, constraints
- **Audit Trail**: Complete logging system
- **Data Integrity**: Foreign keys and check constraints

## 🚀 Features

### Dashboard
- **Key Metrics**: Opening/Closing balance, Net movement, Assigned assets
- **Movement Breakdown**: Purchases, Transfers in/out with modal details
- **Filters**: Date range, Base, Equipment type
- **Recent Activities**: Real-time transaction feed

### Asset Management
- **CRUD Operations**: Create, read, update, delete assets
- **Categorization**: Vehicles, Weapons, Ammunition, Equipment
- **Multi-base Support**: Assets distributed across bases
- **Balance Tracking**: Real-time quantity updates

### Purchase Management
- **Purchase Recording**: Add purchases with automatic quantity updates
- **History Tracking**: Complete purchase history with filtering
- **User Attribution**: Track who made each purchase
- **Notes System**: Additional context for purchases

### Transfer Management
- **Inter-base Transfers**: Move assets between bases
- **Status Tracking**: Pending → In Transit → Completed
- **Automatic Updates**: Quantities updated on both bases
- **Transfer History**: Complete audit trail

### Assignment System
- **Personnel Assignment**: Assign assets to specific personnel/units
- **Status Management**: Active vs Returned assignments
- **Availability Checking**: Prevents over-assignment
- **Return Processing**: Mark assignments as returned

### Expenditure Tracking
- **Usage Recording**: Track asset consumption/expenditure
- **Reason Codes**: Categorize expenditures (training, operations, etc.)
- **Quantity Deduction**: Automatic inventory updates
- **Audit Trail**: Complete expenditure history

### Role-Based Access Control
- **Admin**: Full system access
- **Base Commander**: Access to their base only
- **Logistics Officer**: Limited to purchases and transfers
- **Secure Authentication**: JWT tokens with automatic refresh

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn** package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd military-asset-management
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your database credentials
nano .env
```

**Environment Variables (.env):**
```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=military_assets
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb military_assets

# Run database initialization and seeding
npm run seed
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 👥 Demo Accounts

The system comes with pre-seeded demo accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Admin | admin@military.gov | admin123 | Full system access |
| Base Commander | commander1@military.gov | commander123 | Fort Liberty only |
| Base Commander | commander2@military.gov | commander123 | Camp Pendleton only |
| Logistics Officer | logistics1@military.gov | logistics123 | Fort Liberty purchases/transfers |
| Logistics Officer | logistics2@military.gov | logistics123 | Camp Pendleton purchases/transfers |

## 🏢 Demo Data

The seeded database includes:

- **4 Military Bases**: Fort Liberty, Camp Pendleton, Joint Base Lewis-McChord, Fort Hood
- **25+ Assets**: Various weapons, vehicles, ammunition, and equipment
- **Sample Transactions**: Purchases, transfers, assignments, and expenditures
- **Complete Audit Trail**: All transactions logged with user attribution

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
GET  /api/auth/profile        # Get user profile
PUT  /api/auth/profile        # Update profile
PUT  /api/auth/change-password # Change password
```

### Asset Management
```
GET    /api/assets            # Get all assets
GET    /api/assets/:id        # Get specific asset
GET    /api/assets/:id/balance # Get asset balance
POST   /api/assets            # Create new asset
PUT    /api/assets/:id        # Update asset
DELETE /api/assets/:id        # Delete asset
```

### Transaction Endpoints
```
# Purchases
GET    /api/purchases         # Get all purchases
POST   /api/purchases         # Create purchase
PUT    /api/purchases/:id     # Update purchase
DELETE /api/purchases/:id     # Delete purchase

# Transfers
GET    /api/transfers         # Get all transfers
POST   /api/transfers         # Create transfer
PUT    /api/transfers/:id/status # Update status
DELETE /api/transfers/:id     # Delete transfer

# Assignments
GET    /api/assignments       # Get all assignments
POST   /api/assignments       # Create assignment
PUT    /api/assignments/:id   # Update assignment
PUT    /api/assignments/:id/return # Return assignment
DELETE /api/assignments/:id   # Delete assignment

# Expenditures
GET    /api/expenditures      # Get all expenditures
POST   /api/expenditures      # Create expenditure
PUT    /api/expenditures/:id  # Update expenditure
DELETE /api/expenditures/:id  # Delete expenditure
```

### Dashboard & Utilities
```
GET /api/dashboard/metrics     # Get dashboard metrics
GET /api/dashboard/bases       # Get available bases
GET /api/dashboard/asset-types # Get asset types
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Fine-grained permission system
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Joi schema validation on all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin requests
- **Audit Logging**: Complete action tracking
- **Password Hashing**: bcrypt with salt rounds

## 🏗️ Database Schema

### Core Tables
- **bases**: Military base information
- **users**: System users with roles and base assignments
- **assets**: Asset inventory with quantities
- **purchases**: Purchase transaction records
- **transfers**: Inter-base transfer records
- **assignments**: Asset-to-personnel assignments
- **expenditures**: Asset consumption records
- **logs**: Complete audit trail

### Key Relationships
- Users belong to bases (except Admins)
- Assets are located at specific bases
- All transactions reference users and bases
- Foreign key constraints ensure data integrity

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-domain.com
```

### Build Commands
```bash
# Backend (already production-ready)
cd backend
npm install --production

# Frontend
cd frontend
npm run build
```

### Deployment Options
- **Docker**: Containerized deployment
- **Heroku**: Easy cloud deployment
- **AWS/Azure**: Enterprise cloud solutions
- **Traditional VPS**: Self-hosted solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues

**Database Connection Error:**
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

**Port Already in Use:**
- Change PORT in `.env` file
- Kill existing processes: `sudo lsof -ti:5000 | xargs kill -9`

**Frontend Build Errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

### Getting Help
- Check the [Issues](../../issues) page for known problems
- Create a new issue with detailed error information
- Include environment details and error logs

## 🔮 Future Enhancements

- **Advanced Analytics**: Charts and reporting dashboards
- **Mobile Application**: React Native companion app
- **Barcode/QR Integration**: Asset scanning capabilities
- **Geolocation Tracking**: GPS-based asset location
- **Automated Alerts**: Low inventory notifications
- **Integration APIs**: Connect with existing military systems
- **Advanced Reporting**: PDF/Excel export capabilities
- **Multi-language Support**: Internationalization
- **Advanced Search**: Full-text search capabilities
- **Backup/Restore**: Automated data backup systems

---

**Built with ❤️ for Military Asset Management**

*Secure • Reliable • Efficient*