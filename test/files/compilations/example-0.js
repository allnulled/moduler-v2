define({
  "name": "example-2/main",
  "requires": [
    {
      "path": "test/files/compilables/example-2/0.js"
    },
    {
      "path": "test/files/compilables/example-2/1.js"
    },
    {
      "path": "test/files/compilables/example-2/2.js"
    }
  ],
  "factory": {
    "@type": "function",
    "source": "function(a,b,c) {\n    return { a,b,c };\n  }",
    "keys": ""
  },
  "from": "@file=test/files/compilables/example-2/main.js",
  "type": "factory",
  "order": 0
});

define({
  "name": "example-2/main/0",
  "module": 2028,
  "from": "@file=test/files/compilables/example-2/0.js",
  "type": "value",
  "order": 1
});

define({
  "name": "example-2/main/1",
  "module": 2524,
  "from": "@file=test/files/compilables/example-2/1.js",
  "type": "value",
  "order": 2
});

define({
  "name": "example-2/main/2",
  "module": 2129,
  "from": "@file=test/files/compilables/example-2/2.js",
  "type": "value",
  "order": 3
});

