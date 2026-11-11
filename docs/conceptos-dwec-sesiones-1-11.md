# Manual Integrado de Desarrollo Web en Entorno Cliente: Sesiones 1 a 11 y Guía de Aplicación Práctica

Este documento ofrece una síntesis técnica y exhaustiva de los conceptos, herramientas, métodos y patrones de diseño abordados en las primeras once sesiones de la asignatura **Desarrollo Web en Entorno Cliente (DWEC)**. Además, incluye una guía metodológica detallada con todos los requisitos y arquitecturas necesarias para desarrollar las prácticas del módulo de forma autónoma, robusta y mantenible.

---

## 1. Arquitectura Web Cliente-Servidor y Entorno de Ejecución (Sesión 1)

El desarrollo web en entorno cliente comprende el código que se descarga y ejecuta directamente en el navegador del usuario final. Entender el flujo de comunicación HTTP/HTTPS y los componentes internos del navegador es fundamental para estructurar aplicaciones eficientes.

### 1.1 El Modelo Cliente-Servidor y el Ciclo HTTP/HTTPS

La interacción web se basa en el intercambio asíncrono o síncrono de peticiones y respuestas entre un **cliente** (generalmente un navegador web) y un **servidor**:

*   **Cliente**: Inicia la comunicación enviando una solicitud HTTP/HTTPS. Su trabajo principal es gestionar la interfaz de usuario, procesar eventos, validar datos inicialmente y representar el documento.
*   **Servidor**: Escucha peticiones en un puerto determinado, aplica la lógica de negocio profunda, gestiona la persistencia en bases de datos y devuelve una respuesta estructurada (HTML, CSS, JSON, archivos multimedia).
*   **Códigos de estado HTTP**:
    *   `200 OK`: La solicitud ha tenido éxito y el recurso se ha servido correctamente.
    *   `404 Not Found`: El recurso solicitado no existe en la ruta especificada.
    *   `500 Internal Server Error`: Se ha producido un fallo no controlado en la lógica del servidor.

### 1.2 Componentes Internos del Navegador

Un navegador moderno integra cuatro subsistemas conceptuales esenciales:

1.  **Motor de renderizado**: Interpreta la estructura HTML y las reglas CSS para calcular la disposición espacial (*layout*) y pintar la interfaz visual.
2.  **Motor JavaScript**: Analiza, interpreta y optimiza el código mediante compilación *Just-In-Time* (JIT). Ejemplos destacados son V8 (Chrome, Edge), SpiderMonkey (Firefox) y JavaScriptCore (Safari).
3.  **DOM (Document Object Model)**: Estructura en árbol cargada en memoria que representa conceptualmente el documento HTML.
4.  **APIs del Navegador (Web APIs)**: Conjunto de interfaces expuestas al entorno de ejecución para dotar al lenguaje de capacidades de red (`fetch`), temporización (`setTimeout`), almacenamiento (`cookies`, `localStorage`) y manipulación del entorno.

### 1.3 Carga e Integración de Scripts en HTML

La inclusión de código JavaScript en un documento HTML condiciona el tiempo de análisis (*parsing*) del documento. Existen distintas formas de vincular los scripts mediante la etiqueta `<script>`:

```html
<!-- Bloquea el análisis del HTML mientras descarga y ejecuta -->
<script src="js/main.js"></script>

<!-- Descarga en paralelo y ejecuta tras finalizar el análisis respetando el orden -->
<script src="js/main.js" defer></script>

<!-- Descarga en paralelo y ejecuta de inmediato al terminar la descarga (sin orden garantizado) -->
<script src="js/main.js" async></script>

<!-- Carga el script como módulo de ES6 (ámbito propio, modo estricto y defer por defecto) -->
<script type="module" src="js/main.js"></script>
```

### 1.4 Herramientas de Desarrollo (DevTools)

Las herramientas de desarrollo integradas en el navegador son indispensables para la inspección y depuración:

*   **Console**: Permite ejecutar expresiones JavaScript al vuelo, evaluar variables y examinar registros o errores del sistema.
*   **Elements**: Muestra el estado actual del árbol DOM y las reglas CSS computadas sobre cada nodo.
*   **Sources**: Permite inspeccionar el código fuente original, establecer puntos de interrupción (*breakpoints*) y pausar la ejecución para examinar la pila de llamadas (*call stack*) y el ámbito de las variables.
*   **Network**: Registra todas las peticiones HTTP/HTTPS realizadas, mostrando métodos, códigos de respuesta, cabeceras, cargas útiles y tiempos de transferencia.

---

## 2. Fundamentos del Lenguaje JavaScript: Sintaxis, Variables y Tipos (Sesión 2)

JavaScript es un lenguaje de programación de tipado dinámico, débilmente tipado y orientado a objetos basándose en prototipos.

### 2.1 Sentencias, Expresiones y Consola

Una **expresión** es cualquier fragmento de código que se evalúa y produce un valor, mientras que una **sentencia** realiza una acción o controla la ejecución del programa.

Para la salida de diagnóstico se utiliza la API `console`:

```javascript
console.log("Mensaje informativo genérico");
console.warn("Advertencia de rendimiento o comportamiento no recomendado");
console.error("Notificación de error en tiempo de ejecución");
console.table([{ id: 1, nombre: "Ana" }, { id: 2, nombre: "Luis" }]);
```

