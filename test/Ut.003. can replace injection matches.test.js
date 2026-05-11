module.exports = async function (moduler, ModulerV2) {
  const output1 = await ModulerV2.Injector.inject(`
    var x = inject("test/files/compilables/example-3/injection/mod1.frag.js").as.source();
    var y = inject("test/files/compilables/example-3/injection/mod2.frag.js").as.template(1, 2, 3, {message:"string"}, function() { console.log("Hi!"); });
    var z = inject("test/files/compilables/example-3/injection/mod3.frag.js").as.source();
  `, moduler);
  moduler.assert(typeof output1 === "string", "Injector.inject está fallando (punto 1)");
  moduler.assert(output1.includes("100"), "Injector.inject está fallando (punto 2)");
  moduler.assert(output1.includes("305"), "Injector.inject está fallando (punto 3)");
  console.log(output1);
  moduler.assert(output1.includes('"ok"'), "Injector.inject está fallando (punto 4)");
}