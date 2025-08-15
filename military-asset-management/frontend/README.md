# Military Asset Management System - Frontend

React frontend application for the Military Asset Management System with Tailwind CSS, responsive design, and role-based UI components.

## 🎨 Technology Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom military theme
- **UI Components**: Headless UI, Heroicons
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Charts**: Recharts (for future analytics)
- **Build Tool**: Vite with hot reload

## 📁 Project Structure

```
frontend/
├── public/
│   └── military-shield.svg     # App icon
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Main layout with sidebar
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── contexts/
│   │   └── AuthContext.jsx     # Authentication state
│   ├── lib/
│   │   └── api.js              # API client configuration
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── Assets.jsx          # Asset management
│   │   ├── Purchases.jsx       # Purchase tracking
│   │   ├── Transfers.jsx       # Transfer management
│   │   ├── Assignments.jsx     # Assignment tracking
│   │   └── Expenditures.jsx    # Expenditure tracking
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # App entry point
│   └── index.css               # Global styles
├── tailwind.config.js          # Tailwind configuration
├── vite.config.js              # Vite configuration
└── package.json                # Dependencies and scripts
```

## 🎨 Design System

### Color Palette
```javascript
// Military theme colors
military: {
  50: '#f0f9ff',   // Light blue tints
  100: '#e0f2fe',
  // ... (blue spectrum)
  600: '#0284c7',  // Primary blue
  900: '#0c4a6e',  // Dark blue
}

olive: {
  50: '#f7f8f0',   // Light olive tints
  // ... (olive spectrum)
  600: '#6f7d37',  // Military olive
  900: '#3d4426',  // Dark olive
}
```

### Component Classes
```css
/* Button variants */
.btn-primary      /* Military blue primary button */
.btn-secondary    /* Gray secondary button */
.btn-danger       /* Red danger button */
.btn-outline      /* Outlined button */

/* Form elements */
.input           /* Standard input field */
.select          /* Select dropdown */

/* Layout components */
.card            /* White card container */
.card-header     /* Card header section */
.card-body       /* Card content area */

/* Table components */
.table           /* Data table */
.table-header    /* Table header */
.table-cell      /* Table cell */

/* Status badges */
.badge-success   /* Green success badge */
.badge-warning   /* Yellow warning badge */
.badge-danger    /* Red danger badge */
.badge-info      /* Blue info badge */
```

## 🔐 Authentication Flow

### Login Process
1. User enters credentials on login page
2. Frontend sends POST request to `/api/auth/login`
3. Backend validates credentials and returns JWT token
4. Token stored in localStorage
5. User redirected to dashboard
6. Token included in all subsequent API requests

### Route Protection
```javascript
// Protected route wrapper
<ProtectedRoute>
  <Layout />
</ProtectedRoute>

// Automatic redirect to login if not authenticated
// Preserves intended destination for post-login redirect
```

### Token Management
- **Storage**: localStorage for persistence
- **Automatic Inclusion**: Axios interceptor adds token to headers
- **Expiration Handling**: Automatic logout on token expiry
- **Refresh**: Manual profile refresh capability

## 🏠 Dashboard Features

### Key Metrics Cards
```javascript
const metricCards = [
  {
    name: 'Opening Balance',
    value: metrics?.summary?.opening_balance || 0,
    icon: CubeIcon,
    color: 'text-blue-600'
  },
  // ... more metrics
]
```

### Real-time Updates
- **Automatic Refresh**: Metrics update on filter changes
- **Loading States**: Skeleton loading during data fetch
- **Error Handling**: Graceful error display

### Interactive Features
- **Filter System**: Date range, base, equipment type
- **Net Movement Modal**: Detailed breakdown on click
- **Recent Activities**: Real-time transaction feed

## 📱 Responsive Design

### Breakpoints
```javascript
// Tailwind CSS breakpoints
sm: '640px',   // Mobile landscape
md: '768px',   // Tablet
lg: '1024px',  // Desktop
xl: '1280px',  // Large desktop
```

### Mobile Navigation
- **Collapsible Sidebar**: Hidden on mobile, overlay when opened
- **Touch-friendly**: Large tap targets, swipe gestures
- **Responsive Tables**: Horizontal scroll on mobile
- **Adaptive Layouts**: Stack cards on small screens

### Layout Adaptations
```javascript
// Responsive grid classes
"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"

// Mobile-first approach
"hidden lg:block"        // Hide on mobile, show on desktop
"lg:hidden"              // Show on mobile, hide on desktop
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Application available at: http://localhost:3000

### 3. Build for Production
```bash
npm run build
```
Built files in `dist/` directory

### 4. Preview Production Build
```bash
npm run preview
```

## 🔧 Configuration

### Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        military: { /* custom colors */ },
        olive: { /* custom colors */ }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    }
  }
}
```

