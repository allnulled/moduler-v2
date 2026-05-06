const { ModulerV2 } = require(__dirname + "/../moduler-v2.js");

const main = async function() {
  
  const files = require("fs").readdirSync(__dirname);
  const errors = [];
  for(let index=0; index<files.length; index++) {
    const file = files[index];
    if(file.endsWith(".test.js")) {
      console.log(`[*] Testing: ${file}`);
      try {
        await require(`${__dirname}/${file}`)(new ModulerV2());
      } catch (error) {
        console.error("Fails on: " + file);
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