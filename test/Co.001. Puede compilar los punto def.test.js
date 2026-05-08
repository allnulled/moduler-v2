module.exports = async function (moduler, ModulerV2) {
  Dependencias: {
    require(__dirname + "/../src/thirdparty/beautifier.js");
  }
  const fs = require("fs");
  const path = require("path");
  const projectRoot = path.resolve(__dirname + "/..");
  const compiler = new ModulerV2.Compiler(projectRoot);
  const entry = { file: "test/files/compilables/example-2/main.js" };
  const moduleDefinition = await moduler.load(entry);
  Test_module_definition: {
    moduler.assert(typeof moduleDefinition === "object", "el compilable de example-2/main.js está fallando (punto 1)");
    moduler.assert(moduleDefinition instanceof ModulerV2.Definition, "el compilable de example-2/0.js está fallando (punto 2)");
  }
  Test_module_bundle: {
    const bundle = await compiler.bundle(entry);
    Test_compiler_state: {
      moduler.assert(compiler.modules.size === 4, "el compilable de example-2/main.js está fallando (punto b3)");
      moduler.assert(compiler.modules.get("example-2/main")["@from"] === "@file=test/files/compilables/example-2/main.js", "El @from está fallando, punto b1");
      moduler.assert(compiler.modules.get("example-2/main/0")["@from"] === "@file=test/files/compilables/example-2/0.js", "El @from está fallando, punto b2");
      moduler.assert(compiler.modules.get("example-2/main/1")["@from"] === "@file=test/files/compilables/example-2/1.js", "El @from está fallando, punto b3");
      moduler.assert(compiler.modules.get("example-2/main/2")["@from"] === "@file=test/files/compilables/example-2/2.js", "El @from está fallando, punto b4");
    }
    const testFile = "test/files/compilations/example-2.main.js";
    const outputFile = projectRoot + "/" + testFile;
    try {
      fs.unlinkSync(outputFile);
    } catch (error) {}
    await bundle.write({ outputFile });
    const moduler2 = new ModulerV2({}, projectRoot);
    moduler.assert(moduler2.modules.size === 0, "modules está fallando");
    await moduler2.load({ file: testFile });
    moduler.assert(moduler2.modules.size === 4, "el compilable de example-2/main.js está fallando (punto 3)");
    moduler.assert(moduler2.modules.get("example-2/main")["@from"] === "@file=test/files/compilations/example-2.main.js", "El @from está fallando, c1");
    moduler.assert(moduler2.modules.get("example-2/main/0")["@from"] === "@file=test/files/compilations/example-2.main.js", "El @from está fallando, c2");
    moduler.assert(moduler2.modules.get("example-2/main/1")["@from"] === "@file=test/files/compilations/example-2.main.js", "El @from está fallando, c3");
    moduler.assert(moduler2.modules.get("example-2/main/2")["@from"] === "@file=test/files/compilations/example-2.main.js", "El @from está fallando, c4");
  }
};