### 2.2 Declaración de Variables: `const`, `let` y `var`

La elección del identificador adecuado determina la mutabilidad de la referencia y su alcance:

*   `const`: Declara una referencia inmutable dentro del ámbito de bloque. Debe inicializarse obligatoriamente en su declaración. Evita la reasignación de la variable, aunque no hace inmutables las propiedades del objeto o array al que apunta.
*   `let`: Declara una variable reasignable con ámbito de bloque. Es la opción adecuada cuando el algoritmo requiere modificar el valor almacenado.
*   `var`: Forma heredada de declaración. Posee ámbito de función o global, admite redeclaración en el mismo ámbito y sufre *hoisting* con valor inicial `undefined`. Se desaconseja su uso en código moderno.

### 2.3 Tipos de Datos Primitivos

JavaScript define siete tipos de datos primitivos. Los valores primitivos son inmutables y se comparan por su valor:

| Tipo | Ejemplo | Descripción |
| :--- | :--- | :--- |
| `number` | `42`, `3.14`, `NaN`, `Infinity` | Representación numérica de coma flotante de doble precisión (IEEE 754). |
| `string` | `'Hola'`, `"Mundo"`, \`Texto\` | Cadenas de caracteres de texto. |
| `boolean` | `true`, `false` | Valores de lógica booleana. |
| `undefined` | `let x;` | Indica que una variable ha sido declarada pero no inicializada. |
| `null` | `const data = null;` | Representa la ausencia intencionada de objeto o valor. |
| `bigint` | `9007199254740991n` | Enteros de precisión arbitraria. |
| `symbol` | `Symbol("id")` | Identificadores únicos e inmutables. |

> **Particularidad histórica de `typeof`**: Al evaluar `typeof null`, el operador devuelve `"object"`. Esto responde a un fallo histórico en la implementación original del lenguaje que se mantiene por compatibilidad hacia atrás. Para validar si un dato es nulo, debe realizarse una comparación directa `valor === null`.

---

## 3. Control de Flujo, Ámbitos y Conversiones de Tipo (Sesión 3)

El ámbito define el alcance sintáctico de las variables, mientras que las conversiones determinan cómo interactúan los distintos tipos de datos en operaciones y condiciones.

### 3.1 Ámbitos y Zona Temporal Muerta (TDZ)

Se distinguen tres niveles de ámbito (*scope*):

1.  **Global**: Variables accesibles desde cualquier punto del programa.
2.  **Función**: Variables declaradas dentro de una función, inaccesibles fuera de ella.
3.  **Bloque**: Variables declaradas con `let` o `const` dentro de llaves `{ ... }`.

La **Zona Temporal Muerta (TDZ)** es el intervalo entre la entrada en el ámbito del bloque y el punto concreto donde se ejecuta la declaración de la variable `let` o `const`. Acceder a una variable durante su TDZ lanza un error de referencia (`ReferenceError`).

```javascript
// Inicio del ámbito de bloque
// console.log(a); // Lanza ReferenceError (TDZ activa)
let a = 10; // Finaliza la TDZ para la variable 'a'
console.log(a); // Imprime 10
```

### 3.2 Conversiones Explícitas e Implícitas

JavaScript realiza conversiones automáticas de tipo (conversiones implícitas) durante la evaluación de determinados operadores, lo cual puede generar errores sutiles:

*   **Suma frente a concatenación**: El operador `+` concatena si al menos uno de los operandos es una cadena (`"5" + 2` resulta en `"52"`). Sin embargo, los operadores aritméticos `-`, `*`, `/` y `%` convierten implícitamente a número (`"5" - 2` resulta en `3`).
*   **Conversiones explícitas recomendadas**:
    *   A número: `Number(valor)`, `Number.parseInt(texto, 10)`, `Number.parseFloat(texto)`.
    *   A cadena: `String(valor)`, o uso de plantillas de cadena (\`...\`).
    *   A booleano: `Boolean(valor)`.

### 3.3 Evaluaciones Booleans: Truthy y Falsy

En estructuras de control y operadores lógicos, cualquier valor se evalúa como `true` (*truthy*) o `false` (*falsy*).

Existen exactamente ocho valores considerados **falsy** en JavaScript:
`false`, `0`, `-0`, `0n`, `""` (cadena vacía), `null`, `undefined` y `NaN`.

Cualquier otro valor es **truthy**, incluyendo las cadenas no vacías `"0"` y `"false"`, los arrays vacíos `[]` y los objetos literales vacíos `{}`.

### 3.4 Operadores de Comparación y Cortocircuito

*   **Igualdad estricta (`===`) frente a no estricta (`==`)**: El operador `===` evalúa igualdad de valor y de tipo sin realizar conversión implícita. El operador `==` convierte los operandos a un tipo común antes de comparar. En el curso se utiliza de manera generalizada `===` y `!==`.
*   **Operador de coalescencia nula (`??`) frente a disyunción (`||`)**:
    *   `a || b`: Devuelve `b` si `a` es cualquier valor *falsy* (incluyendo `0`, `""` o `false`).
    *   `a ?? b`: Devuelve `b` única y exclusivamente si `a` es `null` o `undefined`. Permite conservar el número `0` o cadenas vacías como valores válidos.

```javascript
const stock = 0;
const res1 = stock || 10; // Devuelve 10 (0 es falsy)
const res2 = stock ?? 10; // Devuelve 0 (0 no es null ni undefined)
```

### 3.5 Estructuras Condicionales

Las decisiones se estructuran mediante bloques `if...else if...else`, expresiones ternarias o sentencias `switch`:

```javascript
// Operador ternario para asignaciones simples
const categoria = edad >= 18 ? "Adulto" : "Menor";

