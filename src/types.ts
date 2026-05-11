
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export type Theme = 'blue' | 'rust' | 'slate';

export interface Usuario {
  id: string;
  username: string;
  password?: string;
  role: Role;
  theme: Theme;
  dark_mode: boolean;
}

export interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  phone?: string;
}

export interface Campaña {
  id: string;
  nombre_campaña: string;
  cliente_id: string;
  fecha_inicio: string;
}

export interface Aviso {
  id: string;
  campaña_id: string;
  nombre: string;
  producto: string;
  tamano?: string;
  fecha_publicacion: string;
  edicion_id: string;
  numero_salida: number; // Posición dentro de la campaña
}

export interface Edición {
  id: string;
  numero: string;
  fecha: string;
}

export interface Feriado {
  id: string;
  fecha: string; // ISO format
  nombre?: string;
}

export type Screen = 'LOGIN' | 'DASHBOARD' | 'EDICIONES' | 'CLIENTES' | 'CAMPAÑAS' | 'CONFIG' | 'USUARIOS';

export const PRODUCTOS = [
  '2x5',
  '1x8',
  '2x8',
  '4x8',
  '2x17',
  '4x17',
  '4x34',
  '2x11',
  '4x5',
  '3x25',
  '4x11',
  'Necro Chica (1x8)',
  'Necro Grande (2x8)'
];
