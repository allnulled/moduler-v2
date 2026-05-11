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
      deldirrec: async function (file1) {
        try { await fs.promises.rm(path.resolve(basedir, file1), { recursive: true }); } catch (error) { }
      },
      del: async function (file1) {
        try { await fs.promises.unlink(path.resolve(basedir, file1)); } catch (error) { }
      },
      file: async function (file1, text) {
        await fs.promises.writeFile(path.resolve(basedir, file1), text, "utf8");
      },
      copyfile: async function(file1, file2, replacer = false) {
        let contents = await fs.promises.readFile(path.resolve(basedir, file1), "utf8");
        if(replacer) contents = replacer(contents);
        await fs.promises.writeFile(path.resolve(basedir, file2), contents, "utf8");
      },
      touch: async function(file1) {
        const file2 = path.resolve(basedir, file1);
        await fs.promises.writeFile(file2, (await fs.promises.readFile(file2, "utf8")), "utf8");
      },
      exists: async function(file1) {
        try {
          await fs.promises.lstat(file1);
          return true;
        } catch (error) {
          if(error.code === "ENOENT") {
            return false;
          }
          throw error;
        }
      }
    }
  }
};