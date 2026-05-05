module.exports = async function (moduler) {

  moduler.define({
    name: "A",
    module: 2
  });

  moduler.define({
    name: "B",
    module: 3
  });

  moduler.define({
    name: "C",
    requires: ["A", "B"],
    factory: (a, b) => a + b
  });

  const result = await moduler.load("C");

  moduler.assert(result === 5, "deps no resueltas correctamente");
};