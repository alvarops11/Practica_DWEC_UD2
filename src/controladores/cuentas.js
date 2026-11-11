import { registrar, autenticar } from '../servicios/gestion.js';
import { ErrorDominio } from '../dominio/reservas.ts';
import { confirmar, texto } from '../http/comun.js';

export function formularioCuenta(req, res) {
  const registro = req.path === '/registro';
  res.render('cuenta', { titulo: registro ? 'Crear cuenta' : 'Iniciar sesión', registro, nombre: '', email: '' });
}

export async function procesarCuenta(req, res) {
  const registro = req.path === '/registro';
  const nombre = texto(req.body?.nombre);
  const email = texto(req.body?.email).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const usuarios = req.app.locals.bd.usuarios;
  try {
    if (registro) {
      await registrar(usuarios, nombre, email, password);
      return confirmar(req, res, '/login', 'Cuenta creada. Ya puedes iniciar sesión.');
    }
    const usuario = await autenticar(usuarios, email, password);
    await new Promise((resolve, reject) => req.session.regenerate(err => err ? reject(err) : resolve()));
    req.session.usuarioId = usuario.id;
    confirmar(req, res, '/perfil', 'Sesión iniciada.');
  } catch (err) {
    if (!(err instanceof ErrorDominio)) throw err;
    res.status(err.estado).render('cuenta', { titulo: registro ? 'Crear cuenta' : 'Iniciar sesión', registro, nombre, email, error: err.message });
  }
}

export function salir(req, res, next) {
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie('sesion', { path: '/' });
    res.redirect(303, '/login');
  });
}
