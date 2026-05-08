function jsify(obj, tab = 0, options = {}) {
  if(typeof obj === "boolean") {
    return obj ? "true" : "false";
  }
  if(typeof obj === "number") {
    return "" + obj;
  }
  if(typeof obj === "string") {
    return JSON.stringify(obj);
  }
  if(typeof obj === "undefined") {
    return "undefined";
  }
  if(typeof obj === "object") {
    if(obj === null) {
      return "null";
    }
    if(Array.isArray(obj)) {
      let js = "";
      js += "[";
      if(obj.length) {
        for(let index=0; index<obj.length; index++) {
          const item = obj[index];
          if(index !== 0) js += ",";
          js += "\n";
          js += "  ".repeat(tab);
          js += this.jsify(item, tab+1, options);
        }
        js += "\n";
        js += "  ".repeat(tab);
      }
      js += "]";
      return js;
    } else {
      let js = "";
      const keys = Object.keys(obj);
      js += "{";
      if(keys.length) {
        Iterating_keys:
        for(let index=0; index<keys.length; index++) {
          const key = keys[index];
          const val = obj[key];
          if(options.propertiesFilter) {
            if(!options.propertiesFilter(key)) {
              continue Iterating_keys;
            }
          }
          if(js !== "{") js += ",";
          js += "\n";
          js += "  ".repeat(tab);
          js += (/[A-Za-z$_][A-Za-z0-9$_]*/g).test(key) ? key : JSON.stringify(key);
          js += ": ";
          js += this.jsify(val, tab+1, options);
        }
        js += "\n";
        js += "  ".repeat(tab);
      }
      js += "}";
      return js;
    }
  }
  if(typeof obj === "function") {
    let js = "";
    js += obj.toString();
    return js;
  }
  throw new Error("typeof not identified: " + typeof(obj));
}