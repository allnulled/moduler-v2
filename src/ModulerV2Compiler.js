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

  onLoad = this.$createOnLoad({
    
  });



};
