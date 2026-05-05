module.exports = async function (moduler) {

  moduler.define({
    name: "base",
    module: 10
  });

  moduler.define({
    name: "async-dep",
    requires: ["base"],
    factory: async (base) => {
      await new Promise(r => setTimeout(r, 50));
      return base * 2;
    }
  });

  const result = await moduler.load("async-dep");

  moduler.assert(result === 20, "deps async mal resueltas");
};