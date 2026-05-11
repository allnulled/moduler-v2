module.exports = async function (moduler, ModulerV2) {
  // Aquí ya debería funcionar:
  Test_de_see_injection_en_load_directamente: {
    
    const fs = require("fs");
    try {
      await fs.promises.unlink(moduler.resolvePath("test/files/compilations/example-3.glos.js"));
    } catch (error) {}
    
    const mod = await moduler.compile({ file: "test/files/compilables/example-3/injected.entry.js" }, { outputFile: "test/files/compilations/example-3.glos.js" });
    const moduler2 = new ModulerV2(moduler.basedir);
    await moduler2.load({ path: "test/files/compilations/example-3.glos.js" });
    const example3 = await moduler2.load("example-3/injected");
    console.log(example3);

    //*/
  }
}