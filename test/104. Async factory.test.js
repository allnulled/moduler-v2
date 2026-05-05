module.exports = async function (moduler) {

  moduler.define({
    name: "async",
    factory: async () => {
      await new Promise(r => setTimeout(r, 50));
      return 123;
    }
  });

  const result = await moduler.load("async");

  moduler.assert(result === 123, "async factory falla");
};