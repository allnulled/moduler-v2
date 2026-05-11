define({
  name: "example-3/injected",
  factory: function() {
    return {
      uno: 100,
      dos: 305,
      tres: "ok",
      cuatro: 800,
      Clase1: class {
        prop1 = {
          settings: {},
          options: {}
        };
        prop2 = [];
        prop3 = function() {

        };
      },
    }
  }
});