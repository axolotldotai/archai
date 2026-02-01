
export interface Wall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Room {
  x: number;
  y: number;
  name: string;
}

export interface Door {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Window {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Furniture {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

export interface FloorplanData {
  walls: Wall[];
  rooms: Room[];
  doors: Door[];
  windows?: Window[];
  furniture?: Furniture[];
  metadata: {
    scale: string;
    description: string;
  };
}

export type Status = 'idle' | 'loading' | 'success' | 'error';
