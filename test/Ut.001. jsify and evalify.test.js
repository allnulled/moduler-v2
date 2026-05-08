module.exports = function(moduler, ModulerV2) {
  const info1 = {
    configs: {
      port: 2045,
      protocol: "wherever",
      callback: function(a, b, ...c) {
        console.log(a,b,c);
      },
      list: [1,2,3,4,5]
    }
  };
  const js1 = ModulerV2.jsify(info1);
  const obj1 = ModulerV2.evalify(js1);
  moduler.assert(obj1.configs.port === 2045, "jsify o evalify están fallando");
}