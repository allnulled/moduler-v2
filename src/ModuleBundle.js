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