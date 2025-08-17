export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Commander' | 'Logistics Officer';
  base?: string;
  avatar?: string;
}

export interface Base {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  commander: string;
  assets: AssetSummary;
}

export interface AssetSummary {
  weapons: number;
  vehicles: number;
  ammunition: number;
}

export interface Asset {
  id: string;
  name: string;
  type: 'Weapon' | 'Vehicle' | 'Ammunition';
  category: string;
  condition: 'Available' | 'Under Repair' | 'Expended';
  quantity: number;
  baseId: string;
  serialNumber?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  assignedTo?: string;
  threshold?: number;
}

export interface Purchase {
  id: string;
  date: string;
  assetType: string;
  assetName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  baseId: string;
  status: 'Pending' | 'Approved' | 'Received' | 'Cancelled';
  requestedBy: string;
}

export interface Transfer {
  id: string;
  date: string;
  assetId: string;
  assetName: string;
  quantity: number;
  fromBaseId: string;
  toBaseId: string;
  status: 'Pending' | 'In Transit' | 'Completed' | 'Cancelled';
  requestedBy: string;
  approvedBy?: string;
  reason: string;
}

export interface Assignment {
  id: string;
  date: string;
  assetId: string;
  assetName: string;
  quantity: number;
  assignedTo: string;
  baseId: string;
  purpose: string;
  status: 'Assigned' | 'Expended' | 'Returned';
  assignedBy: string;
  expectedReturn?: string;
}

export interface Activity {
  id: string;
  type: 'purchase' | 'transfer' | 'assignment' | 'expenditure';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  baseId?: string;
}

export interface DashboardMetrics {
  openingBalance: number;
  purchases: number;
  transfersIn: number;
  transfersOut: number;
  assigned: number;
  expended: number;
  closingBalance: number;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  assetId?: string;
  baseId?: string;
  timestamp: string;
}