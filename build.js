const fs = require("fs");

const compileInjectables = function(file, deepness = 0) {
  let seed = fs.readFileSync(__dirname + "/" + file).toString();
  if(deepness !== 0) {
    seed = seed.split("\n").join("\n" + "  ".repeat(deepness));
  }
  return seed.replace(/(__SOURCE_FROM__|__STRING_FROM__)\(\"([^\"]+)\"(,[0-9]+)?\);/g, (match, group1,group2,group3) => {
    if(group1 === "__STRING_FROM__") {
      return JSON.stringify(fs.readFileSync(__dirname + "/" + group2).toString());
    }
    return compileInjectables(group2, deepness + 1 + (group3 ? parseInt(group3.substr(1)) : 0));
  });
};

const distSource = compileInjectables("src/ModulerV2.js");

fs.writeFileSync(__dirname + "/moduler-v2.dist.js", distSource, "utf8");
