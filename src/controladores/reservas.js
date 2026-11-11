import { ErrorDominio, fechaLocal, obtenerEquiposDisponibles } from '../dominio/reservas.ts';
import { confirmar, identificador, texto } from '../http/comun.js';

function formulario(req, res, datos, fallo) {
  const { equipos, reservas } = req.app.locals.bd;
  let disponibles = [];
  try {
    disponibles = obtenerEquiposDisponibles(equipos.listar(), reservas.listar(), datos.fecha, datos.turno);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) throw err;
    fallo ??= err;
  }
  res.status(fallo?.estado ?? 200).render('nueva', {
    titulo: 'Reservar equipo', hoy: fechaLocal(), datos, disponibles, error: fallo?.message ?? ''
  });
}

export function nueva(req, res) {
  formulario(req, res, { fecha: texto(req.query.fecha ?? fechaLocal()), turno: texto(req.query.turno ?? 'manana'), equipoId: '' });
}

export function crear(req, res) {
  const datos = { fecha: texto(req.body?.fecha), turno: texto(req.body?.turno), equipoId: texto(req.body?.equipoId) };
  try {
    const equipoId = identificador(datos.equipoId);
    req.app.locals.servicio.crear({ ...datos, equipoId }, req.app.locals.bd.equipos.listar(), res.locals.usuario.id);
    confirmar(req, res, '/mis-reservas', 'Reserva creada.');
  } catch (err) {
    if (!(err instanceof ErrorDominio)) throw err;
    formulario(req, res, datos, err);
  }
}

export function listado(req, res) {
  const admin = req.path === '/admin/reservas';
  const usuario = res.locals.usuario;
  const { equipos, usuarios, reservas } = req.app.locals.bd;
  const filas = reservas.listar().filter(r => admin || r.usuarioId === usuario.id).map(r => ({
    ...r, equipo: equipos.buscar(r.equipoId).nombre, titular: usuarios.buscar(r.usuarioId).nombre,
    cancelable: r.estado === 'activa' && (admin || r.fecha >= fechaLocal())
  }));
  res.render('reservas', { titulo: admin ? 'Todas las reservas' : 'Mis reservas', filas, admin });
}

export function cancelar(req, res) {
  const admin = req.path.startsWith('/admin/');
  req.app.locals.servicio.cancelar(identificador(req.params.id), res.locals.usuario, admin);
  confirmar(req, res, admin ? '/admin/reservas' : '/mis-reservas', 'Reserva cancelada.');
}
