# moduler-v2

Módulos programáticos en JavaScript no opinionado.

## Índice

- [moduler-v2](#moduler-v2)
  - [Índice](#índice)
  - [Instalación](#instalación)
  - [Uso](#uso)
    - [Crear un modulador](#crear-un-modulador)
    - [Definir un módulo](#definir-un-módulo)
    - [Cargar un módulo](#cargar-un-módulo)
    - [Acceder un módulo](#acceder-un-módulo)
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
    module: function() {
        return 200;
    }
});
modulador.define({
    name: "object 3",
    module: async function() {
        await new Promise(resolve => { setTimeout(resolve, 1000); });
        return 300;
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

## Ejemplos

Los tests están en [`test/*.test.js`](https://github.com/allnulled/moduler-v2/tree/main/test).