// Estructura switch con evaluación estricta en cada caso
switch (opcion) {
  case "A":
    procesarA();
    break;
  case "B":
    procesarB();
    break;
  default:
    procesarDefecto();
}
```

---

## 4. Estructuras Repetitivas y Bucles (Sesión 4)

Los bucles permiten ejecutar iterativamente un conjunto de sentencias mientras se cumpla una condición determinada.

### 4.1 Tipos de Bucles

*   `while`: Comprueba la condición antes de cada iteración. Puede ejecutarse 0 veces.
*   `do...while`: Comprueba la condición después de cada iteración. Garantiza al menos una ejecución del bloque.
*   `for`: Agrupa en la cabecera la inicialización, la condición de parada y la expresión de actualización. Es la estructura ideal cuando se conoce de antemano el número de iteraciones o los límites numéricos.
*   `for...of`: Recorre directamente los elementos de objetos iterables (como arrays o cadenas).

```javascript
const notas = [7, 8, 9];
for (const nota of notas) {
  console.log(nota); // Imprime 7, luego 8, luego 9
}
```

### 4.2 Control de Flujo en Bucles: `break` y `continue`

*   `break`: Interrumpe de forma inmediata la ejecución del bucle más cercano y transfiere el control a la sentencia posterior.
*   `continue`: Omite las sentencias restantes de la iteración actual y avanza a la siguiente evaluación de la condición.

### 4.3 Patrones de Acumulación y Conteo

Al procesar colecciones mediante bucles se emplean habitualmente dos patrones de estado:

1.  **Contador**: Variable numérica inicializada a `0` que se incrementa en una cantidad fija (generalmente `1`) al cumplirse una condición.
2.  **Acumulador**: Variable inicializada en un valor base (`0` para sumas, `1` para productos) que va incorporando valores procesados en cada iteración.

---

## 5. Objetos Predefinidos de JavaScript y del Navegador (Sesión 5)

JavaScript y la plataforma web ponen a disposición del programador un catálogo de objetos nativos con métodos esenciales para la manipulación de datos y del contexto.

### 5.1 Objetos Core de JavaScript: `String`, `Number`, `Math`, `Date` y `JSON`

#### `String`
Las cadenas de texto son primitivas inmutables. Sus métodos devuelven siempre cadenas nuevas:

*   `length`: Propiedad que indica la cantidad de caracteres.
*   `trim()`: Elimina espacios en blanco de los extremos.
*   `toLowerCase()`, `toUpperCase()`: Conversión de caja de caracteres.
*   `includes(subcadena)`: Devuelve `true` si la subcadena está presente.
*   `slice(inicio, fin)`: Extrae una subcadena desde el índice `inicio` hasta `fin` (sin incluir).
*   `split(separador)`: Divide la cadena en un array de subcadenas.

#### `Number`
*   `Number.isNaN(valor)`: Comprueba si el valor es strictly `NaN` sin realizar conversión previa.
*   `Number.isFinite(valor)`: Verifica que un valor sea numérico y finito (excluye `NaN`, `Infinity` y tipos no numéricos).
*   `Number.isInteger(valor)`: Comprueba si un número es un entero.
*   `num.toFixed(decimales)`: Formatea un número a un número fijo de decimales y devuelve una **cadena de texto**.

#### `Math`
Objeto estático que proporciona constantes y operaciones matemáticas:

```javascript
// Generar un entero aleatorio en el intervalo cerrado [minimo, maximo]
const enteroAleatorio = Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
```

#### `Date`
Representa instantes temporales medidos en milisegundos transcurridos desde la época UNIX (1 de enero de 1970 UTC):

*   `new Date()`: Instante actual.
*   `getFullYear()`: Obtiene el año de cuatro dígitos.
*   `getMonth()`: Obtiene el mes (atención: indexado de **0 a 11**, donde 0 es enero).
*   `getDate()`: Obtiene el día del mes (1 a 31).
*   `toISOString()`: Devuelve una representación estándar de la fecha en formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).

#### `JSON` (JavaScript Object Notation)
Formato liviano de intercambio de datos.

*   `JSON.stringify(objeto)`: Convierte un objeto o array JavaScript en una cadena de texto JSON.
*   `JSON.parse(textoJSON)`: Parsea una cadena de texto JSON y construye el valor o estructura JavaScript equivalente. Lanza un error de sintaxis (`SyntaxError`) si la cadena está mal formada, por lo que debe envolverse en un bloque `try...catch`.

### 5.2 Objetos del Entorno del Navegador (BOM)

*   `window`: Objeto global en el navegador que representa la ventana o pestaña.
*   `navigator`: Información del navegador y del sistema (`navigator.language`, `navigator.onLine`).
*   `location`: Información de la URL actual y gestión de la navegación (`location.href`, `location.pathname`, `location.search`, `location.origin`). Para consultar parámetros de búsqueda se utiliza la clase `URLSearchParams`.
*   `history`: Gestión del historial de navegación de la pestaña (`history.back()`, `history.forward()`).
*   `screen`: Dimensiones de la pantalla física (`screen.width`, `screen.height`).
*   **Diálogos modales**: `alert(mensaje)`, `confirm(mensaje)` (devuelve `true`/`false`), `prompt(mensaje, defecto)` (devuelve `string` o `null` si se cancela).

---

## 6. Manipulación del Modelo de Objetos del Documento (DOM) (Sesión 6)

El DOM es la interfaz de programación que permite a JavaScript consultar, modificar, crear y eliminar elementos del documento HTML en memoria.

### 6.1 Selección de Elementos

*   `document.getElementById("id")`: Busca un elemento por su ID único. Devuelve el nodo del elemento o `null` si no existe.
*   `document.querySelector("selectorCSS")`: Devuelve el primer elemento que coincida con el selector CSS o `null` si no hay coincidencias.
*   `document.querySelectorAll("selectorCSS")`: Devuelve una `NodeList` estática con todos los elementos que coinciden. Si no se encuentran elementos, devuelve una colección vacía (`length === 0`), nunca `null`.

### 6.2 Modificación de Contenido, Atributos y Clases

*   `textContent`: Lee o escribe el contenido textual de un nodo. Es una propiedad segura que previene ataques de inyección de código (XSS), ya que no interpreta las cadenas como etiquetas HTML.
*   `value`: Lee o escribe el valor introducido en controles de formulario (`<input>`, `<select>`, `<textarea>`).
*   `classList`: Objeto para gestionar las clases CSS de un elemento de forma limpia:
    *   `add("clase")`, `remove("clase")`: Añade o elimina una clase.
    *   `contains("clase")`: Verifica la presencia de una clase (devuelve `true`/`false`).
    *   `toggle("clase", condicion)`: Alterna la clase o la conmuta en función de una condición booleana.
*   **Gestión de Atributos**: `getAttribute("attr")`, `setAttribute("attr", "valor")`, `removeAttribute("attr")`, `hasAttribute("attr")`.

### 6.3 Creación, Inserción y Eliminación de Nodos

```javascript
// 1. Crear el elemento en memoria
const nuevaTarjeta = document.createElement("article");
nuevaTarjeta.classList.add("tarjeta");

