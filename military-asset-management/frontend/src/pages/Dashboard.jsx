import React, { useState, useEffect } from 'react'
import { dashboardAPI } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import {
  CubeIcon,
  ShoppingCartIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentListIcon,
  FireIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    base_id: '',
    type: '',
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchMetrics()
  }, [filters])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await dashboardAPI.getMetrics(filters)
      setMetrics(response.data.data)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const metricCards = [
    {
      name: 'Opening Balance',
      value: metrics?.summary?.opening_balance || 0,
      icon: CubeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Closing Balance',
      value: metrics?.summary?.closing_balance || 0,
      icon: CubeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Net Movement',
      value: metrics?.summary?.net_movement || 0,
      icon: ArrowsRightLeftIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Assigned Assets',
      value: metrics?.summary?.assigned_assets || 0,
      icon: ClipboardDocumentListIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.name}. Here's what's happening with your assets.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-military-500">
            <FunnelIcon className="mr-2 h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((item) => (
          <div key={item.name} className="metric-card">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${item.bgColor}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {item.value.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Movement Breakdown */}
      {metrics?.summary?.movement_breakdown && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Movement Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  +{metrics.summary.movement_breakdown.purchases.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Purchases</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  +{metrics.summary.movement_breakdown.transfers_in.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Transfers In</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  -{metrics.summary.movement_breakdown.transfers_out.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Transfers Out</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {metrics?.recent_activities && metrics.recent_activities.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {metrics.recent_activities.slice(0, 5).map((activity, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'Purchase' ? 'bg-green-100' :
                      activity.type === 'Transfer' ? 'bg-blue-100' :
                      activity.type === 'Assignment' ? 'bg-orange-100' :
                      'bg-red-100'
                    }`}>
                      {activity.type === 'Purchase' && <ShoppingCartIcon className="h-4 w-4 text-green-600" />}
                      {activity.type === 'Transfer' && <ArrowsRightLeftIcon className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'Assignment' && <ClipboardDocumentListIcon className="h-4 w-4 text-orange-600" />}
                      {activity.type === 'Expenditure' && <FireIcon className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type}: {activity.asset_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {activity.quantity} • {activity.base_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard