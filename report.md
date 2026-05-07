# src/ModulerV2.js

## Lines 95-117

```js
  95 |     async resolveModule(ctx, dependencies) {
  96 |       this.trace("ModulerV2.prototype.resolveModule");
  97 |       const modulo = ctx.modulo;
  98 |       let result = undefined;
  99 |       if (modulo.type === "value") {
 100 |         result = modulo.module;
 101 |       } else if (modulo.type === "factory") {
 102 |         result = modulo.factory(...dependencies);
 103 |         Espera_si_factory_devuelve_promise:
 104 |         if (result instanceof Promise) {
 105 |           result = await result;
 106 |         }
 107 |       } else if (modulo.type === "file") {
 108 |         result = await this.loadFile(modulo.file, modulo.arguments || {}, modulo.flavour || "eval", ctx);
 109 |       } else if (modulo.type === "url") {
 110 |         result = await this.loadUrl(modulo.url, modulo.arguments || {}, ctx);
 111 |       } else if (modulo.type === "path") {
 112 |         result = await this.loadPath(modulo.path, modulo.arguments, ctx);
 113 |       } else {
 114 |         throw new Error(`module type not recognized: ${modulo.type}`);
 115 |       }
 116 |       return result;
 117 |     }
```
