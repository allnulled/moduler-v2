(function (factory) {
  // Ejecuta la factory que devuelve el módulo
  const mod = factory();

  // Soporte navegador (window global)
  if (typeof window !== 'undefined') {
    window['ModulerV2'] = mod;
  }

  // Soporte Node.js (global)
  if (typeof global !== 'undefined') {
    global['ModulerV2'] = mod;
  }

  // Soporte CommonJS (require)
  if (typeof module !== 'undefined') {
    module.exports = mod;
  }

})(function () {

  // Clase principal del sistema de módulos
  const ModulerV2 = class Moduler {

    constructor() {
      // Definiciones de módulos: name → config
      this.modules = new Map();

      // Cache de resultados finales (o placeholders)
      this.cache = new Map();

      // Promises en curso (para evitar ejecuciones duplicadas)
      this.pending = new Map();
    }

    // Assert simple para validaciones internas
    assert(cond, msg) {
      if (!cond) throw new Error(msg || "assert failed");
    }

    // Define un módulo
    define(options) {
      this.assert(typeof options === "object", "only object accepted");
      const { name } = options;
      this.assert(typeof name === "string", "name required");
      // Guarda la definición del módulo
      this.modules.set(name, {
        ...options,
        type: options.module ? "value" :
          options.factory ? "factory" :
          options.file ? "file" :
          options.url ? "url" :
          options.path ? "path" :
          "value"
      });
    }

    // Carga un módulo (core del sistema)
    async load(id) {

      // Validar que el módulo existe
      this.assert(this.modules.has(id), `module not found: ${id}`);

      // 1. Si ya está en cache → devolver directamente
      // (puede ser valor final o placeholder)
      if (this.cache.has(id)) {
        return this.cache.get(id);
      }

      // 2. Si ya se está cargando → devolver misma Promise
      // (evita ejecutar dos veces en paralelo)
      if (this.pending.has(id)) {
        return this.pending.get(id);
      }

      const mod = this.modules.get(id);

      // 🔥 Placeholder SOLO si hay dependencias
      // Esto permite soportar ciclos sin romper
      let placeholder = null;

      if (mod.requires && mod.requires.length) {
        placeholder = {};

        // Se guarda ANTES de resolver deps
        // → clave para romper ciclos
        this.cache.set(id, placeholder);
      }

      // Creamos la Promise de carga
      const promise = (async () => {

        // 3. Resolver dependencias en paralelo
        const deps = await Promise.all(
          (mod.requires || []).map(dep => this.load(dep))
        );

        let result;

        // 4. Resolver el módulo
        if (mod.type === "value") {
          // Valor directo
          result = mod.module;
        } else if(mod.type === "factory") {
          // Ejecutar factory con deps
          result = mod.factory(...deps);
          // Soporte async factories
          if (result instanceof Promise) {
            result = await result;
          }
        } else if(mod.type === "file") {
          result = await this.loadFile(mod.file, mod.arguments || {}, mod.flavour || "require");
        } else if(mod.type === "url") {
          result = await this.loadUrl(mod.url, mod.arguments || {});
        } else if(mod.type === "path") {
          result = await this.loadPath(mod.path, mod.arguments);
        } else {
          throw new Error(`module type not recognized: ${mod.type}`);
        }

        // 4.1. Aplicar el getter del módulo, si provee:
        if(typeof mod.getter === "function") {
          result = await mod.getter(result, mod, this);
        }

        // 5. Si hay placeholder y el resultado es objeto
        // → lo rellenamos (para mantener referencia en ciclos)
        if (placeholder && result && typeof result === "object") {
          Object.assign(placeholder, result);
          return placeholder;
        }

        // 6. Si no, guardamos resultado final directamente
        this.cache.set(id, result);
        return result;

      })();

      // 7. Guardamos promise en pending (clave para concurrencia)
      this.pending.set(id, promise);

      try {
        // 8. Esperamos resultado
        return await promise;
      } finally {
        // 9. Limpiamos pending cuando termina (éxito o error)
        this.pending.delete(id);
      }
    }

    // Ejecuta un módulo como función
    async call(id, arg) {
      const fn = await this.load(id);

      // Validar que es callable
      this.assert(typeof fn === "function", "module is not callable");

      return fn(arg);
    }

    // Obtener módulo ya cargado (sin async)
    get(id) {
      this.assert(this.cache.has(id), "module not loaded yet");
      return this.cache.get(id);
    }

    loadFile(file, parameters = {}, flavour = "require") {
      this.assert(typeof file === "string", "file must be string");
      this.assert(typeof parameters === "object", "parameters must be object");
      this.assert(typeof flavour === "string", "flavour must be string");
      if(flavour === "require") {
        return require(file);
      } else if(flavour === "import") {
        return import(file);
      } else if(flavour === "eval") {
        return require("fs").promises.readFile(file, "utf8").then(code => this.evaluateAsync(code));
      }
      throw new Error("flavour must be known");
    }

    async loadUrl(url, parameters = {}) {
      this.assert(typeof url === "string", "url must be string");
      this.assert(typeof parameters === "object", "parameters must be object");
      return fetch(url).then(res => res.text()).then(code => this.evaluateAsync(code, parameters));
    }

    async loadPath(path, parameters = {}) {
      this.assert(typeof path === "string", "path must be string");
      this.assert(typeof parameters === "object", "parameters must be object");
      if(typeof global !== "undefined") return this.loadFile(path, parameters);
      return this.loadUrl(path, parameters);
    }

    evaluateAsync(code, parameters = {}) {
      this.assert(typeof code === "string", "code must be string");
      this.assert(typeof parameters === "object", "parameters must be object");
      const AsyncFunction = (async function() {}).constructor;
      const asyncFunction = new AsyncFunction(...Object.keys(parameters), code);
      return asyncFunction(...Object.values(parameters));
    }

    evaluateSync(code, parameters = {}) {
      this.assert(typeof code === "string", "code must be string");
      this.assert(typeof parameters === "object", "parameters must be object");
      const syncFunction = new Function(...Object.keys(parameters), code);
      return syncFunction(...Object.values(parameters));
    }

  };

  // Export del sistema
  return { ModulerV2 };

});