const titulo = document.createElement("h2");
titulo.textContent = "Título de prueba";

// 2. Componer la estructura jerárquica mediante append
nuevaTarjeta.append(titulo);

// 3. Insertar el elemento en un contenedor del DOM existente
const contenedor = document.querySelector("#contenedor");
contenedor.append(nuevaTarjeta);

// 4. Eliminar un nodo del DOM
nuevaTarjeta.remove();
```

> **Advertencia sobre `innerHTML`**: La asignación masiva a `innerHTML` destruye los nodos existentes, elimina los escuchadores de eventos asociados a sus descendientes y expone la aplicación a vulnerabilidades de tipo Cross-Site Scripting (XSS) si se incorporan datos procedentes del usuario. Se exige construir la interfaz mediante `document.createElement`, `textContent` y `append`.

---

## 7. Ventanas, Contextos, Iframe, postMessage y Cookies (Sesión 7)

El control de contextos de navegación secundarios y el almacenamiento persistente ligero son pilares de la interactividad web.

### 7.1 Gestión de Ventanas Secundarias

Se puede solicitar la apertura de una nueva ventana o pestaña mediante `window.open`:

```javascript
// Abrir ventana
const miVentana = window.open("ayuda.html", "VentanaAyuda", "width=600,height=400");

// Verificar si sigue abierta y cerrarla
if (miVentana !== null && !miVentana.closed) {
  miVentana.close();
}
```

Desde la ventana hija, la propiedad `window.opener` devuelve la referencia a la ventana que la abrió (siempre que se cumpla la política de mismo origen y no se haya especificado `rel="noopener"`).

### 7.2 Documentos Incrustados (`<iframe>`) y Política del Mismo Origen (SOP)

Un `<iframe>` permite incrustar un documento HTML independiente dentro de la página principal:

```html
<iframe id="panelEvento" src="panel.html" title="Panel Informativo"></iframe>
```

*   **Acceso a contextos**: Desde la página contenedora, `iframeElement.contentWindow` da acceso al objeto `window` del iframe. Desde el iframe, `window.parent` hace referencia a la ventana contenedora.
*   **Same-Origin Policy (SOP)**: Dos documentos pertenecen al mismo origen si comparten exactamente el mismo **esquema** (protocolo `http`/`https`), **host** (dominio/IP) y **puerto**. Si dos documentos tienen orígenes distintos, JavaScript no puede acceder directamente a sus propiedades ni al DOM del otro contexto.

### 7.3 Comunicación Segura entre Ventanas: `postMessage`

`postMessage` permite el intercambio asíncrono de mensajes entre contextos de navegación independientemente de su origen:

```javascript
// Emisor (Página Principal enviando a un iframe del mismo origen)
const iframeWin = document.querySelector("#panelEvento").contentWindow;
iframeWin.postMessage({ tipo: "ACTUALIZACION", total: 42 }, location.origin);

