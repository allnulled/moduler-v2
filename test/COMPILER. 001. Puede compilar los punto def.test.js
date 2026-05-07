module.exports = async function (moduler, ModulerV2) {
  const path = require("path");
  const projectRoot = path.resolve(__dirname + "/..");
  const executeTests = async function (entries) {
    for (let index = 0; index < entries.length; index++) {
      const [entry, bundleTest] = entries[index];
      const compiler = new ModulerV2.Compiler(projectRoot);
      const moduleDefinition = await moduler.load(entry);
      const bundle = await compiler.bundle(entry);
      try {
        await bundleTest(bundle, moduleDefinition, compiler);
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  };
  const entries = [
    /*
    [{ file: "test/res/compilables/example-1/demo-1.def.js" }, function (bundle, value) {
      moduler.assert(typeof value === "object", "el compilable de example-1/demo-1.def.js está fallando (punto 1)");
      moduler.assert(value.m2req === 100, "el compilable de example-1/demo-2.req.js está fallando (punto 2)");
      moduler.assert(value.m3imp === 300, "el compilable de example-1/demo-3.imp.mjs está fallando (punto 3)");
      moduler.assert(value.m4ret === 400, "el compilable de example-1/demo-4.ret.js está fallando (punto 4)");
      moduler.assert(value.m5def === 500, "el compilable de example-1/demo-5.def.js está fallando (punto 5)");
      moduler.assert(value.result === 1300, "el compilable de example-1.def.js está fallando (punto 6)");
    }],
    //*/
    [{ file: "test/res/compilables/example-2/main.js" }, async function (bundle, moduleDefinition, compiler) {
      moduler.assert(typeof moduleDefinition === "object", "el compilable de example-2/main.js está fallando (punto 1)");
      moduler.assert(moduleDefinition instanceof ModulerV2.Definition, "el compilable de example-2/0.js está fallando (punto 2)");
      console.log(await bundle.write({ outputFile: __dirname + "/res/compilations/example-2.main.js" }));
      // console.log(await bundle.write({ outputFile: __dirname + "/res/compilations/example-2.main.js" }));
      // console.log(bundle);
      // console.log(ModulerV2.jsonify(bundle));
      /*
      console.log("definition:", ModulerV2.jsonify(moduleDefinition));
      console.log(bundle);
      console.log(bundle.modules);
      //*/
      // await bundle.write({ outputDir: __dirname + "/res/compilations" });
      // const value = await compiler.load(moduleDefinition.name);
    }]
  ];
  await executeTests(entries);
};