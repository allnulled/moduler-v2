const fs = require("fs");
const path = require("path");

module.exports = {
  wait(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    })
  },
  fsutils(basedir) {
    return {
      dir: async function (file1) {
        try { await fs.promises.mkdir(path.resolve(basedir, file1)); } catch (error) { }
      },
      deldir: async function (file1) {
        try { await fs.promises.rmdir(path.resolve(basedir, file1)); } catch (error) { }
      },
      del: async function (file1) {
        try { await fs.promises.unlink(path.resolve(basedir, file1)); } catch (error) { }
      },
      file: async function (file1, text) {
        await fs.promises.writeFile(path.resolve(basedir, file1), text, "utf8");
      }
    }
  }
};