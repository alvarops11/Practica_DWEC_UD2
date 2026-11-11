import { agregarEquipo, cambiarEstado, estados, tipos } from '../servicios/gestion.js';
import { ErrorDominio } from '../dominio/reservas.ts';
import { confirmar, identificador, texto } from '../http/comun.js';

export function catalogo(req, res) {
  // Solo se aceptan las dos preferencias conocidas, incluso si la cookie se ha editado.
  const preferencia = (req.headers.cookie ?? '').split(';').map(c => c.trim()).find(c => c.startsWith('tipo='));
  const guardado = preferencia?.slice(5);
  const tipo = req.query.tipo ?? (tipos.includes(guardado) ? guardado : '');
  const operativos = req.query.operativos ?? '';
  if (!['', ...tipos].includes(tipo) || !['', 'true', 'false'].includes(operativos)) throw new ErrorDominio(400, 'Filtro incorrecto.');
  if (req.query.tipo !== undefined) {
    if (tipo) res.cookie('tipo', tipo, { maxAge: 30 * 86400000, sameSite: 'lax', httpOnly: true });
    else res.clearCookie('tipo');
  }
  const equipos = req.app.locals.bd.equipos.listar().filter(e =>
    (!tipo || e.tipo === tipo) && (!operativos || (e.estado === 'operativo') === (operativos === 'true')));
  res.render('catalogo', { titulo: 'Catálogo de equipos', equipos, tipo, operativos });
}

export function ficha(req, res) {
  const equipo = req.app.locals.bd.equipos.buscar(identificador(req.params.id));
  if (!equipo) throw new ErrorDominio(404, 'Equipo inexistente.');
  res.render('ficha', { titulo: equipo.nombre, equipo });
}

export function inventario(req, res, datos = {}) {
  res.render('inventario', { titulo: 'Administrar equipos', equipos: req.app.locals.bd.equipos.listar(), datos, estados, tipos });
}

export function altaEquipo(req, res) {
  const datos = { codigo: texto(req.body?.codigo).toUpperCase(), nombre: texto(req.body?.nombre),
    tipo: texto(req.body?.tipo), estado: texto(req.body?.estado) };
  try {
    agregarEquipo(req.app.locals.bd.equipos, datos);
    confirmar(req, res, '/admin/equipos', 'Equipo añadido.');
  } catch (err) {
    if (!(err instanceof ErrorDominio)) throw err;
    res.status(err.estado);
    res.locals.error = err.message;
    inventario(req, res, datos);
  }
}

export function estadoEquipo(req, res) {
  cambiarEstado(req.app.locals.bd.equipos, identificador(req.params.id), texto(req.body?.estado));
  confirmar(req, res, '/admin/equipos', 'Estado actualizado.');
}
