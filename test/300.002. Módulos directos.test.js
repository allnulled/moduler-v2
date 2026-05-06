module.exports = async function(moduler) {

  moduler.assert(500 === await moduler.load({ factory: () => 500 }), "modulos directos fallan");
  moduler.assert(501 === await moduler.load({ factory: () => 500, getter: it => it + 1 }), "getter de modulos directos falla");

};