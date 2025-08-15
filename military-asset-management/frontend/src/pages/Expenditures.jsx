import React from 'react'
import { FireIcon } from '@heroicons/react/24/outline'

const Expenditures = () => {
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Expenditures
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Track asset expenditures and consumption
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <FireIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Expenditure Tracking</h3>
          <p className="mt-1 text-sm text-gray-500">
            Expenditure tracking functionality will be implemented here.
          </p>
          <div className="mt-6">
            <button className="btn-primary">
              Record Expenditure
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Expenditures