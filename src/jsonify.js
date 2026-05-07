function(obj, space = 2) {
  const seen = new WeakSet();
  function walk(value, localKey) {
    if (typeof localKey === "string") {
      if (localKey.startsWith("__") && localKey.endsWith("__")) {
        return `metakey::${localKey}::${typeof value}`;
      }
    }
    // Primitivos
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return value;
    }
    // Objetos
    if (typeof value === "object") {
      if (seen.has(value)) {
        return undefined;
      }
      seen.add(value);
      // Detectar objetos host peligrosos
      const tag = Object.prototype.toString.call(value);
      if (
        tag === "[object Window]" ||
        tag === "[object global]" ||
        tag === "[object Chrome]" ||
        value === globalThis
      ) {
        return { "@type": "host-object", tag };
      }
      const output = Array.isArray(value) ? [] : {};
      let descriptors;
      try {
        descriptors = Object.getOwnPropertyDescriptors(value);
      } catch (e) {
        return { "@type": "uninspectable" };
      }
      for (const key of Object.keys(descriptors)) {
        const desc = descriptors[key];
        // Ignorar getters/setters
        if (desc.get || desc.set) {
          continue;
        }
        try {
          output[key] = walk(desc.value, key);
        } catch (e) {
          output[key] = { $error: "access denied" };
        }
      }
      return output;
    }
    // Funciones
    if (typeof value === "function") {
      let src = '"unavailable"';
      try {
        src = value.toString();
      } catch (e) { }
      return {
        "@type": "function",
        source: src,
        keys: Object.keys(value).join(",")
      };
    }
    return undefined;
  }
  const clean = walk(obj);
  return JSON.stringify(clean, null, space);
}