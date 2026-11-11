import bcrypt from 'bcrypt';
import { ErrorDominio } from '../dominio/reservas.ts';

export const tipos = ['portatil', 'sobremesa'];
export const estados = ['operativo', 'fuera_de_servicio'];

export async function registrar(usuarios, nombre, email, password) {
  if (nombre.length < 2 || nombre.length > 80) throw new ErrorDominio(400, 'El nombre debe tener entre 2 y 80 caracteres.');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErrorDominio(400, 'Introduce un correo válido.');
  if (password.length < 8 || Buffer.byteLength(password) > 72) throw new ErrorDominio(400, 'Usa al menos 8 caracteres y hasta 72 bytes de contraseña.');
  const passwordHash = await bcrypt.hash(password, 10);
  // Comprobamos tras el await para que dos registros simultáneos no dupliquen el correo.
  if (usuarios.porEmail(email)) throw new ErrorDominio(400, 'No se ha podido registrar ese correo.');
  usuarios.crear({ nombre, email, passwordHash, rol: 'usuario' });
}

export async function autenticar(usuarios, email, password) {
  const usuario = usuarios.porEmail(email);
  // Comparamos también si el correo es desconocido para seguir el mismo flujo.
  const coincide = await bcrypt.compare(password, (usuario ?? usuarios.buscar(1)).passwordHash);
  if (!usuario || !coincide || Buffer.byteLength(password) > 72) throw new ErrorDominio(401, 'Correo o contraseña incorrectos.');
  return usuario;
}

export function agregarEquipo(equipos, datos) {
  if (!datos.codigo || datos.codigo.length > 30 || !datos.nombre || datos.nombre.length > 80 ||
      !tipos.includes(datos.tipo) || !estados.includes(datos.estado)) {
    throw new ErrorDominio(400, 'Revisa el código, el nombre, el tipo y el estado del equipo.');
  }
  if (equipos.listar().some(e => e.codigo === datos.codigo)) throw new ErrorDominio(400, 'Ese código ya está en uso.');
  equipos.crear(datos);
}

export function cambiarEstado(equipos, id, estado) {
  if (!equipos.buscar(id)) throw new ErrorDominio(404, 'Equipo inexistente.');
  if (!estados.includes(estado)) throw new ErrorDominio(400, 'Estado incorrecto.');
  equipos.cambiarEstado(id, estado);
}
