import { randomBytes } from 'node:crypto';
import { ErrorDominio } from '../dominio/reservas.ts';

export const texto = valor => typeof valor === 'string' ? valor.trim() : '';

export function identificador(valor) {
  const id = Number(valor);
  if (typeof valor !== 'string' || !/^[1-9]\d*$/.test(valor) || !Number.isSafeInteger(id)) {
    throw new ErrorDominio(400, 'Identificador incorrecto.');
  }
  return id;
}

export function contexto(req, res, next) {
  const usuario = req.app.locals.bd.usuarios.buscar(req.session.usuarioId);
  res.locals.usuario = usuario;
  res.locals.csrf = '';
  if (usuario) {
    req.session.csrf ??= randomBytes(32).toString('hex');
    res.locals.csrf = req.session.csrf;
  }
  res.locals.error = '';
  res.locals.aviso = req.session.aviso;
  delete req.session.aviso;
  next();
}

export function privado(req, res, next) {
  if (!res.locals.usuario) return res.redirect(303, '/login');
  next();
}

export function administrador(req, res, next) {
  if (res.locals.usuario.rol !== 'admin') throw new ErrorDominio(403, 'Se necesitan permisos de administrador.');
  next();
}

export function verificarCsrf(req, res, next) {
  if (!req.session.csrf || req.body?._csrf !== req.session.csrf) throw new ErrorDominio(403, 'Formulario caducado o no válido.');
  next();
}

export function confirmar(req, res, ruta, mensaje) {
  req.session.aviso = mensaje;
  res.redirect(303, ruta);
}

export function manejarError(error, req, res, next) {
  if (res.headersSent) return next(error);
  const estado = error instanceof ErrorDominio ? error.estado : (error.status === 413 ? 413 : 500);
  const mensaje = error instanceof ErrorDominio ? error.message :
    (estado === 413 ? 'Formulario demasiado grande.' : 'No se ha podido completar la operación.');
  res.status(estado).render('error', { titulo: 'No se pudo completar', error: mensaje, aviso: '', usuario: null });
}
