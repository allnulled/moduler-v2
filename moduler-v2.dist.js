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

  const Environment = {
    isNodejs: (typeof global !== "undefined") && (typeof require !== "undefined") && (typeof process !== "undefined"),
    isBrowser: (typeof window !== "undefined") && (typeof document !== "undefined") && (typeof location !== "undefined"),
  };

  // Clase principal del sistema de módulos
  const ModulerV2 = class ModulerV2 {

    isTracing = false;

    trace(method, args = []) {
      if (!this.isTracing) return;
      console.log(`[trace] ${method} ${[...args].map((arg, i) => i + "=" + typeof arg).join(",")}`);
    }

    static jsonify = function(obj, space = 2) {
      const seen = new WeakSet();
      function walk(value, localKey) {
        if (typeof localKey === "string") {
          if (localKey.startsWith("__") && localKey.endsWith("__")) {
            return `metakey::${localKey}::${typeof value}`;
          }
        }
        // Primitivos
        if (
          value === null ||
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          return value;
        }
        // Objetos
        if (typeof value === "object") {
          if (seen.has(value)) {
            return undefined;
          }
          seen.add(value);
          // Detectar objetos host peligrosos
          const tag = Object.prototype.toString.call(value);
          if (
            tag === "[object Window]" ||
            tag === "[object global]" ||
            tag === "[object Chrome]" ||
            value === globalThis
          ) {
            return { "@type": "host-object", tag };
          }
          const output = Array.isArray(value) ? [] : {};
          let descriptors;
          try {
            descriptors = Object.getOwnPropertyDescriptors(value);
          } catch (e) {
            return { "@type": "uninspectable" };
          }
          for (const key of Object.keys(descriptors)) {
            const desc = descriptors[key];
            // Ignorar getters/setters
            if (desc.get || desc.set) {
              continue;
            }
            try {
              output[key] = walk(desc.value, key);
            } catch (e) {
              output[key] = { $error: "access denied" };
            }
          }
          return output;
        }
        // Funciones
        if (typeof value === "function") {
          let src = '"unavailable"';
          try {
            src = value.toString();
          } catch (e) { }
          return {
            "@type": "function",
            source: src,
            keys: Object.keys(value).join(",")
          };
        }
        return undefined;
      }
      const clean = walk(obj);
      return JSON.stringify(clean, null, space);
    }

    static defaultBasedir = Environment.isNodejs ? process.cwd() : window.location.protocol + "//" + window.location.host + window.location.pathname;

    constructor() {
      this.trace("ModulerV2.constructor");
      this.basedir = this.constructor.defaultBasedir;
      this.modules = new Map(); // Definiciones de módulos: name → config
      this.cache = new Map(); // Cache de resultados finales (o placeholders)
      this.pending = new Map(); // Promises en curso (para evitar ejecuciones duplicadas)
    }

    static env = Environment;

    env = Environment;

    // Assert simple para validaciones internas
    assert(condition, message) {
      if (!condition) throw new Error(message || "assert failed");
    }

    // Define un módulo
    define(options) {
      this.trace("ModulerV2.prototype.define");
      this.assert(typeof options === "object", "only object accepted");
      const { name } = options;
      this.assert(typeof name === "string", "name required");
      // Guarda la definición del módulo
      const moduleDefinition = {
        ...options,
        type: this.getModuleType(options)
      };
      this.modules.set(name, moduleDefinition);
      return new ModuleDefinition(moduleDefinition);
    }

    loadDefinition(options) {
      this.trace("ModulerV2.prototype.loadDefinition");
      if (options.name) {
        this.define(options);
        return this.load(options.name);
      }
      return this.load(options);
    }

    getModuleType(options) {
      return options.module ? "value" :
        options.factory ? "factory" :
          options.file ? "file" :
            options.url ? "url" :
              options.path ? "path" : "value";
    }

    async resolveModule(modulo, dependencies) {
      this.trace("ModulerV2.prototype.resolveModule");
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
        result = await this.loadFile(modulo.file, modulo.arguments || {}, modulo.flavour || "eval");
      } else if (modulo.type === "url") {
        result = await this.loadUrl(modulo.url, modulo.arguments || {});
      } else if (modulo.type === "path") {
        result = await this.loadPath(modulo.path, modulo.arguments);
      } else {
        throw new Error(`module type not recognized: ${modulo.type}`);
      }
      return result;
    }

    $createOnLoad(extra = {}) {
      return {
        complainOnMissingModule: (ctx) => {
          if (ctx.id) {
            this.assert(this.modules.has(ctx.id), `module not found: ${ctx.id}`);
          }
        },
        buildsPrematureModule: (input, ctx) => {
          ctx.modulo = {
            ...input,
            type: this.getModuleType(input)
          };
        },
        resetsIdBasedOnInputTypeObject: (input, ctx) => {
          ctx.id = input.name || false;
        },
        resetsIdBasedOnInputTypeString: (input, ctx) => {
          ctx.id = input;
        },
        hasId: (ctx) => {
          return ctx.id;
        },
        hasIdInCache: (ctx) => {
          return ctx.id && this.cache.has(ctx.id);
        },
        hasIdInPending: (ctx) => {
          return ctx.id && this.pending.has(ctx.id);
        },
        hasIdInModules: (ctx) => {
          return ctx.id && (this.modules.has(ctx.id));
        },
        hasIdAndRequires: (ctx) => {
          return ctx.id && ctx.modulo.requires && ctx.modulo.requires.length;
        },
        initalizePlaceholder: (ctx) => {
          ctx.placeholder = {};
          this.cache.set(ctx.id, ctx.placeholder);
        },
        loadDependencies: (ctx) => {
          return Promise.all((ctx.modulo.requires || []).map(dep => this.load(dep)));
        },
        complainOfInputType: (input) => {
          throw new Error("module id type not accepted (only string and object): " + typeof input);
        },
        getNewContext: (input) => {
          const ctx = {};
          ctx.id = null;
          ctx.modulo = null;
          ctx.promise = null;
          ctx.placeholder = null;
          ctx.input = input;
          return ctx;
        },
        hasGetter: (ctx) => {
          return typeof ctx.modulo.getter === "function";
        },
        applyGetter: (ctx, result) => {
          return ctx.modulo.getter(result, ctx.modulo, this);
        },
        hasPlaceholderAndResultIsObject: (ctx, result) => {
          return ctx.placeholder && result && typeof result === "object";
        },
        cacheResult: (ctx, result) => {
          this.cache.set(ctx.id, result);
        },
        inputIsObject: input => {
          return typeof input === "object";
        },
        inputIsString: input => {
          return typeof input === "string";
        },
        deleteIdFromPending: ctx => {
          this.pending.delete(ctx.id);
        },
        cachePending: ctx => {
          this.pending.set(ctx.id, ctx.promise);
        },
        presetModuleAsObject: (input, ctx) => {
          this.onLoad.resetsIdBasedOnInputTypeObject(input, ctx);
          this.onLoad.buildsPrematureModule(input, ctx);
        },
        promiseModule: async (ctx) => {
          const dependencies = await this.onLoad.loadDependencies(ctx);
          let result = await this.resolveModule(ctx.modulo, dependencies);
          if (this.onLoad.hasGetter(ctx)) result = await this.onLoad.applyGetter(ctx, result);
          if (this.onLoad.hasPlaceholderAndResultIsObject(ctx, result)) return Object.assign(ctx.placeholder, result);
          if (this.onLoad.hasId(ctx)) this.onLoad.cacheResult(ctx, result);
          return result;
        },
        ...extra
      };
    }

    onLoad = this.$createOnLoad();

    // Carga un módulo (core del sistema)
    async load(input, inputCtx = undefined) {
      const ctx = inputCtx || this.onLoad.getNewContext(input);
      // Preparamos el input según su tipo:
      if (this.onLoad.inputIsObject(input)) this.onLoad.presetModuleAsObject(input, ctx);
      else if (this.onLoad.inputIsString(input)) this.onLoad.resetsIdBasedOnInputTypeString(input, ctx);
      else this.onLoad.complainOfInputType(input);
      this.onLoad.complainOnMissingModule(ctx);
      // Retornamos las cachés o en su defecto las inicializamos
      if (this.onLoad.hasIdInCache(ctx)) return this.cache.get(ctx.id);
      if (this.onLoad.hasIdInPending(ctx)) return this.pending.get(ctx.id);
      if (this.onLoad.hasIdInModules(ctx)) ctx.modulo = this.modules.get(ctx.id);
      if (this.onLoad.hasIdAndRequires(ctx)) this.onLoad.initalizePlaceholder(ctx);
      // Gestionamos la resolución del módulo
      ctx.promise = this.onLoad.promiseModule(ctx);
      if (this.onLoad.hasId(ctx)) this.onLoad.cachePending(ctx);
      return await ctx.promise.finally(() => {
        if (this.onLoad.hasId(ctx)) this.onLoad.deleteIdFromPending(ctx);
      });
    }

    // Ejecuta un módulo (tipo función)
    async call(id, args = [], scope = false) {
      const fn = await this.load(id);
      this.assert(typeof fn === "function", "module is not callable");
      const finalArgs = Array.isArray(args) ? args : [args];
      return await (scope ? fn.call(scope, ...finalArgs) : fn(...finalArgs));
    }

    // Crea una instancia de un módulo (tipo clase)
    async new(id, args = []) {
      const clazz = await this.load(id);
      this.assert(typeof clazz === "function", "module is not callable");
      const finalArgs = Array.isArray(args) ? args : [args];
      return new clazz(...finalArgs);
    }

    // Obtener módulo ya cargado (sin async)
    get(id) {
      this.assert(this.cache.has(id), "module not loaded yet");
      return this.cache.get(id);
    }

    readFile(file) {
      return require("fs").promises.readFile(file, "utf8");
    }

    readUrl(url) {
      return fetch(url).then(res => res.text());
    }

    readPath(path) {
      return this.env.isNodejs ? this.readFile(path) : this.readUrl(path);
    }

    resolvePath(subpath) {
      // Respect absolute paths (in linux):
      if (subpath.startsWith("/")) return subpath;
      // Respect absolute paths (in windows):
      if (/^(?:[a-zA-Z]:[\\/]|\\\\)[^<>:"|?*\n]+$/g.test(subpath)) return subpath;
      // Compose relative path otherwise:
      return (this.basedir ? this.basedir : "") + "/" + subpath;
    }

    loadFile(fileInput, parameters = {}, flavour = "eval") {
      this.assert(typeof fileInput === "string", "file must be string");
      this.assert(typeof parameters === "object", "parameters must be object");
      this.assert(typeof flavour === "string", "flavour must be string");
      const file = this.resolvePath(fileInput);
      if (flavour === "require") {
        return require(file);
      } else if (flavour === "import") {
        return import(file);
      } else if (flavour === "eval") {
        return this.readFile(file).then(code => this.evaluateAsync(code, parameters, `@file = ${file}`));
      }
      throw new Error("flavour must be known");
    }

    async loadUrl(urlInput, parameters = {}) {
      this.assert(typeof urlInput === "string", "url must be string");
      this.assert(typeof parameters === "object", "parameters must be object");
      const url = this.resolvePath(urlInput);
      return this.readUrl(url).then(code => this.evaluateAsync(code, parameters, `@url = ${url}`));
    }

    loadPath(path, parameters = {}) {
      this.assert(typeof path === "string", "path must be string");
      this.assert(typeof parameters === "object", "parameters must be object");
      return this.env.isNodejs ? this.loadFile(path) : this.loadUrl(path);
    }

    safeWrap(code, traceHelp) {
      if(!traceHelp) {
        return code;
      }
      return `try { ${code} } catch(error) { console.log(${JSON.stringify("Error on eval of: " + traceHelp)}); throw error; }`;
    }

    evaluateAsync(code, parametersInput = {}, traceHelp = false) {
      this.assert(typeof code === "string", "code must be string");
      this.assert(typeof parametersInput === "object", "parameters must be object");
      const parameters = { $moduler: this, ...parametersInput };
      const AsyncFunction = (async function () { }).constructor;
      const asyncFunction = new AsyncFunction(...Object.keys(parameters), this.safeWrap(code, traceHelp));
      // console.log(this.safeWrap(code));
      return asyncFunction(...Object.values(parameters));
    }

    evaluateSync(code, parametersInput = {}, traceHelp = false) {
      this.assert(typeof code === "string", "code must be string");
      this.assert(typeof parametersInput === "object", "parameters must be object");
      const parameters = { $moduler: this, ...parametersInput };
      const syncFunction = new Function(...Object.keys(parameters), this.safeWrap(code, traceHelp));
      // console.log(this.safeWrap(code));
      return syncFunction(...Object.values(parameters));
    }

  };

  const ModuleDefinition = class {
  
    constructor(props) {
      this.$type = "ModuleDefinition";
      Object.assign(this, props);
    }
  
  };
  const ModuleBundle = class ModuleBundle {
  
    constructor(modulesMap) {
      Object.assign(this, Object.fromEntries(modulesMap));
    }
  
    async write(writeOptionsUser = {}) {
      const writeOptions = Object.assign({}, writeOptionsUser);
      console.log(writeOptions);
      return undefined;
    }
  
  };
  const ModulerV2Compiler = class ModulerV2Compiler extends ModulerV2 {
  
    constructor(basedir = this.constructor.defaultBasedir, compilerOptions = {}) {
      super(basedir);
      Object.assign(this, compilerOptions);
    }
  
    async bundle(target, bundleOptions = {}) {
      const definition = await this.load(target);
      this.assert(definition instanceof ModuleDefinition, "entry target must return instance of ModuleDefinition on «ModulerV2Compiler.prototype.bundle»");
      await this.load(definition.name);
      return new ModuleBundle(this.modules);
    }
  
  };
  

  ModulerV2.Compiler = ModulerV2Compiler;
  ModulerV2.Bundle = ModuleBundle;
  ModulerV2.Definition = ModuleDefinition;

  // Export del sistema
  return { Environment, ModulerV2, ModulerV2Compiler, ModuleBundle };

});