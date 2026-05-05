const { ModulerV2 } = require(__dirname + "/../moduler-v2.js");

const main = async function() {
  
  const files = require("fs").readdirSync(__dirname);
  for(let index=0; index<files.length; index++) {
    const file = files[index];
    if(file.endsWith(".test.js")) {
      console.log(`[*] Testing: ${file}`);
      await require(`${__dirname}/${file}`)(new ModulerV2());
    }
  }
  
};

main();