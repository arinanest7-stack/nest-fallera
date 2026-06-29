export interface Traje {
  id: number;
  nombre: string;
  precio: number;
}

export interface Cita {
  id: number;
  cliente_id: number;
  titulo: string;
  fecha_hora: string;
  cliente_nombre?: string;
  cliente_telefono?: string;
}

export interface Cliente {
  id: number;
  nombre_apellido: string;
  telefono: string;
  pagado: number;
  trajes: Traje[];
  citas: Cita[];
}

export interface TrajeDistribucion {
  nombre: string;
  cantidad: number;
}

export interface Deudor {
  id: number;
  nombre_apellido: string;
  telefono: string;
  pagado: number;
  precio_total: number;
  falta_pagar: number;
}

export interface DashboardData {
  totalClientes: number;
  cobradas: number;
  esperado: number;
  pendiente: number;
  distribucionTrajes: TrajeDistribucion[];
  deudores: Deudor[];
  proximasCitas: Cita[];
}
