import React from 'react';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
  format?: 'number' | 'currency';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'gray',
  format = 'number'
}) => {
  const formatValue = (val: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(val);
    }
    return new Intl.NumberFormat('en-US').format(val);
  };

  const colorClasses = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  const changeColorClasses = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-500'
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <div className="flex items-center">
              <span className={clsx('text-sm font-medium', changeColorClasses[changeType])}>
                {changeType === 'increase' && '+'}
                {change > 0 ? change : Math.abs(change)}
                {changeType === 'increase' && '↗'}
                {changeType === 'decrease' && '↘'}
                {changeType === 'neutral' && '→'}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={clsx(
          'flex items-center justify-center w-12 h-12 rounded-lg border',
          colorClasses[color]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;