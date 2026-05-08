return define({
  name: "example-2/main",
  requires: [
    { path: "test/files/compilables/example-2/0.js" },
    { path: "test/files/compilables/example-2/1.js" },
    { path: "test/files/compilables/example-2/2.js" },
  ],
  factory: function(a,b,c) {
    return { a,b,c };
  },
});