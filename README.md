# Reserva de equipos del centro educativo

Práctica de DWES, unidades 2 y 3. El catálogo es público. Cada usuario puede reservar un equipo por fecha y turno, consultar su historial y cancelar sus reservas. El administrador también gestiona el inventario y las reservas de todos los usuarios.

## Instalar y arrancar

Necesitas Node.js 24 o superior y npm. Desde la raíz del proyecto, en PowerShell:

```powershell
npm.cmd ci
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(40).toString('hex'))"
```

En una instalación nueva, pega el valor generado en `SESSION_SECRET` dentro de `.env`. Si ya tienes un `.env` configurado, consérvalo. El ejemplo usa `PORT=3000` y `NODE_ENV=development`. El servidor comprueba puerto, entorno y longitud del secreto al arrancar. En Windows también puedes ejecutar `instalar.bat` para instalar las dependencias y crear la plantilla local si falta.

```powershell
npm.cmd run build
npm.cmd test
npm.cmd start
```

Abre [el catálogo local](http://localhost:3000/equipos). Para trabajar con reinicio automático usa `npm.cmd run dev`. Node ejecuta directamente el núcleo TypeScript y el comando de compilación comprueba sus tipos en modo estricto y genera JavaScript en `dist/`. Las pruebas crean una aplicación aislada por caso.

## Cuentas y datos iniciales

| Correo de prueba | Perfil |
| --- | --- |
| ana@example.com | Usuario |
| luis@example.com | Usuario |
| admin@example.com | Administrador |

Las tres cuentas de demostración tienen la contraseña `Practica123!`. Al arrancar se carga su hash bcrypt, tres equipos y tres reservas para mañana. La reserva 1 está activa a nombre de Ana, la 2 está activa a nombre de Luis y la 3 está cancelada. Los cambios se pierden al reiniciar. Las credenciales públicas y el almacén de sesiones en memoria son para la práctica local.

## Funcionalidades

| Pantalla | Funcionamiento |
| --- | --- |
| Catálogo y ficha | Filtra por tipo y estado. Al aplicar el filtro de tipo se guarda la preferencia durante 30 días. Elegir «Todos» la borra. La ficha muestra el estado del equipo. |
| Registro, acceso y perfil | El registro normaliza el correo, comprueba el duplicado y asigna el rol usuario. El login compara el hash, regenera la sesión y guarda el ID. Diez fallos por IP en quince minutos limitan temporalmente el acceso. El perfil recupera el usuario por su ID. |
| Nueva reserva | Primero se eligen fecha y turno. El GET muestra únicamente equipos operativos libres. El POST vuelve a comprobar los datos y obtiene el titular de la sesión. Un conflicto devuelve 409 y permite elegir otro equipo. |
| Mis reservas | Muestra activas y canceladas. Cancelar una propia de hoy o posterior cambia su estado y libera esa franja. |
| Administración | Permite añadir equipos, cambiar su estado, ver todos los titulares y cancelar cualquier reserva activa. Las rutas comprueban el rol en el servidor. |
| Sesiones y formularios | Cada formulario privado de escritura incluye el token CSRF de la sesión. Las operaciones correctas redirigen con 303. Los avisos de confirmación se consumen en la siguiente página. Salir destruye la sesión y retira su cookie. |

## Recorrido reproducible con curl

Ejecuta los bloques en orden en **otra ventana de PowerShell** con el servidor recién arrancado. Cada comando corresponde a una operación disponible desde el navegador. Las dos cuentas usan archivos temporales distintos para conservar sus cookies. Los POST muestran las cabeceras para poder comprobar el 303 y su destino.

```powershell
$base = 'http://localhost:3000'
$jar = [IO.Path]::GetTempFileName()
$adminJar = [IO.Path]::GetTempFileName()
$fecha = (Get-Date).ToString('yyyy-MM-dd')
function Token($archivo) {
  $html = curl.exe -s -b $archivo "$base/perfil"
  $token = [regex]::Match(($html -join "`n"), 'name="_csrf" value="([^"]+)"').Groups[1].Value
  if (!$token) { throw 'Inicia sesión para obtener el token.' }
  return $token
}

# Portada, filtros, preferencia recordada y ficha pública.
curl.exe -i "$base/"
curl.exe -s -c $jar "$base/equipos?tipo=portatil&operativos=true"
curl.exe -s -b $jar "$base/equipos"
curl.exe -s "$base/equipos/1"

# Alta, acceso y perfil. El correo queda libre tras reiniciar la aplicación.
curl.exe -s "$base/registro"
curl.exe -i -c $jar -d "nombre=Eva&email=eva@example.com&password=Practica123!" "$base/registro"
curl.exe -s -b $jar "$base/login"
curl.exe -i -b $jar -c $jar -d "email=eva@example.com&password=Practica123!" "$base/login"
curl.exe -s -b $jar "$base/perfil"
$csrf = Token $jar

# Hoy, a diferencia de mañana, el equipo 1 comienza libre en ambos turnos.
curl.exe -s -b $jar "$base/reservas/nueva?fecha=$fecha&turno=manana"
curl.exe -i -b $jar -d "_csrf=$csrf&equipoId=1&fecha=$fecha&turno=manana" "$base/reservas"
curl.exe -s -b $jar "$base/mis-reservas"
# Repetir el POST anterior antes de cancelar devuelve 409.
# La primera reserva creada tras las tres iniciales tiene ID 4.
curl.exe -i -b $jar -d "_csrf=$csrf" "$base/reservas/4/cancelar"
curl.exe -s -b $jar "$base/mis-reservas"
curl.exe -i -b $jar -c $jar -d "_csrf=$csrf" "$base/logout"
curl.exe -i -b $jar "$base/perfil"
```

El último GET redirige al login. Para comprobar la administración:

```powershell
curl.exe -i -c $adminJar -d "email=admin@example.com&password=Practica123!" "$base/login"
$adminCsrf = Token $adminJar
curl.exe -s -b $adminJar "$base/admin/equipos"
curl.exe -i -b $adminJar -d "_csrf=$adminCsrf&codigo=LAB-1&nombre=Laboratorio&tipo=portatil&estado=operativo" "$base/admin/equipos"
curl.exe -i -b $adminJar -d "_csrf=$adminCsrf&estado=fuera_de_servicio" "$base/admin/equipos/4/estado"
curl.exe -s -b $adminJar "$base/admin/reservas"
curl.exe -i -b $adminJar -d "_csrf=$adminCsrf" "$base/admin/reservas/1/cancelar"
curl.exe -i -b $adminJar -d "_csrf=$adminCsrf" "$base/logout"
Remove-Item -LiteralPath $jar,$adminJar
```

## Documentación y uso de IA

La [guía de implementación y pruebas](docs/flujo-reservas.md) explica el recorrido de una petición, las decisiones del proyecto y una demostración para clase. Los [apuntes de las sesiones 1 a 11](docs/conceptos-dwec-sesiones-1-11.md) son la referencia de JavaScript.

Se utilizó IA para implementar la aplicación, preparar las pruebas y redactar la documentación. Posteriormente se compartió un [chat de ChatGPT para la evaluación](https://chatgpt.com/share/6af4cbee-018c-83ed-b20e-aac462252fe3).
