module.exports = async function (moduler) {
  moduler.define({
    name: "valor1",
    module: 5
  });

  moduler.define({
    name: "valor2",
    module: 10
  });

  moduler.define({
    name: "multiplicar 3 numeros",
    module: function (a, b, c) {
      return a * b * c;
    }
  });

  moduler.define({
    name: "multiplicar por valores 1 y 2",
    requires: ["valor1", "valor2"],
    factory: function (valor1, valor2) {
      return function (c) {
        return valor1 * valor2 * c;
      };
    },
  });

  const [a, b, TripleMultiplication, Multipli1] = await Promise.all([
    moduler.load("valor1"),
    moduler.load("valor2"),
    moduler.load("multiplicar 3 numeros"),
    moduler.load("multiplicar por valores 1 y 2"),
  ]);

  moduler.assert(100 === TripleMultiplication(a, b, 2));
  moduler.assert(100 === Multipli1(2));
  moduler.assert(200 === await moduler.call("multiplicar por valores 1 y 2", 4));
  moduler.assert(200 === moduler.get("multiplicar por valores 1 y 2")(4));
}