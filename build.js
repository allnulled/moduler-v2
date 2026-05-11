const fs = require("fs");

const compileInjectables = function(file, deepness = 0) {
  let seed = fs.readFileSync(__dirname + "/" + file).toString();
  if(deepness !== 0) {
    seed = seed.split("\n").join("\n" + "  ".repeat(deepness));
  }
  return seed.replace(/(__SOURCE_FROM__|__STRING_FROM__)\(\"([^\"]+)\"(, *[0-9]+)?\);/g, (match, group1,group2,group3) => {
    console.log(group1, group2, group3);
    if(group1 === "__STRING_FROM__") {
      return JSON.stringify(fs.readFileSync(__dirname + "/" + group2).toString());
    } else if(group1 === "__SOURCE_FROM__") {
      return compileInjectables(group2, deepness + 1 + (group3 ? parseInt(group3.substr(1)) : 0));
    } else {
      throw new Error("No contemplado group1:" + group1);
    }
  });
};

const compileInjectableRootInto = function(src, dst) {
  const distSource = compileInjectables(src);
  console.log(dst, distSource);
  fs.writeFileSync(dst, distSource, "utf8");
};

compileInjectableRootInto("src/ModulerV2.js", __dirname + "/moduler-v2.dist.js");
Export_to_others:
try {
  // fs.copyFileSync(__dirname + "/moduler-v2.dist.js", __dirname + "/../PROYECTO/moduler-v2.dist.cjs");
} catch (error) {
  
}