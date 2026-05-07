const ModuleBundle = class ModuleBundle {

  constructor(modulesMap) {
    Object.assign(this, Object.fromEntries(modulesMap));
  }

  writeModuleFor(source) {
    let js = "";
    js += `define(${ModulerV2.jsonify(source)});`;
    return js;
  }

  async write(writeOptionsUser = {}) {
    const writeOptions = Object.assign({}, writeOptionsUser);
    console.log(this);
    if(writeOptions.outputDir) {
      throw new Error("option «outputDir» not supported yet");
    } else if(writeOptions.outputFile) {
      const sources = Object.values(this).sort((a, b) => {
        return a.order <= b.order ? -1 : 1;
      });
      let js = "";
      for(let index=0; index<sources.length; index++) {
        const source = sources[index];
        js += this.writeModuleFor(source) + "\n\n";
      }
      await require("fs").promises.writeFile(writeOptions.outputFile, js, "utf8");
      return js;
    }
    throw new Error("missing «outputFile» or «outputDir» parameter");
  }

};