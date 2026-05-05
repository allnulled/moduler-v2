module.exports = async function (moduler) {
  let executions = 0;

  moduler.define({
    name: "pending-test",
    factory: async () => {
      executions++;
      await new Promise(r => setTimeout(r, 100));
      return 99;
    }
  });

  const [a, b, c] = await Promise.all([
    moduler.load("pending-test"),
    moduler.load("pending-test"),
    moduler.load("pending-test")
  ]);

  moduler.assert(a === 99);
  moduler.assert(b === 99);
  moduler.assert(c === 99);
  moduler.assert(executions === 1, "pending no evita duplicados");
};