const FileWatcher = class {

  static assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  static basic(options = {}) {
    this.assert(typeof options === "object", "options must be object");
    this.assert(typeof options.path === "string", "options.path must be string");
    this.assert(typeof options.callback === "function", "options.callback must be function");
    const { path, callback } = options;
    const instanze = {};
    instanze.watcher = require("chokidar").watch(path, {
      ignoreInitial: true,
      ...options.chokidar || {}
    });
    instanze.watcher.on("all", async (event, file) => {
      const info = {
        event,
        file,
        relfile: file.replace(path, ""),
        watcher: instanze.watcher,
        options,
      };
      Apply_middlewares:
      if (options.middlewares) {
        this.assert(Array.isArray(options.middlewares), "options.middlewares must be array");
        if (!options.middlewares.length) {
          break Apply_middlewares;
        }
        for (let index = 0; index < options.middlewares.length; index++) {
          const middleware = options.middlewares[index];
          const result = await middleware(info);
          if (result instanceof AbortController) {
            return;
          }
        }
      }
      await callback(info);
    });
    instanze.close = () => instanze.watcher.close();
    instanze.ready = new Promise(resolve => {
      instanze.watcher.on("ready", resolve);
    });
    if(options.onStart) {
      options.onStart(options);
    }
    return instanze;
  }

  static tasks = class {
    
    static async makeSemaphorable(options) {
      const fs = require("fs");
      const path = require("path");
      const semaphorePath = path.resolve(options.path, ".filewatcher.sem");
      await fs.promises.writeFile(semaphorePath, "opened", "utf8");
    }

  }

  static middlewares = class {

    static openSemaphoreEffect() {
      return async function ({ relfile, event, options }) {
        const fs = require("fs");
        const path = require("path");
        const semaphorePath = path.resolve(options.path, ".filewatcher.sem");
        await fs.promises.writeFile(semaphorePath, "opened", "utf8");
      };
    }

    static closeSemaphoreEffect() {
      return async function ({ relfile, event, options }) {
        if(relfile === "/.filewatcher.sem") {
          return new AbortController("interrupt");
        }
        const fs = require("fs");
        const path = require("path");
        const semaphorePath = path.resolve(options.path, ".filewatcher.sem");
        let currentState;
        try {
          currentState = await fs.promises.readFile(semaphorePath, "utf8");
        } catch (error) {
          if (error.code === "ENOENT") {
            await fs.promises.writeFile(semaphorePath, "opened", "utf8");
            currentState = "opened";
          } else {
            throw error;
          }
        }
        if (currentState === "closed") {
          return new AbortController("interrupt");
        }
        await fs.promises.writeFile(semaphorePath, "closed", "utf8");
      };
    }

    static rollupEffect() {
      return async function ({ relfile, event, options }) {
        console.log("rollup effect from", event, relfile);
        await new Promise((resolve, reject) => { setTimeout(resolve, 1000); });
      };
    }

    static onTouchEffect() {
      return async function ({ relfile, event, options }) {
        console.log("onTouch effect from", event, relfile);
        await new Promise((resolve, reject) => { setTimeout(resolve, 1000); });
      }
    }

    static wait(ms) {
      return () => new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    }

  }

};