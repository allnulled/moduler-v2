module.exports = async function(moduler) {

  moduler.define({
    name: "dependencias directas",
    requires: [
      { module: 1 },
      { factory: () => 2 },
      { file: "./test/res/file-module-using-require-2.js", flavour: "require" },
    ],
    factory: function(d1, d2, d3) {
      return d1 + d2 + d3;
    }
  });

  const it = await moduler.load("dependencias directas");

  moduler.assert(6 === it, "dependencias directas fallan");

};