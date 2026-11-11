import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import * as cuentas from './controladores/cuentas.js';
import * as equipos from './controladores/equipos.js';
import * as reservas from './controladores/reservas.js';
import { administrador, privado, verificarCsrf } from './http/comun.js';

export function crearRutas() {
  const rutas = Router();
  const limitarLogin = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true,
    handler: (_req, res) => res.status(429).render('error', { titulo: 'Acceso temporalmente limitado', error: 'Demasiados intentos. Inténtalo en 15 minutos.' }) });
  rutas.get('/', (_req, res) => res.redirect(303, '/equipos'));
  rutas.get('/equipos', equipos.catalogo);
  rutas.get('/equipos/:id', equipos.ficha);
  rutas.get(['/registro', '/login'], cuentas.formularioCuenta);
  rutas.post('/registro', cuentas.procesarCuenta);
  rutas.post('/login', limitarLogin, cuentas.procesarCuenta);
  rutas.get('/perfil', privado, (_req, res) => res.render('perfil', { titulo: 'Mi perfil' }));
  rutas.post('/logout', privado, verificarCsrf, cuentas.salir);
  rutas.get('/reservas/nueva', privado, reservas.nueva);
  rutas.post('/reservas', privado, verificarCsrf, reservas.crear);
  rutas.get('/mis-reservas', privado, reservas.listado);
  rutas.post('/reservas/:id/cancelar', privado, verificarCsrf, reservas.cancelar);

  rutas.use('/admin', privado, administrador);
  rutas.get('/admin/equipos', (req, res) => equipos.inventario(req, res));
  rutas.post('/admin/equipos', verificarCsrf, equipos.altaEquipo);
  rutas.post('/admin/equipos/:id/estado', verificarCsrf, equipos.estadoEquipo);
  rutas.get('/admin/reservas', reservas.listado);
  rutas.post('/admin/reservas/:id/cancelar', verificarCsrf, reservas.cancelar);
  return rutas;
}
