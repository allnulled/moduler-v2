# moduler-v2

Módulos programáticos en JavaScript (nodejs o browser).

## Índice

- [moduler-v2](#moduler-v2)
  - [Índice](#índice)
  - [Instalación](#instalación)
  - [Uso](#uso)
  - [Ejemplos](#ejemplos)
    - [Crear un modulador](#crear-un-modulador)
    - [Definir un módulo](#definir-un-módulo)
    - [Cargar un módulo](#cargar-un-módulo)
    - [Acceder un módulo](#acceder-un-módulo)
  - [Tipos de módulos](#tipos-de-módulos)
    - [Módulo tipo: module](#módulo-tipo-module)
    - [Módulo tipo: factory](#módulo-tipo-factory)
    - [Módulo tipo: url](#módulo-tipo-url)
    - [Módulo tipo: file](#módulo-tipo-file)
    - [Módulo tipo: path](#módulo-tipo-path)
  - [Uso avanzado - nivel 1](#uso-avanzado---nivel-1)
    - [Módulos y dependencias anónimos](#módulos-y-dependencias-anónimos)
    - [Dependencias directas](#dependencias-directas)
    - [Módulo directo](#módulo-directo)
    - [Carga y llamada directa a módulo predefinido de tipo función](#carga-y-llamada-directa-a-módulo-predefinido-de-tipo-función)
    - [Carga e instanciación directa de módulo predefinido de tipo clase](#carga-e-instanciación-directa-de-módulo-predefinido-de-tipo-clase)
  - [Uso avanzado - nivel 2](#uso-avanzado---nivel-2)
    - [Obtener tu compilador](#obtener-tu-compilador)
    - [Compilar un js](#compilar-un-js)
    - [Métodos de módulación](#métodos-de-módulación)
      - [Método de modulación codificada](#método-de-modulación-codificada)
      - [Método de modulación programática](#método-de-modulación-programática)
    - [Ficheros asociados a la modulación](#ficheros-asociados-a-la-modulación)
      - [Ficheros \*.entry.js](#ficheros-entryjs)
      - [Ficheros \*.def.js](#ficheros-defjs)
      - [Ficheros \*.glos.js](#ficheros-glosjs)
      - [Ficheros \*.frag.js](#ficheros-fragjs)
  - [Uso avanzado - nivel 3](#uso-avanzado---nivel-3)
    - [Diferencia entre nivel 2 y nivel 3](#diferencia-entre-nivel-2-y-nivel-3)
    - [Inyecciones directas de código](#inyecciones-directas-de-código)
      - [Detalles técnicos de las inyecciones directas de código](#detalles-técnicos-de-las-inyecciones-directas-de-código)
  - [Buenas prácticas](#buenas-prácticas)

## Instalación

Solo tienes que:

- Importar el fichero [`moduler-v2.dist.js`](https://github.com/allnulled/moduler-v2/blob/main/moduler-v2.dist.js)
- Acceder a [`ModulerV2Toolkit.ModulerV2`](https://github.com/allnulled/moduler-v2/blob/main/moduler-v2.dist.js).

## Uso

Principalmente se trataría de:

- crear un modulador
- crear módulos
- cargar módulos (asíncrono)
- acceder módulos

Luego hay usos más avanzados que también se explican.

## Ejemplos

Los tests están en [`test/*.test.js`](https://github.com/allnulled/moduler-v2/tree/main/test).

### Crear un modulador

Con cada instancia de modulador tienes un espacio de nombres de módulos cerrado:

```js
const modulador = new ModulerV2();
```

### Definir un módulo

Puedes definirlo con su **valor final** con `module`:

```js
modulador.define({
    name: "object 1",
    module: 100
});
```

O puedes definirlo con una **fábrica síncrona o asíncrona** con `factory`:

```js
modulador.define({
    name: "object 2",
    factory: function() {
        return 200;
    }
});
modulador.define({
    name: "object 3",
    requires: ["object 1", "object 2"]
    factory: async function(object1, object2) {
        await new Promise(resolve => { setTimeout(resolve, 1000); });
        return object1 + object2;
    }
});
```

### Cargar un módulo

Puedes cargar 1 módulo aislado:

```js
const o1 = await modulador.load("object 1");
```

O puedes cargar varios módulos en paralelo:

```js
const [o1, o2, o3] = await Promise.all([
    modulador.load("object 1"),
    modulador.load("object 2"),
    modulador.load("object 3"),
]);
```

### Acceder un módulo

Cuando accedes a un módulo, te saltas el paso de cargarlo, por lo cual el módulo puede estar o no:

```js
// 💥 Lanzará un error:
modulador.get("object 4");

modulador.define({ name: "object 4", module: 400 });

// 💥 Seguirá lanzarando un error:
modulador.get("object 4");

await modulador.load("object 4");

// ✅ Ahora sí devolvería 400:
modulador.get("object 4");
```

## Tipos de módulos

Hay diferentes tipos de módulos, que se cargan de diferentes maneras cada uno.

### Módulo tipo: module

El básico: lo que pongas en `module` es el módulo tal cual.

```js
modulador.define({
    name: "tipo módulo",
    module: 100,
    getter: imported => imported + 1
});
modulador.assert(101 === await modulador.load("tipo módulo"));
```

### Módulo tipo: factory

Este tipo ejecuta una función y toma su resultado como el valor del módulo:

```js
modulador.define({
    name: "tipo fábrica",
    factory: () => 100,
    getter: imported => imported + 1
});
modulador.assert(101 === await modulador.load("tipo fábrica"));
```

- Admite `async functions` también.
- Y si una función `function` devuelve una `Promise`, se entiende como `async function`.
- Esto implica que no puedes hacer que una `factory` devuelva una `Promise` directamente, porque se resolverá. Puedes devolverla envuelta en algo, pero no únicamente `Promise`.

### Módulo tipo: url

Este tipo utiliza `fetch + eval` y espera que en su js definas el recurso:

```js
modulador.define({
    name: "tipo url",
    url: "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.js",
    getter: function() {
        return lodash;
    }
});
```

- Si es un recurso que no usa el modulador pero querrías, como cualquier recurso de terceros normal, puedes usar el `getter` a modo de adaptador.

### Módulo tipo: file

Este tipo utiliza `require` o `import`, pero se entiende que se está usando en entorno `node.js`:

```js
modulador.define({
    name: "tipo file",
    file: "./ruta/a/fichero.js",
    flavour: "require", // tienes: 'require' (por defecto), 'import', 'eval'
    getter: function(imported) {
        return imported.default;
    }
});
```

- Si es un recurso que no usa `require/module.exports` sino `import/export`, tienes el flag de `flavour="import"` para especificarlo.
- Si es un recurso que directamente es un fragmento de código que devuelve algo con un `return`, tienes el flag de `flavour="eval"` para especificarlo
   - nótese que los fragmentos en `eval` admiten `await` en el scope inmediato.
- En cualquier caso, tienes el `getter` a modo de adaptador también.
- Las rutas son relativas al método en cada caso: `require`, `import` o `new AsyncFunction` en caso de `eval`.

### Módulo tipo: path

Este tipo se completará como uno de estos métodos, en este orden (en función del entorno huésped): (1) como `readFile + eval` o (2) como `url`.

```js
modulador.define({
    name: "tipo file",
    path: "src/a/modulo-es6.js",
    getter: function(imported) {
        return imported.default;
    }
});
```

- Las rutas son relativas al método de importación que se termine usando.


## Uso avanzado - nivel 1

Hay algunas acciones más avanzadas que te serán interesantes.

El **nivel 1** se caracteriza por ser las **features que primero se me ocurrieron**, no voy a maquillarlo: entre fáciles de hacer y más o menos interesantes.

### Módulos y dependencias anónimos

Puedes crear módulos anónimos y dependencias anónimas si no especificas el `name`, en cuyo caso pierde las propiedades de cacheo, pero es válido para los dos casos.

Si haces esto, usas directamente `ModulerV2.prototype.load` sin pasar antes por `ModulerV2.prototype.define` ni esperar retomar con `ModulerV2.prototype.get`.

### Dependencias directas

Las dependencias directas es que en lugar de pasarle un `id:string` en el `requires`, le pasas un `modulo:object` directamente.

En el test [300.001. Dependencias directas.test.js](https://github.com/allnulled/moduler-v2/blob/main/test/300.001.%20Dependencias%20directas.test.js) tienes un ejemplo de cómo se usarían:

```js
moduler.define({
  name: "dependencias directas",
  requires: [
    { module: 1 },
    { factory: () => 2 },
    { file: "./test/files/file-module-using-require-2.js" },
  ],
  factory: function(d1, d2, d3) {
    return d1 + d2 + d3;
  }
});
moduler.assert(6 === await moduler.load("dependencias directas"), "dependencias directas fallan");
```

### Módulo directo

Igual que a una dependencia puedes referirte con un objeto directo, a un módulo también.

Es decir que en lugar de usar la firma `ModulerV2.prototype.load(id:string)`, puedes usar la firma `ModulerV2.prototype.load(modulo:object)` también.

En el test [300.002. Módulos directos.test.js](https://github.com/allnulled/moduler-v2/blob/main/test/300.002.%20M%C3%B3dulos%20directos.test.js) tienes un ejemplo de cómo se usaría:

```js
moduler.assert(500 === await moduler.load({ factory: () => 500 }), "modulos directos fallan");
```

### Carga y llamada directa a módulo predefinido de tipo función

Para (cargar y) usar módulos previamente definidos de tipo función, tienes el `ModulerV2.prototype.call`.

En el test [300.003. Llamada directa a módulo función.test.js](https://github.com/allnulled/moduler-v2/blob/main/test/300.003.%20Llamada%20directa%20a%20m%C3%B3dulo%20funci%C3%B3n.test.js) hay un ejemplo:

```js
moduler.define({
  name: "funcion/1",
  module: function(a, b) {
    return (this || 0) + a + b;
  }
});

moduler.assert(115 === await moduler.call("funcion/1", [5, 10], 100), "moduler.prototype.call está fallando");
```

Esto evita:

- Polucionar el scope con variables intermedias
   - porque él ya extraerá el módulo función por nosotros
- Cargar el módulo explícitamente
   - porque él ya hace el `await load` internamente.
- Esperar a la promesa retornada (*en `async functions` o no*) cumplirse
   - porque él ya hace el `await result` internamente

Tienes una demostración con función asíncrona en el test [300.004. Llamada directa a módulo función asíncrona.test.js](https://github.com/allnulled/moduler-v2/blob/main/test/300.004.%20Llamada%20directa%20a%20m%C3%B3dulo%20funci%C3%B3n%20as%C3%ADncrona.test.js).

### Carga e instanciación directa de módulo predefinido de tipo clase

Para (cargar e) instanciar módulos previamente definidos de tipo clase, tienes el `ModulerV2.prototype.new`.

En el test [300.005. Instanciación directa de módulo clase.test.js](https://github.com/allnulled/moduler-v2/blob/main/test/300.005.%20Instanciaci%C3%B3n%20directa%20de%20m%C3%B3dulo%20clase.test.js) hay un ejemplo:

```js
moduler.define({
  name: "clase/1",
  module: class {
    constructor(a,b) {
      this.a = a;
      this.b = b;
      this.c = a + b;
    }
  }
});

moduler.assert(15 === (await moduler.new("clase/1", [5, 10])).c, "moduler.prototype.new está fallando");
```

## Uso avanzado - nivel 2

El uso avanzado nivel 2 se caracteriza por orientarse a **features relacionadas con la compilación de código** y no solamente con la modulación.

Para ello se explotará la clase `ModulerV2.Compiler` y otras relacionadas como `ModulerV2.Bundle` o `ModulerV2.Definition`.

### Obtener tu compilador

Los parámetros del compilador por defecto son estos:

```js
// Valor por defecto en node:
const nodeCompiler = new ModulerV2.Compiler(process.cwd());

// Valor por defecto en browser:
const webCompiler = new ModulerV2.Compiler(window.location.protocol +"//"+ window.location.host + window.location.pathname);

// Valor por defecto adaptado al entorno:
const compiler = new ModulerV2.Compiler();
```

### Compilar un js

Compilar un JS es una acción de 2 pasos:

```js
// Paso 1. Empaquetar:
const bundle = await compiler.bundle("path/a/entrada.js");

// Paso 2. Escribir:
await bundle.write({ outputFile: "path/a/salida.js" });

// Y aquí ya puedes importar el módulo:
await compiler.load({ file: "path/a/salida.js" });
```


### Métodos de módulación

Hay distintos métodos de modulación en función del uso posterior que se requiera de ellos. A continuación se explican.

#### Método de modulación codificada

Consiste en inyectar en un fichero **código js crudo** de otro fichero.

Es más performante.

Lo consigues con `inject("ruta/a/modulo.js").as.code()` y compilando con `ModulerV2`.

Los ficheros asociados a este tipo de modulación son: `.frag.js` básicamente.

#### Método de modulación programática

Consiste en inyectar en un fichero **lógica js viva** de otro fichero.

Es menos performante que la modulación codificada, implicas al *runtime* en `fetch/read`.

Pero consigues modulación programática, es decir, esta abstracción de módulo js sí vive en estructuras C++. La codificada vive un momento en el compile-time y como string y ya está.

Esta modulación la consigues con `define({ name:"x", ... })` y luego `await $moduler.load("x")`.

Los ficheros asociados a este tipo de modulación son: `.glos.js`, `.def.js` y `.entry.js`.

Los ficheros js de módulos programáticos deben componerse única y exclusivamente a base de llamadas a `define`:

```js
define({
  name: "Nombre del módulo 1",
  module: "Valor del módulo 1"
});

define({
  name: "Nombre del módulo 2",
  module: "Valor del módulo 2"
});

define({
  name: "Nombre del módulo 3",
  module: "Valor del módulo 3"
});
```

Valen los tipos de módulo que se han comentado antes, pero no todos están soportados/testeados ahora mismo por la compilación.

En el caso de querer una entrada de módulo compilada, usas el formato de `.entry.js`, que es lo mismo pero haciendo `return` de una definición:

```js
define({
  name: "Nombre del módulo 1",
  module: "Valor del módulo 1"
});

define({
  name: "Nombre del módulo 2",
  module: "Valor del módulo 2"
});

return define({
  name: "Entrada de módulo",
  requires: ["Nombre del módulo 1", "Nombre del módulo 2"],
  module: "Entrada de módulo"
});
```

Esto es así porque en el modo de compilación, se necesita conocer qué definición es la entrada concretamente, dado que se admiten ilimitadas definiciones en un mismo fichero, y el `return` nos lo resuelve.

### Ficheros asociados a la modulación

Los principales ficheros asociados a la modulación son los siguientes.

#### Ficheros *.entry.js

Los **ficheros de entrada** o `.entry.js` se caracterizan por ser la entrada de un módulo programático compilado.

Los `.def.js` serían puntos de entrada de módulos programáticos **no compilados**, por otro lado.

Cuando declaras un `.entry.js` estás diciendo que quieres:

- Compilar este fichero con `ModulerV2`
   - Producir un fichero `.glos.js` en el `dist` para este fichero
   - Retornar con `return define(...)` el módulo de entrada que representa este fichero

Así es como luce un fichero de entrada normalmente:

```js
return define({
  name: "example-3/injected",
  factory: function() {
    return {
      uno: inject("test/files/compilables/example-3/injection/mod1.frag.js").as.source(),
      dos: inject("test/files/compilables/example-3/injection/mod2.frag.js").as.string(),
      tres: inject("test/files/compilables/example-3/injection/mod3.frag.js").as.template({ param: 5 }),
      cuatro: inject("test/files/compilables/example-3/injection/mod4.frag.js").as.template({ param: 6 }),
      Clase1: class {
        prop1 = inject("test/files/compilables/example-3/injection/Clase1.prototype.prop1.frag.js").as.source();
        prop2 = inject("test/files/compilables/example-3/injection/Clase1.prototype.prop2.frag.js").as.source();
        prop3 = inject("test/files/compilables/example-3/injection/Clase1.prototype.prop3.frag.js").as.source();
      },
    }
  }
});
```

#### Ficheros *.def.js

Los **ficheros de definiciones** o `.def.js` se caracterizan por ser cabeceras de módulos portables:

- Solo hay llamadas a `define` en el primer nivel del script
- Solo se cargan las cabeceras, que son compatibles con todos los entornos
- Su ventaja es que son **módulos completos** porque son:
   - **módulo node.js**: puede funcionar en node.js
   - **módulo browser**: puede funcionar en browser
   - **módulo compilable:** pueden usarse para compilarse (en compilation time) desde otros `.js`
   - **módulo importable:** pueden usarse para importarse (en runtime) desde otros `.js`
- Esto significa que al marcar un fichero como `.def.js`
   - estás declarando todas estas propiedades en el fichero `.js`
   - estás declarando que es **un fichero humano**
   - estás pidiendo que ese fichero sea copiado en el `dist` del proyecto

De los `.def.js` no se espera que hagan `return define(...)` de ningún módulo concreto, porque no requieren de una entrada como los `.entry.js`.

#### Ficheros *.glos.js

Los **ficheros glosario** o `.glos.js` se caracterizan por ser compilaciones de cabeceras de módulos portables:

- Son ficheros generados por el compilador, nunca por el humano
- Tienen una compilación concreta de definiciones dentro
- Pueden convivir con otros módulos que importen módulos comunes
- Y a la vez, optimizan su carga por centralizar las definiciones.

#### Ficheros *.frag.js

Los **ficheros fragmento** o `.frag.js` se caracterizan porque:

- Son ficheros inyectables:
   - con `inject("ruta").as.source()`
   - con `inject("ruta").as.string()`
   - con `inject("ruta").as.template({ arg1: 1 })`
- Aceptan cualquier texto, no necesariamente JS válido.
- Pensados para modular fragmentos de código:
   - pero *performance-friendly*
   - que no haya que hacer una llamada a buscar un módulo, etc. en runtime
      - que si el entorno lo requiere, se hace
   - pero resolver la modulación en compilation-time y ganar:
      - velocidad en runtime
         - no hay fetch, ni read, ni cache, ni módulos, ni APIs implicadas
         - solo hay una ampliación del código fuente original en tiempo de compilación
         - pero en development-time, tienes un sistema de modulación más
      - compactabilidad del código
         - no mediar la integración con llamadas a APIs
         - no mediar la integración con módulos programáticos
         - simplemente, inyectar código escrito en otro lado
         - resulta en código más compacto, tanto en lectura como en evaluación
      - reusabilidad con flexibilidad
         - seguir teniendo módulos
         - poder usar módulos con formas de código no adscritas al lenguaje
            - reusar auténticos snippets que no son una gramática en JS
            - como patrones de diseño, por ejemplo

Los ficheros fragmento son las piezas de código **harcodeado** y no **programatico** internas de una API.

Puedes reutilizarlo, pero no es la prioridad máxima.

- Con `inject` se pretende dar una fórmula rápida y efectiva de modular a nivel humano.
   - A nivel humano, sí hay una modulación, porque separas el código en ficheros.
   - A nivel máquina, (en runtime) no hay una modulación, porque no se separa el código en ficheros, ni en módulos, ni en nada: es todo la misma pieza.

Un fichero fragmento podría ser tranquilamente:

```js
500
```

O otro típico:

```js
var1 && ((var2 || var3) && (var4 || var5))
```

Y es importante considerar que no es lo mismo poner el `;` del final que no ponerlo, o incluso saltos de línea o espacios, cada byte será fielmente inyectado.

## Uso avanzado - nivel 3

El uso avanzado nivel 3 se caracteriza por orientarse a **features relacionadas con la optimización del código modular**.

### Diferencia entre nivel 2 y nivel 3

Mientras que el **nivel 2** se preocupa por tener módulos:

- compatibles entre sí
- compatibles con los 2 entornos: node y browser
- compatibles con los 2 tiempos: compilación y runtime

En el **nivel 3** se preocupa por tener módulos:

- optimizados para el runtime
- con inyecciones de código *inline*
- orientado a la **modulación en compilación**
   - pero igualmente compatible con **modulación en runtime**

### Inyecciones directas de código

Cualquier fichero que sea leído (`readFile/readUrl` o `load`) por una clase `ModulerV2` tiene automáticamente 1 paso intermedio de inyecciones.

El método clave por el que pasa esto es: `ModulerV2.prototype.makeInjectable`.

Por ejemplo, tienes el test [`Co.002. Puede compilar los inject.test.js`](https://github.com/allnulled/moduler-v2/blob/main/test/Co.002.%20Puede%20compilar%20los%20inject.test.js):

```js
return define({
  name: "example-3/injected",
  factory: function() {
    return {
      uno: inject("test/files/compilables/example-3/injection/mod1.frag.js").as.source(),
      dos: inject("test/files/compilables/example-3/injection/mod2.frag.js").as.string(),
      tres: inject("test/files/compilables/example-3/injection/mod3.frag.js").as.template({ param: 5 }),
    }
  }
});
```

Este ejemplo se retoma luego.

#### Detalles técnicos de las inyecciones directas de código

Este método global `inject` no existe ni se inyecta (`define` sí se inyecta), pero es parseado por el método `makeInjectable` después del `fetch/read` y reemplazado en runtime.

El método `inject`:

- No acepta nada que no sea string
- Solo tiene estas 3 fórmulas: `as.source`, `as.string` y `as.template`
- Los parámetros finales:
   - no es javascript que entienda el contexto
      - es texto que se evaluará como javascript en otro contexto diferente
      - por tanto no encontrará variables del script
   - pero sigue 1 norma léxica:
      - los `(`, `{`, `[` deben cerrarse por orden
      - los `"` también
      - cuando acaben de cerrarse, se cierra el `(` del principio con otr `)`
         - y ahí termina el parseo

## Buenas prácticas

- Guardar módulos programáticos en ficheros de definiciones o `.def.js`
   - donde solo hay `define` dentro
- Guardar entrada de módulo en ficheros de entrada o `.entry.js`
   - donde solo hay `define` dentro
   - donde hace un `return define(...)`
- Guardar módulos inyectables en ficheros fragmento o `.frag.js`
   - como en el ejemplo anterior del test [`Co.002. Puede compilar los inject.test.js`](https://github.com/allnulled/moduler-v2/blob/main/test/Co.002.%20Puede%20compilar%20los%20inject.test.js)
   - los módulos son libres, no es necesaria una fórmula de JavaScript concreta, simplemente texto ya vale
- Identificar rápidamente los ficheros `.glos.js` que son los que interesan en producción

