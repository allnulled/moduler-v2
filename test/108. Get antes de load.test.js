module.exports = async function (moduler) {

  moduler.define({
    name: "X",
    module: 1
  });

  let error = false;

  try {
    moduler.get("X");
  } catch {
    error = true;
  }

  moduler.assert(error, "get debería fallar si no está cargado");
};