return define({
  name: "example-3/injected",
  factory: function() {
    return {
      uno: inject("test/files/compilables/example-3/injection/mod1.frag.js").as.source(),
      dos: inject("test/files/compilables/example-3/injection/mod2.frag.js").as.string(),
      tres: inject("test/files/compilables/example-3/injection/mod3.frag.js").as.template({ param: 5 }),
    }
  }
});