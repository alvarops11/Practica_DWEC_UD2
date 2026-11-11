import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'node:url';
import { crearRepositorios } from './repositorios/memoria.js';
import { ErrorDominio, ServicioReservas } from './dominio/reservas.ts';
import { contexto, manejarError } from './http/comun.js';
import { crearRutas } from './rutas.js';

export async function crearApp(config) {
  const app = express();
  app.disable('x-powered-by');
  app.set('view engine', 'ejs');
  app.set('views', fileURLToPath(new URL('../views/', import.meta.url)));
  app.use('/public', express.static(fileURLToPath(new URL('../public/', import.meta.url))));
  app.locals.bd = await crearRepositorios();
  app.locals.servicio = new ServicioReservas(app.locals.bd.reservas);
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));
  app.use(session({
    name: 'sesion', secret: config.secreto, resave: false, saveUninitialized: false,
    cookie: { httpOnly: true, secure: config.entorno === 'production', sameSite: 'lax', maxAge: 3600000 }
  }));
  app.use(contexto);
  app.use(crearRutas());
  app.use(() => { throw new ErrorDominio(404, 'Página inexistente.'); });
  app.use(manejarError);
  return app;
}
