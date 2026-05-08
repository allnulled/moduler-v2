module.exports = async function(moduler) {

  moduler.define({
    name: "funcion/1",
    module: function(a, b) {
      return (this || 0) + a + b;
    }
  });

  moduler.assert(115 === await moduler.call("funcion/1", [5, 10], 100), "moduler.prototype.call está fallando");

};