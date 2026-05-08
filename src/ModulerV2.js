(function (factory) {
  // Ejecuta la factory que devuelve el módulo
  const mod = factory();
  // Soporte navegador (window global)
  if (typeof window !== 'undefined') {
    window['ModulerV2Toolkit'] = mod;
  }
  // Soporte Node.js (global)
  if (typeof global !== 'undefined') {
    global['ModulerV2Toolkit'] = mod;
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

    static jsonify = __SOURCE_FROM__("src/jsonify.js",1);
    
    static jsify = __SOURCE_FROM__("src/jsify.js",1);
    
    static jsprettify = __SOURCE_FROM__("src/jsprettify.js",1);

    static evalify = function(jsified) {
      return eval(`(() => { return ${jsified}; })()`);
    }

    static defaultBasedir = Environment.isNodejs ? process.cwd() : window.location.protocol + "//" + window.location.host + window.location.pathname;

    constructor(overriders = false, basedir = false) {
      this.trace("ModulerV2.constructor");
      this.basedir = basedir || this.constructor.defaultBasedir;
      this.modules = new Map(); // Definiciones de módulos: name → config
      this.cache = new Map(); // Cache de resultados finales (o placeholders)
      this.pending = new Map(); // Promises en curso (para evitar ejecuciones duplicadas)
      this.counter = 0;
      if(overriders) {
        Object.assign(this, overriders);
      }
    }

    increaseCounter() {
      return this.counter++;
    }

    static env = Environment;

    env = Environment;

    static assert(condition, message) {
      if (!condition) throw new Error(message || "assert failed");
    }

    // Assert simple para validaciones internas
    assert(condition, message) {
      if (!condition) throw new Error(message || "assert failed");
    }

    fulfill(options) {
      if(options.name && this.modules.has(options.name)) {
        return this.modules.get(options.name);
      }
      return this.define(options);
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
        "@type": this.getModuleType(options),
        "@order": this.increaseCounter(),
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

    async resolveModule(ctx, dependencies) {
      this.trace("ModulerV2.prototype.resolveModule");
      const modulo = ctx.modulo;
      const moduleType = modulo["@type"];
      let result = undefined;
      if (moduleType === "value") {
        result = modulo.module;
      } else if (moduleType === "factory") {
        result = modulo.factory(...dependencies);
        Espera_si_factory_devuelve_promise:
        if (result instanceof Promise) {
          result = await result;
        }
      } else if (moduleType === "file") {
        result = await this.loadFile(modulo.file, modulo.arguments || {}, modulo.flavour || "eval", ctx);
      } else if (moduleType === "url") {
        result = await this.loadUrl(modulo.url, modulo.arguments || {}, ctx);
      } else if (moduleType === "path") {
        result = await this.loadPath(modulo.path, modulo.arguments, ctx);
      } else {
        throw new Error(`module type not recognized: ${moduleType}`);
      }
      return result;
    }

    deduceRef(input) {
      if(input.name) {
        return input.name;
      }
      const inputType = this.getModuleType(input);
      if(inputType === "path") {
        return `@path=${input.path}`;
      }
      if(inputType === "file") {
        return `@file=${input.file}`;
      }
      if(inputType === "url") {
        return `@url=${input.url}`;
      }
      if(inputType === "factory") {
        return `@factory=${this.getRandomUid(10)}`;
      }
      // console.log(inputType);
      return `@${inputType}=${this.getRandomUid(10) || input[inputType]}`;
    }

    getRandomUidChar(alphabet = "abcdefghijklmnopqrstuv0123456789") {
      return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    getRandomUid(len = 10) {
      let out = "";
      while(out.length < len) {
        out += this.getRandomUidChar();
      }
      return out;
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
            "@type": this.getModuleType(input)
          };
        },
        resetsIdBasedOnInputTypeObject: (input, ctx) => {
          ctx.id = null;
          ctx.ref = this.deduceRef(input);
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
          let result = await this.resolveModule(ctx, dependencies);
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

    resolveRelativePath(subpath) {
      return this.resolvePath(subpath).replace(this.basedir, "").replace(/^\//g, "");
    }

    loadFile(fileInput, parameters = {}, flavour = "eval", ctx = null) {
      this.assert(typeof fileInput === "string", "file must be string");
      this.assert(typeof parameters === "object", "parameters must be object");
      this.assert(typeof flavour === "string", "flavour must be string");
      const file = this.resolvePath(fileInput);
      if (flavour === "require") {
        return require(file);
      } else if (flavour === "import") {
        return import(file);
      } else if (flavour === "eval") {
        return this.readFile(file).then(code => this.evaluateAsync(code, parameters, {
          whoInCharge: `@file=${this.resolveRelativePath(file)}`,
          whoInCharge2: ctx && ctx.id ? `@file=${this.resolveRelativePath(ctx.id)}` : null,
        }));
      }
      throw new Error("flavour must be known");
    }

    async loadUrl(urlInput, parameters = {}, ctx = null) {
      this.assert(typeof urlInput === "string", "url must be string");
      this.assert(typeof parameters === "object", "parameters must be object");
      const url = this.resolvePath(urlInput);
      return this.readUrl(url).then(code => this.evaluateAsync(code, parameters, {
        whoInCharge: `@url=${this.resolveRelativePath(url)}`,
      }));
    }

    loadPath(path, parameters = {}, ctx = null) {
      this.assert(typeof path === "string", "path must be string");
      this.assert(typeof parameters === "object", "parameters must be object");
      return this.env.isNodejs ? this.loadFile(path) : this.loadUrl(path);
    }

    safeWrap(code, whoInCharge) {
      if(!whoInCharge) {
        return code;
      }
      return `try { ${code} } catch(error) { console.log(${JSON.stringify("Error on eval of: " + whoInCharge)}); throw error; }`;
    }

    evaluateAsync(code, parametersInput = {}, options = {}) {
      this.assert(typeof code === "string", "code must be string");
      this.assert(typeof parametersInput === "object", "parameters must be object");
      this.assert(typeof options === "object", "options must be object");
      const { whoInCharge = false } = options;
      const parameters = { $moduler: this, define: this.newDefine(whoInCharge), ...parametersInput };
      const AsyncFunction = (async function () { }).constructor;
      const asyncFunction = new AsyncFunction(...Object.keys(parameters), this.safeWrap(code, whoInCharge));
      // console.log(this.safeWrap(code));
      return asyncFunction(...Object.values(parameters));
    }

    newDefine(id) {
      return (options) => {
        options["@from"] = id;
        return this.define(options);
      };
    }

  };

  __SOURCE_FROM__("src/ModuleDefinition.js");
  __SOURCE_FROM__("src/ModuleBundle.js");
  __SOURCE_FROM__("src/ModulerV2Compiler.js");
  __SOURCE_FROM__("src/FileWatcher.js");

  ModulerV2.Compiler = ModulerV2Compiler;
  ModulerV2.Bundle = ModuleBundle;
  ModulerV2.Definition = ModuleDefinition;
  ModulerV2.FileWatcher = FileWatcher;

  // Export del sistema
  return { Environment, ModulerV2, ModulerV2Compiler, ModuleBundle, FileWatcher };

});