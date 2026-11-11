import bcrypt from 'bcrypt';
import { ReservasEnMemoria, fechaLocal } from '../dominio/reservas.ts';

export async function crearRepositorios() {
  const equipos = [
    { id: 1, codigo: 'PC-001', nombre: 'Ordenador aula 1', tipo: 'sobremesa', estado: 'operativo' },
    { id: 2, codigo: 'PORT-001', nombre: 'Portátil Lenovo', tipo: 'portatil', estado: 'operativo' },
    { id: 3, codigo: 'PC-002', nombre: 'Ordenador aula 2', tipo: 'sobremesa', estado: 'fuera_de_servicio' }
  ];
  const passwordHash = await bcrypt.hash('Practica123!', 10);
  const usuarios = [
    { id: 1, nombre: 'Administrador', email: 'admin@example.com', rol: 'admin', passwordHash },
    { id: 2, nombre: 'Ana García', email: 'ana@example.com', rol: 'usuario', passwordHash },
    { id: 3, nombre: 'Luis Ruiz', email: 'luis@example.com', rol: 'usuario', passwordHash }
  ];
  const reservas = new ReservasEnMemoria();
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const fecha = fechaLocal(manana);
  reservas.crear({ equipoId: 1, usuarioId: 2, fecha, turno: 'manana', estado: 'activa' });
  reservas.crear({ equipoId: 2, usuarioId: 3, fecha, turno: 'tarde', estado: 'activa' });
  reservas.crear({ equipoId: 1, usuarioId: 3, fecha, turno: 'tarde', estado: 'cancelada' });

  return {
    equipos: {
      listar: () => equipos.slice(),
      buscar: id => equipos.find(e => e.id === id),
      crear: datos => equipos.push({ ...datos, id: equipos.length + 1 }),
      cambiarEstado(id, estado) { this.buscar(id).estado = estado; }
    },
    usuarios: {
      buscar: id => usuarios.find(u => u.id === id),
      porEmail: email => usuarios.find(u => u.email === email),
      crear: datos => usuarios.push({ ...datos, id: usuarios.length + 1 })
    },
    reservas
  };
}
