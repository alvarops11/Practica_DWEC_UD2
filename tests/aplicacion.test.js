import { beforeEach, expect, test } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { crearApp } from '../src/app.js';
import { fechaLocal } from '../src/dominio/reservas.ts';

let app;
let cliente;
const clave = 'Practica123!';
const solicitud = () => ({ equipoId: '1', fecha: fechaLocal(), turno: 'manana' });

beforeEach(async () => {
  app = await crearApp({ entorno: 'test', secreto: 'secreto-local-para-pruebas-controladas' });
  cliente = request.agent(app);
});

async function entrar(email = 'ana@example.com') {
  const login = await cliente.post('/login').type('form').send({ email, password: clave }).expect(303);
  const perfil = await cliente.get('/perfil').expect(200);
  const csrf = perfil.text.match(/name="_csrf" value="([^"]+)"/)[1];
  return { csrf, cookie: login.headers['set-cookie'][0].split(';')[0] };
}

test('registro válido, correo único, hash bcrypt y rol ordinario', async () => {
  const datos = { nombre: 'Eva', email: 'EVA@example.com', password: clave, rol: 'admin' };
  await cliente.post('/registro').type('form').send(datos).expect(303);
  const usuario = app.locals.bd.usuarios.porEmail('eva@example.com');
  expect(usuario.rol).toBe('usuario');
  expect(await bcrypt.compare(clave, usuario.passwordHash)).toBe(true);
  await cliente.post('/registro').type('form').send(datos).expect(400);
});

test('el error de acceso es igual para correo desconocido o contraseña incorrecta', async () => {
  for (const email of ['ana@example.com', 'desconocido@example.com']) {
    const r = await cliente.post('/login').type('form').send({ email, password: 'incorrecta' }).expect(401);
    expect(r.text).toContain('Correo o contraseña incorrectos.');
  }
});

test('el visitante es redirigido al login', async () => {
  await cliente.get('/perfil').expect(303).expect('Location', '/login');
});

test('la sesión da acceso al perfil y el aviso se muestra una sola vez', async () => {
  await cliente.post('/login').type('form').send({ email: 'ana@example.com', password: clave }).expect(303);
  const perfil = await cliente.get('/perfil').expect(200);
  expect(perfil.text).toContain('Ana García');
  expect(perfil.text).toContain('Sesión iniciada.');
  expect((await cliente.get('/perfil')).text).not.toContain('Sesión iniciada.');
});

test('un usuario ordinario no puede administrar equipos', async () => {
  const { csrf } = await entrar();
  await cliente.get('/admin/reservas').expect(403);
  await cliente.post('/admin/equipos/1/estado').type('form').send({ _csrf: csrf, estado: 'fuera_de_servicio' }).expect(403);
});

test('reserva válida con el titular de la sesión y redirección al listado', async () => {
  const { csrf } = await entrar();
  await cliente.post('/reservas').type('form').send({ ...solicitud(), usuarioId: '3', _csrf: csrf }).expect(303).expect('Location', '/mis-reservas');
  expect(app.locals.bd.reservas.buscar(4).usuarioId).toBe(2);
  expect((await cliente.get('/mis-reservas')).text).toContain('Reserva creada.');
});

test('el equipo ocupado desaparece del formulario y repetir el POST da conflicto', async () => {
  const { csrf } = await entrar();
  const datos = { ...solicitud(), _csrf: csrf };
  await cliente.post('/reservas').type('form').send(datos).expect(303);
  const pagina = await cliente.get('/reservas/nueva').query({ fecha: datos.fecha, turno: datos.turno }).expect(200);
  expect(pagina.text).not.toContain('PC-001');
  const conflicto = await cliente.post('/reservas').type('form').send(datos).expect(409);
  expect(conflicto.text).toContain(datos.fecha);
  expect(conflicto.text).toContain('PORT-001');
});

test('impide cancelar una reserva ajena', async () => {
  const { csrf } = await entrar();
  await cliente.post('/reservas/2/cancelar').type('form').send({ _csrf: csrf }).expect(403);
  expect(app.locals.bd.reservas.buscar(2).estado).toBe('activa');
});

test('el administrador necesita un token válido para cambiar el estado', async () => {
  await entrar('admin@example.com');
  await cliente.post('/admin/equipos/1/estado').type('form').send({ estado: 'fuera_de_servicio' }).expect(403);
  expect(app.locals.bd.equipos.buscar(1).estado).toBe('operativo');
});

test('logout exige CSRF, retira la cookie e invalida la sesión anterior', async () => {
  const { csrf, cookie } = await entrar();
  await cliente.post('/logout').expect(403);
  const salida = await cliente.post('/logout').type('form').send({ _csrf: csrf }).expect(303);
  expect(salida.headers['set-cookie'][0]).toMatch(/^sesion=;/);
  await request(app).get('/perfil').set('Cookie', cookie).expect(303);
});

test('cancelar conserva el registro y libera la franja para otro usuario', async () => {
  const { csrf } = await entrar();
  await cliente.post('/reservas/1/cancelar').type('form').send({ _csrf: csrf }).expect(303);
  const reserva = app.locals.bd.reservas.buscar(1);
  expect(reserva.estado).toBe('cancelada');
  cliente = request.agent(app);
  const luis = await entrar('luis@example.com');
  await cliente.post('/reservas').type('form').send({ equipoId: '1', fecha: reserva.fecha, turno: reserva.turno, _csrf: luis.csrf }).expect(303);
});

test('valida fechas, turno, identificador y estado en el servidor', async () => {
  const { csrf } = await entrar();
  for (const cambio of [{ fecha: '2000-01-01' }, { fecha: '2099-02-30' }, { turno: 'noche' }, { equipoId: '3' }, { equipoId: '1abc' }]) {
    await cliente.post('/reservas').type('form').send({ ...solicitud(), ...cambio, _csrf: csrf }).expect(400);
  }
  await cliente.post('/reservas').type('form').send({ ...solicitud(), equipoId: '999', _csrf: csrf }).expect(404);
});

test('el administrador añade equipos, cambia su estado y cancela reservas', async () => {
  const { csrf } = await entrar('admin@example.com');
  await cliente.get('/admin/equipos').expect(200);
  await cliente.post('/admin/equipos').type('form').send({ codigo: 'LAB-1', nombre: 'Laboratorio', tipo: 'portatil', estado: 'operativo', _csrf: csrf }).expect(303);
  await cliente.post('/admin/equipos/4/estado').type('form').send({ estado: 'fuera_de_servicio', _csrf: csrf }).expect(303);
  expect((await cliente.get('/equipos/4')).text).toContain('Fuera de servicio');
  expect((await cliente.get('/admin/reservas')).text).toContain('Ana García');
  await cliente.post('/admin/reservas/1/cancelar').type('form').send({ _csrf: csrf }).expect(303);
});

test('el catálogo recuerda la preferencia y permite volver a todos los tipos', async () => {
  await cliente.get('/equipos?tipo=portatil&operativos=true').expect(200);
  expect((await cliente.get('/equipos')).text).not.toContain('PC-001');
  expect((await cliente.get('/equipos?tipo=')).text).toContain('PC-001');
  await cliente.get('/equipos/999').expect(404);
});
