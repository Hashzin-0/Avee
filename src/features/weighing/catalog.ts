import type { ScaleCatalogEntry } from './types';

// Catalog structure only. Models are intentionally not listed as supported until
// their protocol has been documented and verified with the physical device.
export const scaleCatalog: ScaleCatalogEntry[] = [];

export const connectionOptions = [
  { id: 'usb', label: 'USB' },
  { id: 'serial', label: 'RS232 / Serial' },
  { id: 'bluetooth', label: 'Bluetooth' },
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'api', label: 'API' },
] as const;
