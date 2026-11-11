export function leerConfiguracion(env) {
  const puerto = Number(env.PORT);
  if (!/^\d+$/.test(env.PORT) || !Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error('PORT debe ser un entero entre 1 y 65535.');
  }
  if (!['development', 'production', 'test'].includes(env.NODE_ENV)) {
    throw new Error('NODE_ENV debe ser development, production o test.');
  }
  if (!env.SESSION_SECRET || env.SESSION_SECRET.trim().length < 32) {
    throw new Error('SESSION_SECRET debe tener al menos 32 caracteres.');
  }
  return { puerto, entorno: env.NODE_ENV, secreto: env.SESSION_SECRET };
}
