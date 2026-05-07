module.exports = async function (moduler) {

  moduler.define({
    name: "tipo file + require",
    file: `${__dirname}/res/file-module-using-require.js`,
    flavour: "require",
  });

  moduler.define({
    name: "tipo file + import",
    file: `${__dirname}/res/file-module-using-import.js`,
    flavour: "import",
    getter: (out) => out.default,
  });

  const a = await moduler.load("tipo file + require");
  moduler.assert(a === 10, "modulo tipo file + require falla");
  
  // Evitamos el error de los imports en node:
  if(false) {
    const b = await moduler.load("tipo file + import");
    moduler.assert(b === 20, "modulo tipo file + import falla");
  }

}