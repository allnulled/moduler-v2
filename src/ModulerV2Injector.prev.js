class ModulerV2Injector {
  static parse(originalSource) {
    function parseInjectCalls(code) {
      const results = [];
      let i = 0;

      while (i < code.length) {
        const start = code.indexOf('inject(', i);
        if (start === -1) break;

        let p = start + 'inject('.length;

        try {
          // 1. string obligatorio
          if (code[p] !== '"') throw new Error('inject necesita string');

          p = parseString(code, p, '"');

          skipSpaces();
          if (code[p] !== ')') throw new Error('faltaba )');
          p++;

          skipSpaces();

          // 2. .as.
          if (!code.startsWith('.as.', p))
            throw new Error('faltaba .as.');

          p += 4;

          // 3. identificador
          const identStart = p;
          while (/[a-zA-Z0-9_$]/.test(code[p])) p++;

          if (p === identStart)
            throw new Error('faltaba identificador');

          skipSpaces();

          // 4. llamada (...)
          if (code[p] !== '(')
            throw new Error('faltaba llamada');

          p = parseBalanced(code, p);

          results.push({
            start,
            end: p,
            text: code.slice(start, p)
          });

          i = p;
        } catch {
          // si falla, seguimos buscando
          i = start + 1;
        }

        function skipSpaces() {
          while (/\s/.test(code[p])) p++;
        }
      }

      return results;
    }


    // ---------- helpers ----------

    function parseString(code, i, quote) {
      i++; // saltar apertura

      while (i < code.length) {
        if (code[i] === '\\') {
          i += 2;
          continue;
        }

        if (code[i] === quote)
          return i + 1;

        i++;
      }

      throw new Error('string sin cerrar');
    }


    function parseBalanced(code, i) {
      const stack = ['('];
      i++;

      while (i < code.length && stack.length) {
        const c = code[i];

        // strings
        if (c === '"' || c === "'") {
          i = parseString(code, i, c);
          continue;
        }

        // ignorar completamente `
        if (c === '`') {
          i++;
          continue;
        }

        // aperturas
        if (c === '(' || c === '[' || c === '{') {
          stack.push(c);
          i++;
          continue;
        }

        // cierres
        if (c === ')' || c === ']' || c === '}') {
          const open = stack.pop();

          if (
            (open === '(' && c !== ')') ||
            (open === '[' && c !== ']') ||
            (open === '{' && c !== '}')
          ) {
            throw new Error('balance incorrecto');
          }

          i++;
          continue;
        }

        i++;
      }

      if (stack.length)
        throw new Error('paréntesis sin cerrar');

      return i;
    }
  }
};