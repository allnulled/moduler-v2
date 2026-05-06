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
    assert(condition, message) {
      if (!condition) throw new Error(message || "assert failed");
    }

    // Define un módulo
    define(options) {
      this.assert(typeof options === "object", "only object accepted");
      const { name } = options;
      this.assert(typeof name === "string", "name required");
      // Guarda la definición del módulo
      this.modules.set(name, {
        ...options,
        type: this.getModuleType(options)
      });
    }

    getModuleType(options) {
      return options.module ? "value" :
        options.factory ? "factory" :
          options.file ? "file" :
            options.url ? "url" :
              options.path ? "path" : "value";
    }

    async resolveModule(modulo, dependencies) {
      let result = undefined;
      if (modulo.type === "value") {
        result = modulo.module;
      } else if (modulo.type === "factory") {
        result = modulo.factory(...dependencies);
        Espera_si_factory_devuelve_promise:
        if (result instanceof Promise) {
          result = await result;
        }
      } else if (modulo.type === "file") {
        result = await this.loadFile(modulo.file, modulo.arguments || {}, modulo.flavour || "require");
      } else if (modulo.type === "url") {
        result = await this.loadUrl(modulo.url, modulo.arguments || {});
      } else if (modulo.type === "path") {
        result = await this.loadPath(modulo.path, modulo.arguments);
      } else {
        throw new Error(`module type not recognized: ${modulo.type}`);
      }
      return result;
    }

    // Carga un módulo (core del sistema)
    async load(input) {
      let id, modulo, placeholder = null, promise;
      Gestiona_tipos_no_string:
      if (typeof input === "object") {
        Sin_id: {
          id = false;
        }
        Construye_el_modulo_y_continua_el_flujo_padre: {
          modulo = {
            ...input,
            type: this.getModuleType(input)
          };
        }
      } else if (typeof input === "string") {
        id = input;
      } else {
        throw new Error("module id type not accepted: " + typeof input);
      }
      Comprueba_modulo_existe:
      if (id) {
        this.assert(this.modules.has(id), `module not found: ${id}`);
      }
      Retorna_cacheo_si_eso:
      if (id && this.cache.has(id)) {
        return this.cache.get(id);
      }
      Retorna_pendiende_si_eso:
      if (id && this.pending.has(id)) {
        return this.pending.get(id);
      }
      Obtiene_modulo:
      if (id) {
        modulo = this.modules.get(id);
      }
      Polifilea_cache_tempranamente_con_un_placeholder:
      if (id && modulo.requires && modulo.requires.length) {
        placeholder = {};
        this.cache.set(id, placeholder);
      }
      Inicio_de_accion_de_carga_de_modulo: {
        promise = (async () => {
          let dependencies, result;
          Carga_dependencias: {
            dependencies = await Promise.all(
              (modulo.requires || []).map(dep => this.load(dep))
            );
          }
          Resuelve_el_modulo_segun_tipo: {
            result = await this.resolveModule(modulo, dependencies);
          }
          Aplica_getter_si_eso:
          if (typeof modulo.getter === "function") {
            result = await modulo.getter(result, modulo, this);
          }
          Polifilea_placeholder_si_es_objeto_y_retorna:
          if (placeholder && result && typeof result === "object") {
            Object.assign(placeholder, result);
            return placeholder;
          }
          Cachea_resultado_y_retorna:
          if (id) {
            this.cache.set(id, result);
          }
          return result;
        })();
      }
      Cachea_promise_de_modulo_en_pending:
      if (id) {
        this.pending.set(id, promise);
      }
      try {
        Retorna_promise_resuelta: {
          return await promise;
        }
      } finally {
        Elimina_de_pending_al_modulo:
        if (id) {
          this.pending.delete(id);
        }
      }
    }

    // Ejecuta un módulo como función
    async call(id, arg) {
      // Cargar módulo
      const fn = await this.load(id);
      // Validar que es callable
      this.assert(typeof fn === "function", "module is not callable");
      // Retornar llamada resuelta al módulo  con argumentos
      return await fn(arg);
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
      if (flavour === "require") {
        return require(file);
      } else if (flavour === "import") {
        return import(file);
      } else if (flavour === "eval") {
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
      if (typeof global !== "undefined") return this.loadFile(path, parameters);
      return this.loadUrl(path, parameters);
    }

    evaluateAsync(code, parameters = {}) {
      this.assert(typeof code === "string", "code must be string");
      this.assert(typeof parameters === "object", "parameters must be object");
      const AsyncFunction = (async function () { }).constructor;
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