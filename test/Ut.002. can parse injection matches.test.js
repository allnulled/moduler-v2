module.exports = async function (moduler, ModulerV2) {
  const output1 = await ModulerV2.Injector.parse('var x = inject("test/files/compilables/example-3/injection/mod1.frag.js").as.source(); var y = inject("test/files/compilables/example-3/injection/mod2.frag.js").as.template(1, 2, 3, {message:"string"}, function() { console.log("Hi!"); });');
  moduler.assert(output1.length === 2, "Injector.parse está fallando (punto 1)");
  moduler.assert(output1[0].inject === "test/files/compilables/example-3/injection/mod1.frag.js", "Injector.parse está fallando (punto 2)");
  moduler.assert(output1[0].as === "source", "Injector.parse está fallando (punto 3)");
  moduler.assert(output1[1].inject === "test/files/compilables/example-3/injection/mod2.frag.js", "Injector.parse está fallando (punto 3)");
  moduler.assert(output1[1].as === "template", "Injector.parse está fallando (punto 3)");
  // console.log(output1);
}