module.exports = async function (moduler) {
  let executions = 0;
  moduler.define({
    name: "circularity 1",
    requires: [],
    factory: () => {
      return 100;
    }
  });
  moduler.define({
    name: "circularity 2",
    requires: [],
    factory: () => {
      return 200;
    }
  });
  moduler.define({
    name: "circularity 3",
    requires: ["circularity 1"],
    factory: (c1) => {
      return c1 + 300;
    }
  });
  const vals = await Promise.all([
    moduler.load("circularity 1"),
    moduler.load("circularity 2"),
    moduler.load("circularity 3"),
  ]);
  moduler.assert(vals[0] === 100, "should be 100");
  moduler.assert(vals[1] === 200, "should be 200");
  moduler.assert(vals[2] === 400, "should be 400");
}