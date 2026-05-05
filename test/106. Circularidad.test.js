module.exports = async function (moduler) {

  moduler.define({
    name: "A",
    requires: ["B"],
    factory: (b) => {
      return { fromB: b.value };
    }
  });

  moduler.define({
    name: "B",
    requires: ["A"],
    factory: (a) => {
      return { value: 10 };
    }
  });

  const A = await moduler.load("A");
  const B = await moduler.load("B");

  moduler.assert(A.fromB === 10, "circularidad A falla");
  moduler.assert(B.value === 10, "circularidad B falla");
  
};