const fs = require("fs");
const path = require("path");

module.exports = async function (moduler, ModulerV2, testutils) {
  const basedir = __dirname + "/files/watchables";
  let counter = 0;
  const watcher = ModulerV2.FileWatcher.basic({
    path: basedir,
    callback: function({ event, relfile }) {
      counter++;
    },
  });
  await watcher.ready;
  const delay = 60;
  await testutils.wait(delay);
  const fsutils = testutils.fsutils(basedir);
  await testutils.wait(delay);
  await fsutils.dir("demo1");
  await testutils.wait(delay);
  await fsutils.deldir("demo1");
  await testutils.wait(delay);
  moduler.assert(counter === 2, "filewatcher está fallando (punto a.1)");
  await watcher.close();
  console.log("[*] Test de FileWatcher finalizado.");
}