function(code) {
  if(typeof beautifier === "undefined") {
    return code;
  }
  return beautifier.js(code, {
    indent_size: 2,
  });
}