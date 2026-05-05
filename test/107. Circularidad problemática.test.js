module.exports = async function (moduler) {

  moduler.define({
    name: "A",
    requires: ["B"],
    factory: (b) => {
      return { value: b.value + 1 };
    }
  });

  moduler.define({
    name: "B",
    requires: ["A"],
    factory: (a) => {
      return { value: a.value + 1 };
    }
  });

  let fails = false;
  
  try {
    await moduler.load("A");
    throw new Error("esto debería fallar o dar undefined");
  } catch (e) {
    if(e.message === "esto debería fallar o dar undefined") {
      fails = true;
    }
  }

  moduler.assert(fails, "circularidad problemática está dando falso positivo");

};