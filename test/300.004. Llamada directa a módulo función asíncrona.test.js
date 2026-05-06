module.exports = async function(moduler) {

  moduler.define({
    name: "funcion asincrona/1",
    module: async function(a, b) {
      await new Promise(resolve => setTimeout(resolve, 10));
      return (this || 0) + a + b;
    }
  });

  moduler.assert(228 === await moduler.call("funcion asincrona/1", [8, 20], 200), "moduler.prototype.call está fallando con funciones asíncronas");

};