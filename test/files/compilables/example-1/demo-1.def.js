return $moduler.loadDefinition({
  name: "example-1",
  requires: [
    { file: "test/files/compilables/example-1/demo-2.req.js", flavour: "require" },
    { file: "test/files/compilables/example-1/demo-3.imp.mjs", flavour: "import", getter: it => it.default },
    { file: "test/files/compilables/example-1/demo-4.ret.js", flavour: "eval" },
    { file: "test/files/compilables/example-1/demo-5.def.js", flavour: "eval" },
  ],
  factory: function (m2req, m3imp, m4ret, m5def) {
    return {
      m2req,
      m3imp,
      m4ret,
      m5def,
      result: m2req + m3imp + m4ret + m5def,
    };
  }
});