## 🎯 Component Architecture

### Layout Component
```javascript
// Main layout with sidebar navigation
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {/* Desktop sidebar */}
      {/* Main content area */}
      <Outlet /> {/* Nested routes */}
    </div>
  )
}
```

### Authentication Context
```javascript
// Global authentication state
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  
  const login = async (credentials) => { /* ... */ }
  const logout = () => { /* ... */ }
  
  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### API Integration
```javascript
// Axios configuration with interceptors
const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// Request interceptor - add auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Auto-logout on unauthorized
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## 🎨 UI Components

### Metric Cards
```javascript
const MetricCard = ({ name, value, icon: Icon, color, bgColor }) => (
  <div className="metric-card">
    <div className="p-5">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-5">
          <dt className="text-sm font-medium text-gray-500">{name}</dt>
          <dd className="text-lg font-medium text-gray-900">
            {value.toLocaleString()}
          </dd>
        </div>
      </div>
    </div>
  </div>
)
```

### Data Tables
```javascript
const DataTable = ({ columns, data, loading }) => (
  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
    <table className="table">
      <thead className="table-header">
        <tr>
          {columns.map(col => (
            <th key={col.key} className="table-header-cell">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="table-body">
        {data.map(row => (
          <tr key={row.id}>
            {columns.map(col => (
              <td key={col.key} className="table-cell">
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
```

### Status Badges
```javascript
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'badge-success'
      case 'Pending': return 'badge-warning'
      case 'Completed': return 'badge-info'
      default: return 'badge-danger'
    }
  }
  
  return (
    <span className={`badge ${getStatusColor(status)}`}>
      {status}
    </span>
  )
}
```

## 🔄 State Management

### Authentication State
```javascript
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      }
    default:
      return state
  }
}
```

### Local Component State
```javascript
// Dashboard metrics state
const [metrics, setMetrics] = useState(null)
const [loading, setLoading] = useState(true)
const [filters, setFilters] = useState({
  start_date: '',
  end_date: '',
  base_id: '',
  type: ''
})

// Fetch data on filter changes
useEffect(() => {
  fetchMetrics()
}, [filters])
```

## 📱 User Experience Features

### Loading States
- **Skeleton Loading**: Cards show placeholder content
- **Spinner Indicators**: Button loading states
- **Progressive Loading**: Staggered content appearance

### Error Handling
- **Toast Notifications**: Success/error messages
- **Graceful Degradation**: Fallback UI states
- **Network Error Recovery**: Retry mechanisms

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and roles
- **High Contrast**: Accessible color combinations
- **Focus Management**: Visible focus indicators

## 🚀 Performance Optimization

### Code Splitting
```javascript
// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Assets = lazy(() => import('./pages/Assets'))

// Suspense wrapper
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/assets" element={<Assets />} />
  </Routes>
</Suspense>
```

### Bundle Optimization
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Compress images and fonts
- **Chunk Splitting**: Separate vendor and app code

### Runtime Performance
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: Large dataset handling
- **Debounced Search**: Reduce API calls

## 🧪 Testing

### Component Testing
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

### Manual Testing Checklist
- [ ] Login/logout functionality
- [ ] Role-based UI display
- [ ] Responsive design on mobile/tablet
- [ ] Form validation and submission
- [ ] Error handling and notifications
- [ ] Navigation and routing

## 🚀 Deployment

### Build Process
```bash
# Create production build
npm run build

# Files generated in dist/ directory
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
```

### Static Hosting Options
- **Netlify**: Drag-and-drop deployment
- **Vercel**: Git-based deployment
- **AWS S3 + CloudFront**: Enterprise hosting
- **GitHub Pages**: Free hosting for public repos

### Environment Variables
```bash
# Production environment
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME="Military Asset Management System"
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

**API Connection Issues**
- Check Vite proxy configuration
- Verify backend server is running
- Check CORS settings in backend

**Styling Issues**
```bash
# Rebuild Tailwind CSS
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
```

### Debug Tools
- **React Developer Tools**: Component inspection
- **Network Tab**: API request monitoring
- **Console Logging**: Debug state changes

## 🔮 Future Enhancements

### Planned Features
- **Advanced Charts**: Asset analytics with Recharts
- **Real-time Updates**: WebSocket integration
- **Offline Support**: Service worker implementation
- **PWA Features**: Install prompt, push notifications
- **Advanced Search**: Full-text search with filters
- **Bulk Operations**: Multi-select actions
- **Export Features**: PDF/Excel report generation
- **Mobile App**: React Native version

### Performance Improvements
- **Virtual Scrolling**: Handle large datasets
- **Infinite Scrolling**: Paginated data loading
- **Image Optimization**: WebP format, lazy loading
- **Bundle Analysis**: Webpack bundle analyzer

---

**Frontend Application**
*Modern • Responsive • Accessible*