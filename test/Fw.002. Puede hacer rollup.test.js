const fs = require("fs");
const path = require("path");

module.exports = async function (moduler, ModulerV2, testutils) {
  const basedir = __dirname + "/files/watchables";
  let counter = 0;
  const watcher = ModulerV2.FileWatcher.basic({
    path: basedir,
    middlewares: [
      ModulerV2.FileWatcher.middlewares.closeSemaphoreEffect(),
      ModulerV2.FileWatcher.middlewares.rollupEffect(),
      ModulerV2.FileWatcher.middlewares.onTouchEffect(),
      ModulerV2.FileWatcher.middlewares.wait(1000),
      ModulerV2.FileWatcher.middlewares.openSemaphoreEffect(),
    ],
    onStart: function(info) {
      ModulerV2.FileWatcher.tasks.makeSemaphorable(info);
    },
    callback: async function(info) {
      const { event, relfile } = info;
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
  console.log(counter);
  moduler.assert(counter === 0, "filewatcher está fallando (punto b.1)");
  await watcher.close();
  console.log("[*] Test de FileWatcher finalizado.");
}