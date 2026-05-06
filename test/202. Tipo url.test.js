module.exports = async function(moduler) {
  
  moduler.define({
    name: "tipo url",
    url: `https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.js`,
    getter: () => _,
  });

  // Evitamos el delay del fetch:
  if(false) {
    const it = await moduler.load("tipo url");
    moduler.assert(typeof it !== "undefined", "modulo tipo url falla");
  }

}