// Receptor (Dentro del script del iframe)
window.addEventListener("message", (evento) => {
  // 1. Validar el origen emisor esperable
  if (evento.origin !== location.origin) return;

  // 2. Validar la fuente
  if (evento.source !== window.parent) return;

  // 3. Validar la estructura del mensaje
  const datos = evento.data;
  if (datos !== null && typeof datos === "object" && datos.tipo === "ACTUALIZACION") {
    console.log("Total recibido:", datos.total);
  }
});
```

### 7.4 Persistencia Ligera con Cookies (`document.cookie`)

Una cookie es una pequeña cadena de texto asociada a un dominio y ruta.

#### Atributos de una Cookie:
*   `Path=/`: Define el alcance de ruta dentro del sitio web.
*   `Max-Age=segundos`: Duración de la cookie en segundos (un `Max-Age=0` provoca su eliminación inmediata).
*   `SameSite=Lax`: Regula el envío de la cookie en peticiones entre sitios.
*   `Secure`: Restringe el envío a conexiones HTTPS cifradas.

#### Funciones Auxiliares de Gestión de Cookies:

```javascript
function guardarCookie(nombre, valor, dias) {
  const segundos = Math.floor(dias * 24 * 60 * 60);
  let atributos = `; Path=/; Max-Age=${segundos}; SameSite=Lax`;
  if (location.protocol === "https:") atributos += "; Secure";
  document.cookie = `${nombre}=${encodeURIComponent(valor)}${atributos}`;
}

