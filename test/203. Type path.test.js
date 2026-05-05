module.exports = async function(moduler) {
  
  moduler.define({
    name: "tipo path",
    path: `./test/res/path-module.js`,
  });

  const it = await moduler.load("tipo path");
  
  moduler.assert(typeof it !== "undefined", "modulo tipo path (en nodejs) falla");
  moduler.assert(it === 30, "modulo tipo path (en nodejs) falla");

};