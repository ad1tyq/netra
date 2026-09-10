// lib/offline/db.ts
import Dexie, { Table } from 'dexie';

export interface Patient {
  id: string;
  name: string;
  phone?: string;
  rbs?: number;
  // other demographics
}

export interface Screening {
  id: string;
  patientId: string;
  imageUrl?: string;
  status: 'PENDING' | 'QUEUED' | 'PROCESSED' | 'FAILED';
  grade?: number;
  lesions?: Array<{ x: number; y: number; w: number; h: number }>; // bounding boxes
}

export interface NotificationQueue {
  id: string;
  screeningId: string;
  channel: string;
  payload: any;
  status: string;
}

export class NetraDB extends Dexie {
  patients!: Table<Patient, string>;
  screenings!: Table<Screening, string>;
  notifications!: Table<NotificationQueue, string>;

  constructor() {
    super('NetraDB');
    this.version(1).stores({
      patients: 'id, name, phone',
      screenings: 'id, patientId, status',
      notifications: 'id, screeningId, channel, status',
    });
  }
}

export const db = new NetraDB();
