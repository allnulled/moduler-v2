__SOURCE_FROM__("src/ModulerV2Bundle.js");

const ModulerV2Compiler = class ModulerV2Compiler {

  constructor(compilerOptions = {}) {
    Object.assign(this, compilerOptions);
    this.assert(this.moduler instanceof ModulerV2, "required «moduler» instance of «ModulerV2»");
  }

  assert(condition, message) {
    if (!condition) throw new Error(message || "assert failed");
  }

  bundle(target, bundleOptionsUser = {}) {
    return new ModulerV2Bundle(Object.assign({ target }, bundleOptionsUser));
  }

};
