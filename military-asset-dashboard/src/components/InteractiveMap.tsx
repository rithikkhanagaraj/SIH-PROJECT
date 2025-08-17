import React, { useState } from 'react';
import { MapPinIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Base } from '../types';
import { clsx } from 'clsx';

interface InteractiveMapProps {
  bases: Base[];
  onBaseSelect?: (base: Base) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ bases, onBaseSelect }) => {
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);
  const [showMobileList, setShowMobileList] = useState(false);

  const handleBaseClick = (base: Base) => {
    setSelectedBase(base);
    onBaseSelect?.(base);
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Base Locations</h3>
            <p className="text-sm text-gray-600">Real-time asset distribution across military bases</p>
          </div>
          <button
            onClick={() => setShowMobileList(!showMobileList)}
            className="md:hidden flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <span>View List</span>
            {showMobileList ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Desktop Map View */}
      <div className="hidden md:block relative h-96 bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden">
        {/* Simplified map background */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 800 400" className="w-full h-full">
            {/* US map outline (simplified) */}
            <path
              d="M200 100 L600 100 L650 150 L600 300 L150 300 L100 200 Z"
              fill="none"
              stroke="#6b7280"
              strokeWidth="2"
              opacity="0.3"
            />
          </svg>
        </div>

        {/* Base pins */}
        {bases.map((base, index) => {
          const x = 150 + (index * 120) + (Math.random() * 50);
          const y = 120 + (index * 40) + (Math.random() * 80);
          
          return (
            <button
              key={base.id}
              onClick={() => handleBaseClick(base)}
              className={clsx(
                'absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110',
                selectedBase?.id === base.id ? 'z-20' : 'z-10'
              )}
              style={{ left: `${x}px`, top: `${y}px` }}
            >
              <div className="relative">
                <MapPinIcon className={clsx(
                  'w-8 h-8 transition-colors duration-200',
                  selectedBase?.id === base.id ? 'text-military-600' : 'text-red-500 hover:text-red-600'
                )} />
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className={clsx(
                    'px-2 py-1 rounded text-xs font-medium transition-all duration-200',
                    selectedBase?.id === base.id 
                      ? 'bg-military-600 text-white' 
                      : 'bg-white text-gray-700 shadow-sm border border-gray-200'
                  )}>
                    {base.name}
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {/* Selected base info */}
        {selectedBase && (
          <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
            <h4 className="font-semibold text-gray-900">{selectedBase.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{selectedBase.location}</p>
            <p className="text-xs text-gray-500 mb-2">Commander: {selectedBase.commander}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-semibold text-blue-600">{selectedBase.assets.weapons.toLocaleString()}</div>
                <div className="text-blue-600">Weapons</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-semibold text-green-600">{selectedBase.assets.vehicles.toLocaleString()}</div>
                <div className="text-green-600">Vehicles</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="font-semibold text-yellow-600">{selectedBase.assets.ammunition.toLocaleString()}</div>
                <div className="text-yellow-600">Ammunition</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile List View */}
      <div className={clsx(
        'md:hidden transition-all duration-300 overflow-hidden',
        showMobileList ? 'max-h-96' : 'max-h-0'
      )}>
        <div className="space-y-2 p-4">
          {bases.map((base) => (
            <button
              key={base.id}
              onClick={() => handleBaseClick(base)}
              className={clsx(
                'w-full text-left p-4 rounded-lg border transition-all duration-200',
                selectedBase?.id === base.id 
                  ? 'border-military-600 bg-military-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{base.name}</h4>
                  <p className="text-sm text-gray-600">{base.location}</p>
                  <p className="text-xs text-gray-500 mt-1">Commander: {base.commander}</p>
                </div>
                <MapPinIcon className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-semibold text-blue-600">{base.assets.weapons.toLocaleString()}</div>
                  <div className="text-blue-600">Weapons</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-semibold text-green-600">{base.assets.vehicles.toLocaleString()}</div>
                  <div className="text-green-600">Vehicles</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <div className="font-semibold text-yellow-600">{base.assets.ammunition.toLocaleString()}</div>
                  <div className="text-yellow-600">Ammunition</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Default mobile view */}
      <div className="md:hidden p-4">
        <div className="grid grid-cols-2 gap-4">
          {bases.slice(0, 4).map((base) => (
            <button
              key={base.id}
              onClick={() => handleBaseClick(base)}
              className="p-3 text-left border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-2 mb-2">
                <MapPinIcon className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-900">{base.name}</span>
              </div>
              <div className="text-xs text-gray-600">
                {base.assets.weapons + base.assets.vehicles + base.assets.ammunition} assets
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;