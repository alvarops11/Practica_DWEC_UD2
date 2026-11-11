# Flujo de reservas

Fecha del cambio: 11 de noviembre de 2026.

## Responsabilidad de cada archivo

| Archivo o carpeta | Qué hace |
| --- | --- |
| `src/server.js`, `src/config.js` | Validan la configuración y arrancan el servidor. |
| `src/app.js`, `src/rutas.js` | Construyen la aplicación, asocian URL y controladores y ordenan las comprobaciones de acceso. |
| `src/http/comun.js` | Carga el usuario desde la sesión, verifica autenticación, rol y token, gestiona confirmaciones y responde a errores. |
| `src/controladores/` | Lee campos, convierte identificadores, llama al servicio y decide qué página mostrar. |
| `src/servicios/gestion.js` | Registro, acceso y validación de cambios en el inventario. |
| `src/dominio/reservas.ts` | Define los tipos, las reglas de disponibilidad y cancelación, el contrato del repositorio y su implementación con Map. El servicio recibe el repositorio en su constructor. |
| `src/repositorios/memoria.js` | Inicializa las tres colecciones y ofrece métodos para buscar, crear y actualizar equipos y usuarios. |
| `views/`, `public/estilos.css` | Presentan los modelos de vista con EJS. Se reutilizan cabecera, cierre, token y opciones de estado. |
| `tests/aplicacion.test.js` | Prueba las rutas con Vitest y Supertest, incluidas operaciones rechazadas y su efecto sobre los datos. |

## Seguir una reserva desde el formulario

1. En «Reservar», el usuario elige fecha y turno. El navegador envía esos dos valores mediante GET.
2. El controlador prepara el modelo de vista con los valores elegidos, la fecha mínima, los equipos disponibles y un posible error. El servicio usa `filter` para seleccionar equipos operativos. Para cada uno, `some` comprueba si hay una reserva activa en esa franja.
3. Al confirmar, el navegador envía el equipo, la fecha, el turno y el token. El middleware comprueba la sesión y el token. El controlador convierte el ID a entero y obtiene el titular de la sesión.
4. El servicio valida la fecha real del calendario y el turno, usa `find` para buscar el equipo y vuelve a comprobar la ocupación. Así resuelve el caso de dos personas que abren el mismo formulario. La comprobación y la escritura suceden seguidas, sin esperas intermedias, en este proceso de Node.
5. El repositorio guarda la reserva. El controlador pone la confirmación en la sesión y redirige a «Mis reservas». Actualizar esa página repite el GET. Para mostrar el listado, `map` añade el nombre del equipo y los datos que necesita la vista.
6. Si la franja se ha ocupado, el formulario responde con 409. Conserva la fecha y el turno, recalcula el desplegable y explica el conflicto.

## Sesiones y permisos

La cookie de tipo preferido solo selecciona un filtro del catálogo. La cookie de sesión contiene el identificador firmado que usa Express para localizar la sesión en el servidor. Tiene una duración de una hora, `httpOnly`, `sameSite=lax` y `secure` en producción, donde requiere HTTPS. En desarrollo funciona con HTTP local.

En el login se regenera el identificador. El único dato de identidad guardado es `usuarioId`. El rol se consulta en el repositorio en cada petición. El token CSRF y el aviso de confirmación cumplen funciones distintas de la identidad. Al cancelar, el servicio revisa propietario, estado y fecha. Un administrador puede cancelar reservas activas pasadas desde la pantalla de administración.

## Decisiones y límites

- Los almacenes son locales a una instancia de Node y se reinician con el proceso. El cambio de estado de un equipo impide nuevas reservas mientras esté fuera de servicio. Las reservas existentes se conservan y el administrador puede cancelarlas expresamente.
- La fecha se interpreta en la zona horaria local del servidor, que debe corresponder al centro. El turno «mañana» se guarda como `manana`, tal como pide el enunciado.
- Las vistas insertan los datos con la salida escapada de EJS. Las inclusiones de parciales usan plantillas del propio proyecto.
- El mismo núcleo tipado se usa en la aplicación y en las pruebas. TypeScript es la dependencia de desarrollo añadida para compilar en modo estricto.
- El instalador original se llamaba `node.bat` e inicializaba de nuevo el proyecto. En Windows ese nombre interfería con Node al ejecutar los scripts npm. `instalar.bat` instala desde el archivo de bloqueo. El archivo local `.env` queda excluido de Git.

## Comprobar y explicar en clase

Ejecuta `npm run build` y `npm test`. Después inicia el servidor y abre dos sesiones de navegador independientes.

1. Con Ana, reserva un equipo libre para hoy. Con Luis, consulta la misma fecha y turno. El equipo desaparece de ese turno y sigue disponible en el otro.
2. Cancela con Ana y repite la consulta con Luis. El equipo vuelve a aparecer y Ana conserva el registro cancelado.
3. Con el administrador, pon un equipo fuera de servicio. Sigue visible en el catálogo, pero deja de aparecer al reservar. Desde la sesión de Luis, visitar `/admin/equipos` devuelve 403.
4. Cierra la sesión y abre `/perfil`. La respuesta redirige al formulario de acceso.
5. Para repasar el código, localiza quién interpreta el formulario, quién decide si una reserva es válida y quién guarda el resultado. En el README están los comandos equivalentes con curl.
