return define({
  name: "example-3/injected",
  factory: function() {
    return {
      uno: inject("test/files/compilables/example-3/injection/mod1.frag.js").as.source(),
      dos: inject("test/files/compilables/example-3/injection/mod2.frag.js").as.string(),
      tres: inject("test/files/compilables/example-3/injection/mod3.frag.js").as.template({ param: 5 }),
      cuatro: inject("test/files/compilables/example-3/injection/mod4.frag.js").as.template({ param: 6 }),
      Clase1: class {
        prop1 = inject("test/files/compilables/example-3/injection/Clase1.prototype.prop1.frag.js").as.source();
        prop2 = inject("test/files/compilables/example-3/injection/Clase1.prototype.prop2.frag.js").as.source();
        prop3 = inject("test/files/compilables/example-3/injection/Clase1.prototype.prop3.frag.js").as.source();
      },
    }
  }
});