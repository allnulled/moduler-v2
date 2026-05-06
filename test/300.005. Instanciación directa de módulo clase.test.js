module.exports = async function(moduler) {

  moduler.define({
    name: "clase/1",
    module: class {
      constructor(a,b) {
        this.a = a;
        this.b = b;
        this.c = a + b;
      }
    }
  });

  moduler.assert(15 === (await moduler.new("clase/1", [5, 10])).c, "moduler.prototype.new está fallando");

};