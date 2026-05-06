module.exports = async function(moduler) {
  const compiler = moduler.newCompiler();
  compiler.moduler.basedir = __dirname + "/res/compilables";
  const entries = ["example-1.def.js"];
  for(let index=0; index<entries.length; index++) {
    const entry = entries[index];
    const bundle = await compiler.bundle({ input: entry });
    await bundle.write({ outputDir: __dirname + "/res/compilations" });
  }
};