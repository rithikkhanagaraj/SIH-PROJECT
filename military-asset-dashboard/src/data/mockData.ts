import { User, Base, Asset, Purchase, Transfer, Assignment, Activity, DashboardMetrics, Alert } from '../types';

export const currentUser: User = {
  id: '1',
  name: 'Col. Sarah Mitchell',
  role: 'Admin',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
};

export const bases: Base[] = [
  {
    id: 'base-1',
    name: 'Fort Liberty',
    location: 'North Carolina, USA',
    coordinates: [35.1495, -79.0164],
    commander: 'Gen. James Patterson',
    assets: { weapons: 1250, vehicles: 340, ammunition: 45000 }
  },
  {
    id: 'base-2',
    name: 'Camp Pendleton',
    location: 'California, USA',
    coordinates: [33.3547, -117.3411],
    commander: 'Col. Maria Rodriguez',
    assets: { weapons: 890, vehicles: 210, ammunition: 32000 }
  },
  {
    id: 'base-3',
    name: 'Joint Base Lewis-McChord',
    location: 'Washington, USA',
    coordinates: [47.1078, -122.5842],
    commander: 'Brig. Gen. Michael Chen',
    assets: { weapons: 1100, vehicles: 280, ammunition: 38000 }
  },
  {
    id: 'base-4',
    name: 'Fort Hood',
    location: 'Texas, USA',
    coordinates: [31.1365, -97.7842],
    commander: 'Gen. Robert Davis',
    assets: { weapons: 1450, vehicles: 420, ammunition: 52000 }
  }
];

export const assets: Asset[] = [
  {
    id: 'asset-1',
    name: 'M4A1 Carbine',
    type: 'Weapon',
    category: 'Assault Rifle',
    condition: 'Available',
    quantity: 250,
    baseId: 'base-1',
    serialNumber: 'M4-2024-001',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-04-15',
    threshold: 200
  },
  {
    id: 'asset-2',
    name: 'M1A2 Abrams',
    type: 'Vehicle',
    category: 'Main Battle Tank',
    condition: 'Available',
    quantity: 12,
    baseId: 'base-1',
    serialNumber: 'ABR-2024-001',
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-07-20',
    assignedTo: 'Alpha Company',
    threshold: 8
  },
  {
    id: 'asset-3',
    name: '5.56mm NATO',
    type: 'Ammunition',
    category: 'Small Arms',
    condition: 'Available',
    quantity: 15000,
    baseId: 'base-1',
    threshold: 10000
  },
  {
    id: 'asset-4',
    name: 'HMMWV',
    type: 'Vehicle',
    category: 'Utility Vehicle',
    condition: 'Under Repair',
    quantity: 8,
    baseId: 'base-2',
    serialNumber: 'HMV-2024-001',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-03-10',
    threshold: 10
  }
];

export const purchases: Purchase[] = [
  {
    id: 'purchase-1',
    date: '2024-01-25',
    assetType: 'Weapon',
    assetName: 'M4A1 Carbine',
    quantity: 50,
    unitCost: 1200,
    totalCost: 60000,
    supplier: 'Colt Defense',
    baseId: 'base-1',
    status: 'Approved',
    requestedBy: 'Maj. Thompson'
  },
  {
    id: 'purchase-2',
    date: '2024-01-24',
    assetType: 'Ammunition',
    assetName: '5.56mm NATO',
    quantity: 10000,
    unitCost: 0.85,
    totalCost: 8500,
    supplier: 'Federal Premium',
    baseId: 'base-2',
    status: 'Received',
    requestedBy: 'Capt. Johnson'
  },
  {
    id: 'purchase-3',
    date: '2024-01-23',
    assetType: 'Vehicle',
    assetName: 'HMMWV',
    quantity: 5,
    unitCost: 85000,
    totalCost: 425000,
    supplier: 'AM General',
    baseId: 'base-3',
    status: 'Pending',
    requestedBy: 'Lt. Col. Wilson'
  }
];

