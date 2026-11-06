export type IdentificationMode = 'ring' | 'sampling';
export type WeighingInputMode = 'connected' | 'manual';

export interface ScaleCatalogEntry {
  id: string;
  manufacturer: string;
  model: string;
  transports: Array<'usb' | 'serial' | 'bluetooth' | 'wifi' | 'api'>;
  protocolStatus: 'documented' | 'needs-validation';
  notes: string;
}

export interface WeighingRecord {
  id: string;
  sessionId: string;
  timestamp: string;
  weightGrams: number;
  identificationMode: IdentificationMode;
  ringId?: string;
  sampleNumber?: number;
  source: WeighingInputMode;
  scaleId?: string;
}
