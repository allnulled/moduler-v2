module.exports = async function (moduler) {

  moduler.define({
    name: "value",
    module: 777
  });

  const result = await moduler.load("value");

  moduler.assert(result === 777, "value directo falla");
};