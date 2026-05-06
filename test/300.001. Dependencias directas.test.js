module.exports = async function(moduler) {

  const dependencias = [
      { module: 1 },
      { factory: () => 2 },
      { file: "./test/res/file-module-using-require-2.js" },
    ];
  
  moduler.define({
    name: "dependencias directas",
    requires: dependencias,
    factory: function(d1, d2, d3) {
      return d1 + d2 + d3;
    }
  });

  const it = await moduler.load("dependencias directas");

  moduler.assert(6 === it, "dependencias directas fallan");

};