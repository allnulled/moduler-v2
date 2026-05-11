const ModulerV2Injector = class ModulerV2Injector {
  static parse(source) {
    const parser = new ModulerV2Injector(source);
    return parser.parseInjectCalls();
  }
  static async inject(source, moduler = new ModulerV2()) {
    const matches = this.parse(source);
    let output = source;
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const replacement = await this.resolveInjection(match, moduler);
      output = output.slice(0, match.start) + replacement + output.slice(match.end);
    }
    return output;
  }
  static resolveInjection(match, moduler) {
    return moduler.readPath(match.inject);
  }
  constructor(source) {
    this.source = source;
    this.length = source.length;
    this.index = 0;
  }
  parseInjectCalls() {
    if (this.index !== 0) throw new Error("Cannot call «parseInjectCalls» more than once");
    const results = [];
    while (this.index < this.length) {
      const start = this.source.indexOf('inject(', this.index);
      if (start === -1)
        break;
      this.index = start;
      try {
        const result = this.parseInjectCall();
        results.push(result);
      } catch (error) {
        this.index = start + 1;
        throw error;
      }
    }
    return results;
  }
  parseInjectCall() {
    const start = this.index;
    this.consume('inject(');
    // inject("...")
    if (this.peek() !== '"')
      throw new Error('inject requiere string literal');
    const injectString = this.readString('"');
    this.skipSpaces();
    this.expect(')');
    this.skipSpaces();
    // .as.
    this.consume('.as.');
    // whatever
    const asName = this.readIdentifier();
    this.skipSpaces();
    // (
    this.expect('(');
    const argsStart = this.index - 1;
    this.readBalanced();
    const end = this.index;
    return {
      start,
      end,
      inject: injectString,
      as: asName,
      args: "[" + this.source.slice(argsStart + 1, end - 1) + "]",
      text: this.source.slice(start, end)
    };
  }
  readBalanced() {
    const stack = ['('];
    while (this.index < this.length && stack.length) {
      const c = this.peek();
      // strings
      if (c === '"' || c === "'") {
        this.readString(c);
        continue;
      }
      // ignorar `
      if (c === '`') {
        this.index++;
        continue;
      }
      // openings
      if (c === '(' || c === '[' || c === '{') {
        stack.push(c);
        this.index++;
        continue;
      }
      // closings
      if (c === ')' || c === ']' || c === '}') {
        const open = stack.pop();
        if (!this.matches(open, c))
          throw new Error('delimitadores incorrectos');
        this.index++;
        continue;
      }
      this.index++;
    }
    if (stack.length)
      throw new Error('bloque sin cerrar');
  }
  readString(quote) {
    let result = '';
    this.expect(quote);
    while (this.index < this.length) {
      const c = this.peek();
      if (c === '\\') {
        result += c;
        this.index++;
        result += this.peek();
        this.index++;
        continue;
      }
      if (c === quote) {
        this.index++;
        return result;
      }
      result += c;
      this.index++;
    }
    throw new Error('string sin cerrar');
  }
  readIdentifier() {
    const start = this.index;
    while (
      this.index < this.length &&
      /[a-zA-Z0-9_$]/.test(this.peek())
    ) {
      this.index++;
    }
    if (start === this.index)
      throw new Error('identificador esperado');
    return this.source.slice(start, this.index);
  }
  matches(open, close) {
    return (
      (open === '(' && close === ')') ||
      (open === '[' && close === ']') ||
      (open === '{' && close === '}')
    );
  }
  skipSpaces() {
    while (
      this.index < this.length &&
      /\s/.test(this.peek())
    ) {
      this.index++;
    }
  }
  consume(text) {
    if (!this.source.startsWith(text, this.index))
      throw new Error(`esperado "${text}"`);

    this.index += text.length;
  }
  expect(char) {
    if (this.peek() !== char)
      throw new Error(`esperado "${char}"`);

    this.index++;
  }
  peek() {
    return this.source[this.index];
  }
}