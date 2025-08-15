import React from 'react'
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline'

const Transfers = () => {
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Transfers
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage asset transfers between bases
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <ArrowsRightLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Transfer Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            Transfer management functionality will be implemented here.
          </p>
          <div className="mt-6">
            <button className="btn-primary">
              Create New Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Transfers