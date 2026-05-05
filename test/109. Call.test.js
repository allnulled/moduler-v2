module.exports = async function (moduler) {

  moduler.define({
    name: "fn",
    factory: () => {
      return (x) => x * 2;
    }
  });

  const result = await moduler.call("fn", 5);

  moduler.assert(result === 10, "call falla");
};