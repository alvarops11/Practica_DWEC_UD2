export type Rol = 'usuario' | 'admin';
export type Turno = 'manana' | 'tarde';
export type EstadoEquipo = 'operativo' | 'fuera_de_servicio';
export type EstadoReserva = 'activa' | 'cancelada';

export interface Equipo {
  id: number;
  nombre: string;
  codigo: string;
  tipo: 'portatil' | 'sobremesa';
  estado: EstadoEquipo;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: Rol;
}

export interface Reserva {
  id: number;
  equipoId: number;
  usuarioId: number;
  fecha: string;
  turno: Turno;
  estado: EstadoReserva;
}

export class ErrorDominio extends Error {
  estado: number;

  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.estado = estado;
  }
}

export interface RepositorioReservas {
  listar(): Reserva[];
  buscar(id: number): Reserva | undefined;
  crear(datos: Omit<Reserva, 'id'>): Reserva;
  cancelar(id: number): void;
}

export class ReservasEnMemoria implements RepositorioReservas {
  private reservas = new Map<number, Reserva>();
  private siguienteId = 1;

  listar(): Reserva[] {
    return Array.from(this.reservas.values());
  }

  buscar(id: number): Reserva | undefined {
    return this.reservas.get(id);
  }

  crear(datos: Omit<Reserva, 'id'>): Reserva {
    const reserva = { ...datos, id: this.siguienteId++ };
    this.reservas.set(reserva.id, reserva);
    return reserva;
  }

  cancelar(id: number): void {
    const reserva = this.buscar(id);
    if (reserva) reserva.estado = 'cancelada';
  }
}

// Usamos la fecha local del centro, también cuando UTC ya ha cambiado de día.
export function fechaLocal(dia: Date = new Date()): string {
  const mes = String(dia.getMonth() + 1).padStart(2, '0');
  return [dia.getFullYear(), mes, String(dia.getDate()).padStart(2, '0')].join('-');
}

export function validarFranja(fecha: string, turno: string): void {
  const dia = new Date(fecha + 'T12:00:00');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || fechaLocal(dia) !== fecha || fecha < fechaLocal()) {
    throw new ErrorDominio(400, 'Elige una fecha válida de hoy en adelante.');
  }
  if (turno !== 'manana' && turno !== 'tarde') {
    throw new ErrorDominio(400, 'Elige mañana o tarde.');
  }
}

interface Solicitud {
  equipoId: number;
  fecha: string;
  turno: Turno;
}

export function validarReserva(datos: Solicitud): void {
  validarFranja(datos.fecha, datos.turno);
  if (!Number.isSafeInteger(datos.equipoId) || datos.equipoId < 1) {
    throw new ErrorDominio(400, 'Selecciona un equipo válido.');
  }
}

export function estaReservado(equipoId: number, fecha: string, turno: Turno, reservas: Reserva[]): boolean {
  return reservas.some(r => r.equipoId === equipoId && r.fecha === fecha &&
    r.turno === turno && r.estado === 'activa');
}

export function obtenerEquiposDisponibles(equipos: Equipo[], reservas: Reserva[], fecha: string, turno: Turno): Equipo[] {
  validarFranja(fecha, turno);
  return equipos.filter(e => e.estado === 'operativo' && !estaReservado(e.id, fecha, turno, reservas));
}

export class ServicioReservas {
  private repositorio: RepositorioReservas;

  constructor(repositorio: RepositorioReservas) {
    this.repositorio = repositorio;
  }

  crear(datos: Solicitud, equipos: Equipo[], usuarioId: number): Reserva {
    validarReserva(datos);
    const equipo = equipos.find(e => e.id === datos.equipoId);
    if (!equipo) throw new ErrorDominio(404, 'Equipo inexistente.');
    if (equipo.estado !== 'operativo') throw new ErrorDominio(400, 'El equipo está fuera de servicio.');
    if (estaReservado(equipo.id, datos.fecha, datos.turno, this.repositorio.listar())) {
      throw new ErrorDominio(409, 'El equipo ya está reservado en ese turno.');
    }
    // En este almacén en memoria la comprobación y el alta son síncronas.
    return this.repositorio.crear({ ...datos, usuarioId, estado: 'activa' });
  }

  cancelar(id: number, usuario: Usuario, comoAdmin: boolean): void {
    const reserva = this.repositorio.buscar(id);
    if (!reserva) throw new ErrorDominio(404, 'Reserva inexistente.');
    const administra = comoAdmin && usuario.rol === 'admin';
    if (!administra && reserva.usuarioId !== usuario.id) throw new ErrorDominio(403, 'Esta reserva pertenece a otro usuario.');
    if (reserva.estado !== 'activa') throw new ErrorDominio(400, 'La reserva ya está cancelada.');
    if (!administra && reserva.fecha < fechaLocal()) throw new ErrorDominio(400, 'La fecha de la reserva ya ha pasado.');
    this.repositorio.cancelar(id);
  }
}
