import type { WeighingRecord } from '../types';

export type ScaleTransport = 'usb' | 'serial' | 'bluetooth' | 'wifi' | 'api';
export type AdapterConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ScaleDeviceDescriptor {
  manufacturer: string;
  model: string;
  transport: ScaleTransport;
  protocolVersion: string;
  verifiedWithHardware: boolean;
}

export interface ScaleReading {
  weightGrams: number;
  capturedAt: string;
  stable: boolean;
  deviceSequence?: string;
}

/**
 * Contract for future hardware adapters. Implementations must be based on the
 * manufacturer's documented protocol and validated with the physical scale.
 */
export interface ScaleAdapter {
  readonly descriptor: ScaleDeviceDescriptor;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getConnectionState(): AdapterConnectionState;
  readStableWeight(signal?: AbortSignal): Promise<ScaleReading>;
  toWeighingRecord(reading: ScaleReading, sessionId: string): WeighingRecord;
}
