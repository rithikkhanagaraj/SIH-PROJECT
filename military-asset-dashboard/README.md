# Military Asset Management Dashboard

A comprehensive React + Tailwind CSS responsive web dashboard for tracking weapons, vehicles, and ammunition across multiple military bases.

![Military Asset Management Dashboard](https://img.shields.io/badge/Status-Complete-green)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.12-blue)

## 🚀 Features

### Core Functionality
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile devices
- **Role-Based Access**: Different dashboard views for Admin, Commander, and Logistics Officer roles
- **Real-Time Asset Tracking**: Track weapons, vehicles, and ammunition across multiple bases
- **Interactive Components**: Hover animations, transitions, and modern UI interactions

### Dashboard Features
- **Summary Metric Cards**: Opening Balance, Purchases, Transfers, Assignments, Expenditures, Closing Balance
- **Interactive Map**: Base locations with asset distribution (desktop view with mobile list fallback)
- **Activity Feed**: Timeline view of recent activities with icons and status indicators
- **Quick Actions**: Fast access to common operations

### Asset Management
- **Purchase Management**: 
  - Filterable table with search functionality
  - Modal form for new purchase requests
  - Status tracking (Pending, Approved, Received, Cancelled)
  - Export functionality

- **Transfer Management**:
  - Inter-base asset movement tracking
  - Transfer history with status indicators
  - New transfer request form
  - Real-time status updates

- **Assignments & Expenditures**:
  - Asset assignment tracking with status tags (🟢 Assigned, 🔴 Expended, 🔵 Returned)
  - Equipment allocation management
  - Purpose and timeline tracking

- **Reports & Analytics**:
  - Placeholder charts for future implementation
  - Export options (PDF/Excel)
  - Comprehensive analytics framework

### Unique Features
- **Condition-Based Status**: 🟢 Available, 🟠 Under Repair, 🔴 Expended
- **Stock Threshold Alerts**: Red badges when balance falls below required levels
- **Military-Style Design**: Clean typography, military green color scheme, professional icons
- **Mobile-First Responsive**: Collapsible sidebar becomes hamburger menu on mobile

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.1.1 with TypeScript
- **Styling**: Tailwind CSS 4.1.12 with custom military theme
- **Icons**: Heroicons and Lucide React
- **State Management**: React Hooks (useState for local state)
- **Build Tool**: Create React App
- **Package Manager**: npm

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd military-asset-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout.tsx       # Main layout wrapper
│   ├── Navbar.tsx       # Top navigation bar
│   ├── Sidebar.tsx      # Collapsible sidebar navigation
│   ├── MetricCard.tsx   # Dashboard metric cards
│   ├── InteractiveMap.tsx # Base location map
│   ├── ActivityFeed.tsx # Recent activity timeline
│   └── PurchaseModal.tsx # New purchase form modal
├── pages/               # Main application pages
│   ├── Dashboard.tsx    # Main dashboard page
│   ├── Purchases.tsx    # Purchase management page
│   ├── Transfers.tsx    # Transfer management page
│   ├── Assignments.tsx  # Assignment & expenditure tracking
│   ├── Reports.tsx      # Analytics and reporting
│   └── Settings.tsx     # System settings
├── data/                # Mock data and API layer
│   └── mockData.ts      # Sample data for development
├── types/               # TypeScript type definitions
│   └── index.ts         # All interface definitions
├── utils/               # Utility functions
└── hooks/               # Custom React hooks
```

## 🎨 Design System

### Color Palette
- **Primary Military Green**: `#369836` (military-600)
- **Status Colors**:
  - Available: `#10b981` (Green)
  - Under Repair: `#f59e0b` (Yellow/Orange)
  - Expended: `#ef4444` (Red)

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Military-style typography** with clean, professional appearance

### Components
- **Cards**: White background with soft shadows and rounded corners
- **Buttons**: Primary (military green) and secondary (outlined) variants
- **Status Badges**: Color-coded with emojis for quick recognition
- **Tables**: Responsive with hover states and mobile-optimized

## 🔐 Role-Based Views

### Admin Role
- **National Overview**: Access to all bases and comprehensive metrics
- **Full System Access**: Complete dashboard with all features enabled
- **Cross-Base Analytics**: View trends and patterns across all locations

### Base Commander Role
- **Base-Only View**: Filtered to show only assigned base data
- **Local Operations Focus**: Metrics and activities specific to their base
- **Limited Transfer Authority**: Can request but may need approval

### Logistics Officer Role
- **Pending Tasks View**: Focus on items requiring action
- **Purchase & Transfer Management**: Specialized workflow for logistics operations
- **Supply Chain Optimization**: Tools for efficient asset distribution

## 📱 Responsive Design

### Desktop (1024px+)
- Full sidebar navigation
- Multi-column layouts
- Interactive map with detailed base information
- Comprehensive data tables

### Tablet (768px - 1023px)
- Collapsible sidebar
- Optimized card layouts
- Touch-friendly interface
- Simplified map interactions

### Mobile (< 768px)
- Hamburger menu navigation
- Stacked card layouts
- List view for map data
- Scrollable tables
- Floating action buttons

## 🚀 Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## 🔮 Future Enhancements

### Charts and Analytics
- Integration with Recharts for real-time data visualization
- Advanced filtering and sorting capabilities
- Custom report generation

### Real-Time Features
- WebSocket integration for live updates
- Push notifications for critical alerts
- Real-time collaboration features

### Advanced Security
- Multi-factor authentication
- Audit logging
- Role-based permissions granularity

### Mobile App
- React Native version for mobile devices
- Offline capability
- Push notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- **Heroicons** for the beautiful icon set
- **Tailwind CSS** for the utility-first CSS framework
- **React Team** for the excellent framework
- **Military Asset Management** best practices and standards

---

**Built with ❤️ for military asset management efficiency and security.**
