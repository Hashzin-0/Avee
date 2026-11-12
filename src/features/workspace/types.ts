import type { FarmInput } from '../farm-builder/domain';

export interface FlockLot {
  id: string;
  name: string;
  lineage: string;
  housingSystem: string;
  initialBirds: number;
  currentBirds: number;
  startDate: string;
  ageWeeks: number;
  status: 'active' | 'closed';
}

export interface FarmRecord {
  id: string;
  name: string;
  municipality: string;
  status: 'active' | 'archived';
  configuration: Partial<FarmInput>;
  lots: FlockLot[];
  createdAt: string;
}

export interface AdminProfile {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  organization: string;
}

export interface WorkspaceSettings {
  weightUnit: 'g' | 'kg';
  areaUnit: 'm2' | 'ha';
  notifications: boolean;
  compactTables: boolean;
  theme: 'dark' | 'light';
}

export interface WorkspaceData {
  farms: FarmRecord[];
  activeFarmId: string;
  activeLotId: string;
  profile: AdminProfile;
  settings: WorkspaceSettings;
  schemaVersion: 1;
}
