# moduler-v2

Módulos programáticos en JavaScript (nodejs o browser).

## Índice

- [moduler-v2](#moduler-v2)
  - [Índice](#índice)
  - [Instalación](#instalación)
  - [Uso](#uso)
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
  - [Ejemplos](#ejemplos)

## Instalación

Solo tienes que:

- Importar el fichero [`moduler-v2.js`](https://github.com/allnulled/moduler-v2/blob/main/moduler-v2.js)
- Acceder a [`ModulerV2`](https://github.com/allnulled/moduler-v2/blob/main/moduler-v2.js#L23).

## Uso

Principalmente se trataría de:

- crear módulos
- cargar módulos (asíncrono)
- acceder módulos

Pero también se puede:

- crear un modulador

### Crear un modulador

Con cada instancia de modulador tienes un nombre de espacios de módulos cerrado:

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

El básico: lo que pongasm es el módulo.

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

Si es un recurso que no usa el modulador pero querrías, como cualquier recurso de terceros normal, puedes usar el `getter` a modo de adaptador.

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

Si es un recurso que no usa `require/module.exports` sino `import/export`, tienes el flag de `flavour="import"` para especificarlo.

Si es un recurso que directamente es un fragmento de código que devuelve algo con un `return`, tienes el flag de `flavour="eval"` para especificarlo, nótese que admiten `await` en el scope inmediato.

En cualquier caso, tienes el `getter` a modo de adaptador también.

Las rutas son relativas al método en cada caso: `require`, `import` o `new AsyncFunction` en caso de `eval`.

### Módulo tipo: path

Este tipo se completará como uno de estos métodos, en este orden: (1) como `file + require` o (2) como `url`.

```js
modulador.define({
    name: "tipo file",
    path: "src/a/modulo-es6.js",
    getter: function(imported) {
        return imported.default;
    }
});
```

Las rutas son relativas al método de importación que se termine usando.

## Ejemplos

Los tests están en [`test/*.test.js`](https://github.com/allnulled/moduler-v2/tree/main/test).

