import React from 'react';
import { Assignment, Base } from '../types';
import { clsx } from 'clsx';

interface AssignmentsProps {
  assignments: Assignment[];
  bases: Base[];
}

const Assignments: React.FC<AssignmentsProps> = ({ assignments, bases }) => {
  const getStatusBadge = (status: Assignment['status']) => {
    const statusStyles = {
      'Assigned': 'bg-green-100 text-green-800 border-green-200',
      'Expended': 'bg-red-100 text-red-800 border-red-200',
      'Returned': 'bg-blue-100 text-blue-800 border-blue-200'
    };

    const statusEmojis = {
      'Assigned': '🟢',
      'Expended': '🔴',
      'Returned': '🔵'
    };

    return (
      <span className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status]
      )}>
        <span className="mr-1">{statusEmojis[status]}</span>
        {status}
      </span>
    );
  };

  const getBaseName = (baseId: string) => {
    return bases.find(base => base.id === baseId)?.name || 'Unknown Base';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignments & Expenditures</h1>
        <p className="text-gray-600 mt-1">
          Track asset assignments and expenditures across all bases
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.assetName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {assignment.purpose}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getBaseName(assignment.baseId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(assignment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(assignment.date).toLocaleDateString()}
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

export default Assignments;