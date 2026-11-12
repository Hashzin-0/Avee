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
        name: 'Lote de planejamento · dados iniciais',
        lineage: 'Hy-Line Brown',
        housingSystem: 'Gaiolas convencionais',
        initialBirds: 5000,
        currentBirds: 5000,
        startDate: '2026-11-12',
        ageWeeks: 24,
        status: 'active',
      }],
      createdAt: '2026-11-12T12:00:00.000Z',
    }],
    activeFarmId: farmId,
    activeLotId: lotId,
    profile: { fullName: 'Administrador', email: '', phone: '', role: 'Administrador', organization: '' },
    settings: { weightUnit: 'g', areaUnit: 'm2', notifications: true, compactTables: false, theme: 'dark' },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const farmConfigurationKeys = new Set(['houseLengthM', 'houseWidthM', 'sideHeightM', 'ridgeHeightM', 'targetBirds', 'usableAreaPercent', 'areaPerBirdCm2', 'birdsPerNipple', 'feederCmPerBird', 'fanCapacityM3h', 'airflowM3hPerBird', 'cageCapacity', 'installedNipples', 'installedFeederLengthM', 'installedFanCount', 'installedCageModules']);
const allowedLineages = new Set(['Hy-Line Brown', 'Lohmann Brown-Classic', 'NOVOgen Brown', 'Hy-Line W-36', 'Outra / não definida']);
const allowedHousingSystems = new Set(['Gaiolas convencionais', 'Gaiolas enriquecidas', 'Sistema de piso', 'Aviário / multinível', 'Free-range']);

export function parseWorkspaceData(raw: string): WorkspaceData | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.farms)) return null;
    const farms = value.farms.filter((farm): farm is WorkspaceData['farms'][number] => {
      if (!isRecord(farm) || !isRecord(farm.configuration) || !Array.isArray(farm.lots)) return false;
      if (typeof farm.id !== 'string' || typeof farm.name !== 'string' || typeof farm.municipality !== 'string') return false;
      if (farm.status !== 'active' && farm.status !== 'archived') return false;
      if (typeof farm.createdAt !== 'string') return false;
      if (!Object.entries(farm.configuration).every(([key, value]) => farmConfigurationKeys.has(key) && typeof value === 'number' && Number.isFinite(value) && value >= 0)) return false;
      return farm.lots.every((lot) => isRecord(lot)
        && typeof lot.id === 'string'
        && typeof lot.name === 'string'
        && typeof lot.lineage === 'string' && allowedLineages.has(lot.lineage)
        && typeof lot.housingSystem === 'string' && allowedHousingSystems.has(lot.housingSystem)
        && typeof lot.startDate === 'string' && Number.isFinite(Date.parse(lot.startDate))
        && Number.isSafeInteger(lot.initialBirds) && Number(lot.initialBirds) >= 0
        && Number.isSafeInteger(lot.currentBirds) && Number(lot.currentBirds) >= 0
        && typeof lot.ageWeeks === 'number' && Number.isFinite(lot.ageWeeks) && lot.ageWeeks >= 0
        && (lot.status === 'active' || lot.status === 'closed'));
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
        theme: settings.theme === 'light' ? 'light' : 'dark',
      },
    };
  } catch {
    return null;
  }
}
