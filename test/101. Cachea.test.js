module.exports = async function (moduler) {
  let executions = 0;

  moduler.define({
    name: "cache-test",
    factory: () => {
      executions++;
      return 42;
    }
  });

  const a = await moduler.load("cache-test");
  const b = await moduler.load("cache-test");

  moduler.assert(a === 42);
  moduler.assert(b === 42);
  moduler.assert(executions === 1, "cache no está funcionando");
};