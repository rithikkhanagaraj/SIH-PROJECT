import React, { useState } from 'react';
import { 
  PlusIcon, 
  ArrowsRightLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Transfer, Base } from '../types';
import { clsx } from 'clsx';

interface TransfersProps {
  transfers: Transfer[];
  bases: Base[];
  onAddTransfer: (transfer: Omit<Transfer, 'id'>) => void;
}

const Transfers: React.FC<TransfersProps> = ({ transfers, bases, onAddTransfer }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    assetName: '',
    quantity: 1,
    fromBaseId: '',
    toBaseId: '',
    reason: '',
    requestedBy: ''
  });

  const getStatusIcon = (status: Transfer['status']) => {
    switch (status) {
      case 'Pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'In Transit':
        return <ArrowsRightLeftIcon className="w-5 h-5 text-blue-500" />;
      case 'Completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'Cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Transfer['status']) => {
    const statusStyles = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'In Transit': 'bg-blue-100 text-blue-800 border-blue-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status]
      )}>
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  const getBaseName = (baseId: string) => {
    return bases.find(base => base.id === baseId)?.name || 'Unknown Base';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transfer: Omit<Transfer, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      assetId: `asset-${Date.now()}`,
      assetName: formData.assetName,
      quantity: formData.quantity,
      fromBaseId: formData.fromBaseId,
      toBaseId: formData.toBaseId,
      status: 'Pending',
      requestedBy: formData.requestedBy,
      reason: formData.reason
    };

    onAddTransfer(transfer);
    setFormData({
      assetName: '',
      quantity: 1,
      fromBaseId: '',
      toBaseId: '',
      reason: '',
      requestedBy: ''
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Transfers</h1>
          <p className="text-gray-600 mt-1">
            Manage inter-base asset movements and transfers
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 btn-primary"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          New Transfer
        </button>
      </div>

      {/* New Transfer Form */}
      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">New Transfer Request</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  value={formData.assetName}
                  onChange={(e) => setFormData(prev => ({ ...prev, assetName: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                  placeholder="e.g., M4A1 Carbine"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Base
                </label>
                <select
                  value={formData.fromBaseId}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromBaseId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                >
                  <option value="">Select source base</option>
                  {bases.map(base => (
                    <option key={base.id} value={base.id}>{base.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Base
                </label>
                <select
                  value={formData.toBaseId}
                  onChange={(e) => setFormData(prev => ({ ...prev, toBaseId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                >
                  <option value="">Select destination base</option>
                  {bases.filter(base => base.id !== formData.fromBaseId).map(base => (
                    <option key={base.id} value={base.id}>{base.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested By
                </label>
                <input
                  type="text"
                  value={formData.requestedBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, requestedBy: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                  placeholder="e.g., Col. Rodriguez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                  placeholder="e.g., Training exercise support"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Submit Transfer Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfer History Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transfer History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From → To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transfer.assetName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transfer.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{getBaseName(transfer.fromBaseId)}</span>
                      <ArrowsRightLeftIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{getBaseName(transfer.toBaseId)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transfer.quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transfer.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transfer.requestedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transfer.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transfers;