function leerCookie(nombre) {
  const prefijo = `${nombre}=`;
  const partes = document.cookie.split(";");
  for (let i = 0; i < partes.length; i++) {
    const parte = partes[i].trim();
    if (parte.startsWith(prefijo)) {
      try {
        return decodeURIComponent(parte.slice(prefijo.length));
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

function borrarCookie(nombre) {
  let atributos = "; Path=/; Max-Age=0; SameSite=Lax";
  if (location.protocol === "https:") atributos += "; Secure";
  document.cookie = `${nombre}=${atributos}`;
}
```

---

## 8. Funciones, Modularidad y Buenas Prácticas (Sesión 8)

Las funciones permiten encapsular lógica reutilizable y dividir la aplicación en módulos con responsabilidades claras.

### 8.1 Declaraciones frente a Expresiones y Funciones Flecha

```javascript
// 1. Declaración tradicional (sufre hoisting completo)
function calcularImpuesto(base, tipo = 0.21) {
  return base * tipo;
}

// 2. Expresión de función anónima asignada a const (respeta TDZ)
const multiplicar = function(a, b) {
  return a * b;
};

// 3. Función flecha con retorno implícito (sin llaves)
const doble = n => n * 2;

// 4. Función flecha con bloque y retorno explícito
const esAprobado = (nota) => {
  if (!Number.isFinite(nota)) return null;
  return nota >= 5;
};
```

### 8.2 Parámetros por Defecto y Paso de Parámetros

*   Los parámetros por defecto (`param = valorDefecto`) se aplican únicamente cuando el argumento se omite o es estrictamente `undefined`. No sustituyen a `null`, `0` o cadenas vacías `""`.
*   **Paso por valor**: Los tipos primitivos se pasan por valor. Los cambios realizados en el parámetro dentro de la función no afectan a la variable original.
*   **Paso por referencia**: Los objetos y arrays se pasan por referencia. Modificar las propiedades de un objeto recibido altera el objeto original en el código cliente.

### 8.3 Funciones Puras y Principio de Responsabilidad Única

*   **Principio de Responsabilidad Única**: Cada función debe resolver una única tarea bien definida (validar, calcular o manipular el DOM).
*   **Función Pura**: Aquella cuyo resultado depende exclusivamente de sus argumentos de entrada y no produce efectos secundarios (*side effects*) sobre el estado externo ni sobre el DOM.

---

## 9. Arrays y Métodos de Colección (Sesión 9)

Un array es una colección ordenada de elementos indexada numéricamente desde `0`.

### 9.1 Métodos de Modificación (Mutadores)

Modifican el array sobre el que se aplican:

*   `push(...elementos)`: Añade elementos al final y devuelve la nueva longitud.
*   `pop()`: Extrae y devuelve el último elemento.
*   `unshift(...elementos)`: Añade elementos al principio y devuelve la nueva longitud.
*   `shift()`: Extrae y devuelve el primer elemento.
*   `splice(inicio, cantidad, ...nuevos)`: Elimina `cantidad` de elementos a partir de `inicio` e inserta los elementos opcionales `nuevos`. Devuelve un array con los elementos eliminados.

### 9.2 Métodos de Búsqueda y Extracción (No Mutadores)

*   `slice(inicio, fin)`: Devuelve un nuevo array con una copia superficial del intervalo seleccionado.
*   `includes(elemento)`: Devuelve `true` si el elemento está presente.
*   `indexOf(elemento)`: Devuelve el primer índice donde se encuentra el elemento, o `-1` si no existe.
*   `find(callback)`: Devuelve el **primer elemento** que cumple la condición del callback, o `undefined` si ninguno la cumple.

### 9.3 Métodos de Iteración y Funcionales

```javascript
const estudiantes = [
  { id: 1, nombre: "Ana", nota: 4 },
  { id: 2, nombre: "Luis", nota: 7 },
  { id: 3, nombre: "Eva", nota: 9 }
];

// forEach: Ejecuta una acción por cada elemento (devuelve siempre undefined)
estudiantes.forEach(est => console.log(est.nombre));

// filter: Devuelve un nuevo array con los elementos que cumplen la condición
const aprobados = estudiantes.filter(est => est.nota >= 5);

// map: Devuelve un nuevo array transformando cada elemento
const nombresAprobados = aprobados.map(est => est.nombre); // ["Luis", "Eva"]
```

---

## 10. Objetos Definidos por el Usuario, Clases y JSON (Sesión 10)

Los objetos organizan datos (propiedades) y comportamientos (métodos) bajo una entidad estructurada.

### 10.1 Objetos Literales y la Notación de Acceso

```javascript
const articulo = {
  id: 101,
  nombre: "Cuaderno A4",
  precio: 3.5,
  stock: 10,
  vender(cantidad) {
    if (cantidad > 0 && cantidad <= this.stock) {
      this.stock -= cantidad;
      return true;
    }
    return false;
  }
};

// Acceso por notación de punto
console.log(articulo.nombre);

// Acceso por notación de corchetes (evalúa variables o cadenas con caracteres especiales)
const propiedad = "precio";
console.log(articulo[propiedad]);

// Comprobación de existencia propia
console.log(Object.hasOwn(articulo, "stock")); // true
```

### 10.2 Contexto de Ejecución: `this`

Dentro de un método normal de un objeto, `this` hace referencia al objeto sobre el cual se realiza la invocación (`articulo.vender(2)`).

Si el método se extrae y se invoca de forma independiente (`const fn = articulo.vender; fn(2);`), la referencia a `this` se pierde o pasa a ser `undefined` en modo estricto. Las funciones flecha **no** poseen su propio contexto `this`, sino que heredan el `this` del ámbito léxico en el que fueron creadas.

### 10.3 Programación Orientada a Objetos mediante Clases (`ES6`)

La sintaxis `class` define plantillas para instanciar objetos con propiedades y métodos comunes mediante el operador `new`:

```javascript
class Producto {
  constructor(id, nombre, precio, stock) {
    const idValido = Number.isInteger(id) && id > 0;
    const nombreValido = typeof nombre === "string" && nombre.trim() !== "";
    const precioValido = Number.isFinite(precio) && precio >= 0;
    const stockValido = Number.isInteger(stock) && stock >= 0;

    if (!idValido || !nombreValido || !precioValido || !stockValido) {
      throw new TypeError("Datos de producto no válidos");
    }

    this.id = id;
    this.nombre = nombre.trim();
    this.precio = precio;
    this.stock = stock;
  }

  hayStock() {
    return this.stock > 0;
  }

  aplicarDescuento(porcentaje) {
    if (!Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje > 100) {
      return false;
    }
    this.precio = this.precio * (1 - porcentaje / 100);
    return true;
  }
}
```

### 10.4 Reconstrucción de Instancias tras `JSON.parse`

Al ejecutar `JSON.stringify` sobre una instancia de una clase, se serializan únicamente sus propiedades numéricas, de texto, booleanas o estructuras compatibles. **Los métodos de la clase se pierden**. Al recuperar el dato con `JSON.parse`, se obtiene un objeto literal genérico. Para restituir el comportamiento de la clase es preciso instanciarla de nuevo:

```javascript
const prodOriginal = new Producto(1, "Teclado", 25, 5);
const jsonTexto = JSON.stringify(prodOriginal);

// Objeto literal sin métodos
const datoPlano = JSON.parse(jsonTexto); 

// Reconstrucción de la instancia completa con sus métodos
const prodReconstruido = new Producto(datoPlano.id, datoPlano.nombre, datoPlano.precio, datoPlano.stock);
console.log(prodReconstruido.hayStock()); // Devuelve true
```

---

## 11. Modelo de Eventos y Delegación (Sesión 11)

La programación orientada a eventos permite reaccionar a las interacciones del usuario o a cambios en el documento de forma asíncrona.

### 11.1 Registro de Escuchadores: `addEventListener`

Para vincular un evento a un elemento del DOM se utiliza `addEventListener`:

```javascript
const boton = document.querySelector("#btnGuardar");

function manejarClic(evento) {
  console.log("Tipo de evento:", evento.type);
}

// Registro
boton.addEventListener("click", manejarClic);

// Eliminación (requiere la misma referencia de función)
boton.removeEventListener("click", manejarClic);

// Opción de ejecución única
boton.addEventListener("click", () => console.log("Se ejecuta una sola vez"), { once: true });
```

### 11.2 El Objeto `Event`: `target` frente a `currentTarget`

Al ejecutarse un escuchador, la función recibe un objeto `Event` con información relevante:

*   `evento.target`: Nodo del DOM donde se **originó el evento** (el elemento real sobre el que el usuario hizo clic).
*   `evento.currentTarget`: Nodo del DOM al que está **vinculado el escuchador** de eventos en ese momento.

### 11.3 Fases de Propagación de Eventos

Un evento que burbujea atraviesa tres fases consecutivas en el árbol DOM:

1.  **Fase de Captura (`eventPhase === 1`)**: El evento desciende desde el nodo raíz (`window`/`document`) hasta el antecesor directo del objetivo.
2.  **Fase de Objetivo (`eventPhase === 2`)**: El evento alcanza el nodo objetivo real (`target`).
3.  **Fase de Burbujeo (*Bubbling*, `eventPhase === 3`)**: El evento asciende desde el nodo objetivo hasta la raíz del documento.

### 11.4 Control de la Propagación y Acciones Predeterminadas

*   `evento.preventDefault()`: Cancela el comportamiento nativo por defecto asociado al evento (por ejemplo, evita el envío y recarga de la página al enviar un formulario `<form>` o el salto de línea de un enlace `<a>`).
*   `evento.stopPropagation()`: Interrumpe la propagación del evento a través de las fases de captura o burbujeo hacia los antecesores.

### 11.5 Patrón de Delegación de Eventos

La delegación de eventos consiste en registrar un **único escuchador en un elemento contenedor padre** para gestionar los eventos originados en cualquiera de sus descendientes presentes o futuros.

Se apoya en la fase de burbujeo y utiliza los métodos `closest()` y `dataset`:

```javascript
const listaTareas = document.querySelector("#listaTareas");

listaTareas.addEventListener("click", (evento) => {
  // Verificar si el clic provino de un botón con atributo data-accion="borrar"
  const botonBorrar = evento.target.closest('button[data-accion="borrar"]');

  // Si no se hizo clic en un botón válido o está fuera del contenedor, salir
  if (!botonBorrar || !listaTareas.contains(botonBorrar)) return;

  // Localizar la fila li correspondiente y eliminarla del DOM
  const fila = botonBorrar.closest("li");
  if (fila) fila.remove();
});
```

---

## 12. Guía Integrada para el Desarrollo de Prácticas de DWEC

A continuación se condensan las directrices de arquitectura, validación y testing exigidas para afrontar con éxito una práctica completa del módulo (basada en el estándar de la Práctica de la UD1).

### 12.1 Arquitectura del Proyecto y Separación de Capas

El proyecto debe estar dividido estrictamente en archivos independientes con responsabilidades delimitadas:

```
proyecto-dwec/
├── index.html            <- Estructura semántica sin scripts ni estilos inline
├── panel.html            <- Interfaz incrustada en el iframe
├── ayuda.html            <- Ventana auxiliar de ayuda
├── css/
│   └── estilos.css       <- Reglas de presentación visual
└── js/
    ├── cookies.js        <- Módulo reutilizable de gestión de cookies
    ├── logica.js         <- Funciones puras (validación, cálculos, estadísticas, ID)
    ├── interfaz.js       <- Manejo del DOM, formularios, renderizado y eventos
    └── panel.js          <- Script específico del panel iframe (postMessage)
```

> **Regla de separación de responsabilidades**: Las funciones contenidas en `logica.js` (`validarParticipante`, `generarId`, `calcularEstadisticas`) **no deben acceder ni modificar directamente el DOM**. Deben recibir datos mediante parámetros y devolver estructuras de datos puras.

### 12.2 Estructura de Datos y Generación de IDs

Cada entidad (ejemplo: `participante` o `producto`) se almacena en memoria dentro de un array de objetos con una estructura estándar:

```javascript
const participanteEjemplo = {
  id: 483721, // Entero único de 6 dígitos
  nombre: "Ana García",
  edad: 17,
  tipo: "estudiante", // "estudiante" | "profesional" | "invitado"
  modalidad: "presencial", // "presencial" | "online"
  experiencia: 4.0, // Número finito entre 0.0 y 10.0
  fechaInscripcion: "2026-10-08T08:30:00.000Z" // Cadena ISO generada con new Date().toISOString()
};
```

#### Generación Segura de IDs Únicos:
El identificador debe ser un entero entre `100000` y `999999` generado con `Math.random()`, garantizando que no existan duplicados en la colección mediante un bucle de intentos controlados:

```javascript
function generarId(coleccion) {
  let nuevoId;
  let duplicado = true;
  let intentos = 0;
  const maxIntentos = 1000;

  while (duplicado && intentos < maxIntentos) {
    nuevoId = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    duplicado = coleccion.some((item) => item.id === nuevoId);
    intentos++;
  }

  if (duplicado) throw new Error("Imposible generar un ID único disponible.");
  return nuevoId;
}
```

### 12.3 Validación Defensiva de Formulario e Importación JSON

Todos los datos recibidos desde formularios, cadenas JSON, cookies o mensajes son considerados **no fiables**:

1.  **Nombre**: Cadena no vacía tras `trim()`, con una longitud de entre 2 y 60 caracteres.
2.  **Edad**: Entrada no vacía, número entero finito procesado con `Number()` entre `0` y `120` (la edad 0 debe ser válida).
3.  **Tipo y Modalidad**: Valores restringidos estrictamente a una lista blanca de opciones (*whitelisting*).
4.  **Experiencia**: Número finito entre `0.0` y `10.0`.

```javascript
function validarParticipante(datos) {
  if (datos === null || typeof datos !== "object") return false;

  const nombre = typeof datos.nombre === "string" ? datos.nombre.trim() : "";
  const textoEdad = String(datos.edad ?? "").trim();
  const edad = Number(textoEdad);
  const tipo = String(datos.tipo ?? "").trim().toLowerCase();
  const modalidad = String(datos.modalidad ?? "").trim().toLowerCase();
  const textoExp = String(datos.experiencia ?? "").trim();
  const exp = Number(textoExp);

  const nombreValido = nombre.length >= 2 && nombre.length <= 60;
  const edadValida = textoEdad !== "" && Number.isInteger(edad) && edad >= 0 && edad <= 120;
  const tipoValido = ["estudiante", "profesional", "invitado"].includes(tipo);
  const modalidadValida = ["presencial", "online"].includes(modalidad);
  const expValida = textoExp !== "" && Number.isFinite(exp) && exp >= 0 && exp <= 10;

  return nombreValido && edadValida && tipoValido && modalidadValida && expValida;
}
```

### 12.4 Cálculo de Estadísticas sin `reduce`

Los cálculos estadísticos deben procesar el array de datos mediante bucles tradicionales, contadores y acumuladores.

Si no existen datos para calcular una media o un extremo, se devuelve la cadena `"Sin datos"`, evitando expresamente mostrar `NaN`, `Infinity` o valores inventados:

```javascript
function calcularEstadisticas(participantes) {
  if (!Array.isArray(participantes) || participantes.length === 0) {
    return {
      total: 0,
      menores: 0,
      mayores: 0,
      edadMedia: "Sin datos",
      expPresencialMedia: "Sin datos",
      primerMenor: "Ninguno"
    };
  }

  let sumaEdades = 0;
  let menores = 0;
  let mayores = 0;
  let sumaExpPresencial = 0;
  let cuentaPresenciales = 0;
  let primerMenorNombre = null;

  for (const p of participantes) {
    sumaEdades += p.edad;
    if (p.edad < 18) {
      menores++;
      if (primerMenorNombre === null) {
        primerMenorNombre = p.nombre; // Guardar el primer menor hallado
      }
    } else {
      mayores++;
    }

    // Filtrar con continue para la experiencia presencial
    if (p.modalidad !== "presencial") continue;
    sumaExpPresencial += p.experiencia;
    cuentaPresenciales++;
  }

  const edadMedia = (sumaEdades / participantes.length).toFixed(2);
  const expPresencialMedia = cuentaPresenciales > 0 
    ? (sumaExpPresencial / cuentaPresenciales).toFixed(2) 
    : "Sin datos";

  return {
    total: participantes.length,
    menores,
    mayores,
    edadMedia,
    expPresencialMedia,
    primerMenor: primerMenorNombre ?? "Ninguno"
  };
}
```

### 12.5 Flujo Completo de Integración Iframe y `postMessage`

Para coordinar la comunicación entre la página principal y el panel incrustado en el `<iframe>`:

1.  La página principal incrusta `<iframe id="panel" src="panel.html"></iframe>` y registra un escuchador de `message`.
2.  El script del `panel.html` registra su propio escuchador de `message` y envía de inmediato un mensaje de notificación de disponibilidad a la ventana padre:
    `window.parent.postMessage({ tipo: "PANEL_LISTO" }, location.origin);`
3.  Al recibir `PANEL_LISTO`, la página principal envía la estructura de datos resumen:
    `iframeWin.postMessage({ tipo: "RESUMEN", datos: resumenEstadisticas }, location.origin);`
4.  El panel valida el origen y la estructura del mensaje y actualiza su propio DOM de forma autónoma.

### 12.6 Batería de Casos de Prueba Recomendada para la Entrega

Al redactar la documentación técnica (README.md) de la práctica, se deben incluir casos de prueba reproducibles paso a paso para verificar cada funcionalidad y frontera del sistema:

| Funcionalidad | Entrada / Acción | Resultado Esperado |
| :--- | :--- | :--- |
| **Alta Válida** | Formulario con `Ana`, `17`, `estudiante`, `presencial`, `4` | Alta correcta, formulario limpio, tarjeta agregada al DOM y estadísticas actualizadas. |
| **Alta Inválida (Texto en Edad)** | Formulario con `Luis`, `18abc`, `profesional`, `online`, `5` | Rechazo del alta, mensaje de error en pantalla, valores conservados en campos. |
| **Baja con Cancelación** | Clic en el botón "Borrar" de una tarjeta y pulsar "Cancelar" en `confirm()` | La tarjeta y el participante permanecen intactos en la colección y en el DOM. |
| **Importación JSON Dañado** | Pegar `{"nombre": "Ana",}` en el área de texto de importación | Captura del error mediante `try...catch`, aviso visual de JSON mal formado, datos sin cambios. |
| **Importación con Error de Esquema** | Importar array con un participante con ID duplicado o edad `-5` | Rechazo íntegro de la importación (sin altas parciales), mantenimiento de la colección anterior. |
| **Estadísticas sin Datos** | Borrar todos los participantes de la lista | Las medias y promedios muestran `"Sin datos"`, los contadores reflejan `0`. |
| **Persistencia de Cookies** | Guardar preferencia de tema oscuro, recargar página con `F5` | Se leen las cookies al arrancar y se aplica automáticamente la clase `.oscuro` al `body`. |
