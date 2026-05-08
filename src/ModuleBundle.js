const ModuleBundle = class ModuleBundle {

  constructor(modulesMap) {
    Object.assign(this, Object.fromEntries(modulesMap));
  }

  writeModuleFor(moduleDefinition) {
    const source = Object.keys(moduleDefinition).reduce((out, prop) => {
      if(prop.startsWith("@")) return out;
      out[prop] = moduleDefinition[prop];
      return out;
    }, {});
    let js = "";
    js += `define(${ModulerV2.jsify(source)});`;
    return js;
  }

  async write(writeOptionsUser = {}) {
    const writeOptions = Object.assign({}, writeOptionsUser);
    if (writeOptions.outputDir) {
      throw new Error("option «outputDir» not supported yet");
    } else if (writeOptions.outputFile) {
      const sources = Object.values(this).sort((a, b) => {
        return a.order <= b.order ? -1 : 1;
      });
      let js = "";
      for (let index = 0; index < sources.length; index++) {
        const moduleDefinition = sources[index];
        js += this.writeModuleFor(moduleDefinition) + "\n\n";
      }
      js = ModulerV2.jsprettify(js, 0);
      await require("fs").promises.writeFile(writeOptions.outputFile, js, "utf8");
      return js;
    }
    throw new Error("missing «outputFile» or «outputDir» parameter");
  }

};