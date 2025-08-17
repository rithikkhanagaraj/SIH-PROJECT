import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Purchase, Base } from '../types';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (purchase: Omit<Purchase, 'id'>) => void;
  bases: Base[];
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, onSubmit, bases }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    assetType: 'Weapon',
    assetName: '',
    quantity: 1,
    unitCost: 0,
    supplier: '',
    baseId: '',
    requestedBy: '',
    status: 'Pending' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const purchase: Omit<Purchase, 'id'> = {
      ...formData,
      totalCost: formData.quantity * formData.unitCost
    };

    onSubmit(purchase);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      assetType: 'Weapon',
      assetName: '',
      quantity: 1,
      unitCost: 0,
      supplier: '',
      baseId: '',
      requestedBy: '',
      status: 'Pending'
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">New Purchase Request</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                />
              </div>

              <div>
                <label htmlFor="assetType" className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Type
                </label>
                <select
                  id="assetType"
                  name="assetType"
                  value={formData.assetType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                >
                  <option value="Weapon">Weapon</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Ammunition">Ammunition</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="assetName" className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name
              </label>
              <input
                type="text"
                id="assetName"
                name="assetName"
                value={formData.assetName}
                onChange={handleChange}
                required
                placeholder="e.g., M4A1 Carbine"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                />
              </div>

              <div>
                <label htmlFor="unitCost" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Cost ($)
                </label>
                <input
                  type="number"
                  id="unitCost"
                  name="unitCost"
                  value={formData.unitCost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                required
                placeholder="e.g., Colt Defense"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              />
            </div>

            <div>
              <label htmlFor="baseId" className="block text-sm font-medium text-gray-700 mb-1">
                Destination Base
              </label>
              <select
                id="baseId"
                name="baseId"
                value={formData.baseId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              >
                <option value="">Select a base</option>
                {bases.map(base => (
                  <option key={base.id} value={base.id}>
                    {base.name} - {base.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="requestedBy" className="block text-sm font-medium text-gray-700 mb-1">
                Requested By
              </label>
              <input
                type="text"
                id="requestedBy"
                name="requestedBy"
                value={formData.requestedBy}
                onChange={handleChange}
                required
                placeholder="e.g., Maj. Thompson"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              />
            </div>

            {/* Total Cost Display */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                <span className="text-lg font-bold text-military-600">
                  ${(formData.quantity * formData.unitCost).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Submit Purchase Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;