export const transfers: Transfer[] = [
  {
    id: 'transfer-1',
    date: '2024-01-26',
    assetId: 'asset-1',
    assetName: 'M4A1 Carbine',
    quantity: 25,
    fromBaseId: 'base-1',
    toBaseId: 'base-2',
    status: 'In Transit',
    requestedBy: 'Col. Rodriguez',
    approvedBy: 'Gen. Patterson',
    reason: 'Training exercise support'
  },
  {
    id: 'transfer-2',
    date: '2024-01-25',
    assetId: 'asset-3',
    assetName: '5.56mm NATO',
    quantity: 5000,
    fromBaseId: 'base-1',
    toBaseId: 'base-3',
    status: 'Completed',
    requestedBy: 'Brig. Gen. Chen',
    approvedBy: 'Gen. Patterson',
    reason: 'Ammunition shortage'
  }
];

export const assignments: Assignment[] = [
  {
    id: 'assignment-1',
    date: '2024-01-24',
    assetId: 'asset-2',
    assetName: 'M1A2 Abrams',
    quantity: 4,
    assignedTo: 'Alpha Company, 1st Battalion',
    baseId: 'base-1',
    purpose: 'Field training exercise',
    status: 'Assigned',
    assignedBy: 'Maj. Thompson',
    expectedReturn: '2024-02-15'
  },
  {
    id: 'assignment-2',
    date: '2024-01-23',
    assetId: 'asset-3',
    assetName: '5.56mm NATO',
    quantity: 2000,
    assignedTo: 'Bravo Company, 2nd Battalion',
    baseId: 'base-1',
    purpose: 'Live fire training',
    status: 'Expended',
    assignedBy: 'Capt. Davis'
  }
];

export const activities: Activity[] = [
  {
    id: 'activity-1',
    type: 'purchase',
    title: 'New Purchase Request',
    description: '50 M4A1 Carbines approved for Fort Liberty',
    timestamp: '2024-01-25T14:30:00Z',
    user: 'Maj. Thompson',
    baseId: 'base-1'
  },
  {
    id: 'activity-2',
    type: 'transfer',
    title: 'Asset Transfer',
    description: '25 M4A1 Carbines transferred to Camp Pendleton',
    timestamp: '2024-01-26T09:15:00Z',
    user: 'Col. Rodriguez',
    baseId: 'base-2'
  },
  {
    id: 'activity-3',
    type: 'assignment',
    title: 'Equipment Assignment',
    description: '4 M1A2 Abrams assigned to Alpha Company',
    timestamp: '2024-01-24T16:45:00Z',
    user: 'Maj. Thompson',
    baseId: 'base-1'
  },
  {
    id: 'activity-4',
    type: 'expenditure',
    title: 'Ammunition Expended',
    description: '2000 rounds of 5.56mm NATO used in training',
    timestamp: '2024-01-23T11:20:00Z',
    user: 'Capt. Davis',
    baseId: 'base-1'
  }
];

export const dashboardMetrics: DashboardMetrics = {
  openingBalance: 125000,
  purchases: 15000,
  transfersIn: 8000,
  transfersOut: 12000,
  assigned: 25000,
  expended: 8500,
  closingBalance: 102500
};

export const alerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'warning',
    title: 'Low Stock Alert',
    message: 'HMMWV inventory below threshold at Camp Pendleton',
    assetId: 'asset-4',
    baseId: 'base-2',
    timestamp: '2024-01-26T08:00:00Z'
  },
  {
    id: 'alert-2',
    type: 'error',
    title: 'Maintenance Overdue',
    message: 'M4A1 Carbine maintenance overdue at Fort Liberty',
    assetId: 'asset-1',
    baseId: 'base-1',
    timestamp: '2024-01-25T12:00:00Z'
  },
  {
    id: 'alert-3',
    type: 'info',
    title: 'Transfer Complete',
    message: 'Ammunition transfer to Joint Base Lewis-McChord completed',
    baseId: 'base-3',
    timestamp: '2024-01-25T16:30:00Z'
  }
];