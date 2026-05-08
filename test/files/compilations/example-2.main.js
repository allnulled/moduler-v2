define({
  name: "example-2/main",
  requires: [{
      path: "test/files/compilables/example-2/0.js"
    },
    {
      path: "test/files/compilables/example-2/1.js"
    },
    {
      path: "test/files/compilables/example-2/2.js"
    }
  ],
  factory: function(a, b, c) {
    return {
      a,
      b,
      c
    };
  }
});

define({
  name: "example-2/main/0",
  module: 2028
});

define({
  name: "example-2/main/1",
  module: 2524
});

define({
  name: "example-2/main/2",
  module: 2129
});