import type { WorkspaceData } from './types';

export const WORKSPACE_STORAGE_KEY = 'granja.workspace.v1';

export function createInitialWorkspace(): WorkspaceData {
  const farmId = 'farm-default';
  const lotId = 'lot-planning';
  return {
    schemaVersion: 1,
    farms: [{
      id: farmId,
      name: 'Granja Fazenda',
      municipality: '',
      status: 'active',
      configuration: {
        houseLengthM: 100,
        houseWidthM: 20,
        sideHeightM: 3,
        ridgeHeightM: 4.5,
        targetBirds: 5000,
        usableAreaPercent: 80,
      },
      lots: [{
        id: lotId,
        name: 'Lote de planejamento',
        lineage: 'Hy-Line Brown',
        housingSystem: 'Gaiolas convencionais',
        initialBirds: 5000,
        currentBirds: 5000,
        startDate: new Date().toISOString().slice(0, 10),
        ageWeeks: 24,
        status: 'active',
      }],
      createdAt: new Date().toISOString(),
    }],
    activeFarmId: farmId,
    activeLotId: lotId,
    profile: { fullName: 'Administrador', email: '', phone: '', role: 'Administrador', organization: '' },
    settings: { weightUnit: 'g', areaUnit: 'm2', notifications: true, compactTables: false },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseWorkspaceData(raw: string): WorkspaceData | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.farms)) return null;
    const farms = value.farms.filter((farm): farm is WorkspaceData['farms'][number] => {
      if (!isRecord(farm)) return false;
      return typeof farm.id === 'string' && typeof farm.name === 'string'
        && isRecord(farm.configuration) && Array.isArray(farm.lots)
        && farm.lots.every((lot) => isRecord(lot) && typeof lot.id === 'string' && typeof lot.name === 'string');
    });
    if (farms.length === 0) return null;
    const profile = isRecord(value.profile) ? value.profile : {};
    const settings = isRecord(value.settings) ? value.settings : {};
    const activeFarmId = farms.some((farm) => farm.id === value.activeFarmId) ? String(value.activeFarmId) : farms[0].id;
    const activeFarm = farms.find((farm) => farm.id === activeFarmId)!;
    const activeLotId = activeFarm.lots.some((lot) => lot.id === value.activeLotId) ? String(value.activeLotId) : (activeFarm.lots[0]?.id ?? '');
    return {
      schemaVersion: 1,
      farms,
      activeFarmId,
      activeLotId,
      profile: {
        fullName: typeof profile.fullName === 'string' ? profile.fullName : 'Administrador',
        email: typeof profile.email === 'string' ? profile.email : '',
        phone: typeof profile.phone === 'string' ? profile.phone : '',
        role: typeof profile.role === 'string' ? profile.role : 'Administrador',
        organization: typeof profile.organization === 'string' ? profile.organization : '',
      },
      settings: {
        weightUnit: settings.weightUnit === 'kg' ? 'kg' : 'g',
        areaUnit: settings.areaUnit === 'ha' ? 'ha' : 'm2',
        notifications: settings.notifications !== false,
        compactTables: settings.compactTables === true,
      },
    };
  } catch {
    return null;
  }
}
