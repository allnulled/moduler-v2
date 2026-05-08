const { ModulerV2 } = require(__dirname + "/../moduler-v2.dist.js");
const testutils = require(__dirname + "/testutils.js");

const main = async function() {
  
  const targets = require("fs").readFileSync(__dirname + "/test-targets.txt").toString().split("\n").filter(line => !!line.trim().length);
  const hasAllFlag = !!targets.filter(f => f === "*").length;
  const startsLikeTarget = function(file) {
    if(targets.length === 0) return true;
    if(hasAllFlag) return true;
    for(let index=0; index<targets.length; index++) {
      const target = targets[index];
      if(file.startsWith(target)) {
        return true;
      } else if(("!" + file).startsWith(target)) {
        return false;
      }
    }
    return false;
  };
  const files = require("fs").readdirSync(__dirname);
  const errors = [];
  Iterating_tests:
  for(let index=0; index<files.length; index++) {
    const file = files[index];
    if(file.endsWith(".test.js")) {
      if(!startsLikeTarget(file)) {
        continue Iterating_tests;
      }
      console.log(`[*] Testing: ${file}`);
      try {
        await require(`${__dirname}/${file}`)(new ModulerV2(), ModulerV2, testutils);
      } catch (error) {
        console.error("Fails on test of: " + file);
        errors.push({ test: file, error });
      }
    }
  }
  if(errors.length) {
    console.error(Object.assign({}, errors));
    console.error(`Fallo de tests en ${errors.length} ocasiones.`);
  } else {
    console.log("Tests ok.");
  }
  
};

main();