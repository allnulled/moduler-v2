module.exports = async function (moduler) {
  let executions = 0;
  moduler.define({
    name: "pending 1",
    requires: [],
    factory: async () => {
      executions++;
      await new Promise(r => setTimeout(r, 100));
      return 42;
    }
  });
  await Promise.all([
    moduler.load("pending 1"),
    moduler.load("pending 1")
  ]);
  moduler.assert(executions === 1, "ModulerV2 is not preventing from pending values to executing more than once");
}