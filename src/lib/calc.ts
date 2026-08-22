/**
 * Expression evaluator for the on-screen calculator.
 *
 * Implemented as a tokeniser plus shunting-yard evaluation rather than `eval`,
 * so nothing typed into the calculator can execute as code, and so the
 * behaviour is identical in every browser.
 */
export type CalcAngleMode = "deg" | "rad";

interface Token {
  type: "number" | "operator" | "function" | "paren" | "constant";
  value: string;
}

const FUNCTIONS: Record<string, (x: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sqrt: Math.sqrt, ln: Math.log, log: Math.log10,
  abs: Math.abs, exp: Math.exp,
};

const TRIG = new Set(["sin", "cos", "tan"]);
const INVERSE_TRIG = new Set(["asin", "acos", "atan"]);

/**
 * Unary minus sits between multiplication and exponentiation, which is what
 * makes `-3^2` evaluate to -9 and `-3*2` to -6, as in ordinary notation.
 */
const PRECEDENCE: Record<string, number> = {
  "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "u-": 2.5, "^": 3,
};
const RIGHT_ASSOCIATIVE = new Set(["^", "u-"]);

export class CalcError extends Error {}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const source = input.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");

  while (i < source.length) {
    const char = source[i];

    if (/[0-9.]/.test(char)) {
      let number = "";
      while (i < source.length && /[0-9.]/.test(source[i])) number += source[i++];
      if ((number.match(/\./g) ?? []).length > 1) throw new CalcError("Malformed number");
      tokens.push({ type: "number", value: number });
      continue;
    }

    if (/[a-zA-Z]/.test(char)) {
      let name = "";
      while (i < source.length && /[a-zA-Z]/.test(source[i])) name += source[i++];
      if (name === "pi" || name === "e") {
        tokens.push({ type: "constant", value: name });
      } else if (FUNCTIONS[name]) {
        tokens.push({ type: "function", value: name });
      } else {
        throw new CalcError(`Unknown name "${name}"`);
      }
      continue;
    }

    if (char === "π") { tokens.push({ type: "constant", value: "pi" }); i += 1; continue; }
    if (char === "√") { tokens.push({ type: "function", value: "sqrt" }); i += 1; continue; }
    if (char === "(" || char === ")") { tokens.push({ type: "paren", value: char }); i += 1; continue; }

    if ("+-*/^%".includes(char)) {
      const previous = tokens[tokens.length - 1];
      const isUnary =
        char === "-" &&
        (!previous ||
          previous.type === "operator" ||
          (previous.type === "paren" && previous.value === "("));
      tokens.push({ type: "operator", value: isUnary ? "u-" : char });
      i += 1;
      continue;
    }

    throw new CalcError(`Unexpected character "${char}"`);
  }
  return tokens;
}

/** Inserts implicit multiplication, so `2(3+1)` and `3π` behave as written. */
function withImplicitMultiplication(tokens: Token[]): Token[] {
  const out: Token[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const previous = out[out.length - 1];
    const opensValue =
      token.type === "number" ||
      token.type === "constant" ||
      token.type === "function" ||
      (token.type === "paren" && token.value === "(");
    const closesValue =
      previous &&
      (previous.type === "number" ||
        previous.type === "constant" ||
        (previous.type === "paren" && previous.value === ")"));
    if (opensValue && closesValue) out.push({ type: "operator", value: "*" });
    out.push(token);
  }
  return out;
}

export function evaluateExpression(input: string, mode: CalcAngleMode = "deg"): number {
  const tokens = withImplicitMultiplication(tokenize(input));
  if (tokens.length === 0) throw new CalcError("Empty expression");

  const values: number[] = [];
  const operators: Token[] = [];

  const applyOperator = (op: string) => {
    if (op === "u-") {
      const a = values.pop();
      if (a === undefined) throw new CalcError("Missing operand");
      values.push(-a);
      return;
    }
    const b = values.pop();
    const a = values.pop();
    if (a === undefined || b === undefined) throw new CalcError("Missing operand");
    switch (op) {
      case "+": values.push(a + b); break;
      case "-": values.push(a - b); break;
      case "*": values.push(a * b); break;
      case "/":
        if (b === 0) throw new CalcError("Division by zero");
        values.push(a / b);
        break;
      case "%":
        if (b === 0) throw new CalcError("Division by zero");
        values.push(a % b);
        break;
      case "^": values.push(a ** b); break;
      default: throw new CalcError(`Unknown operator "${op}"`);
    }
  };

  const applyFunction = (name: string) => {
    const fn = FUNCTIONS[name];
    const a = values.pop();
    if (a === undefined) throw new CalcError("Missing argument");
    const argument = mode === "deg" && TRIG.has(name) ? (a * Math.PI) / 180 : a;
    const result = fn(argument);
    values.push(mode === "deg" && INVERSE_TRIG.has(name) ? (result * 180) / Math.PI : result);
  };

  for (const token of tokens) {
    if (token.type === "number") {
      values.push(Number(token.value));
    } else if (token.type === "constant") {
      values.push(token.value === "pi" ? Math.PI : Math.E);
    } else if (token.type === "function") {
      operators.push(token);
    } else if (token.type === "operator") {
      // A prefix operator never resolves anything already on the stack: what is
      // there is a binary operator still waiting for its right-hand operand.
      if (token.value === "u-") {
        operators.push(token);
        continue;
      }
      while (operators.length) {
        const top = operators[operators.length - 1];
        if (top.type === "paren") break;
        if (top.type === "function") { applyFunction(operators.pop()!.value); continue; }
        const higher = PRECEDENCE[top.value] > PRECEDENCE[token.value];
        const equal =
          PRECEDENCE[top.value] === PRECEDENCE[token.value] && !RIGHT_ASSOCIATIVE.has(token.value);
        if (higher || equal) applyOperator(operators.pop()!.value);
        else break;
      }
      operators.push(token);
    } else if (token.value === "(") {
      operators.push(token);
    } else {
      let matched = false;
      while (operators.length) {
        const top = operators.pop()!;
        if (top.type === "paren" && top.value === "(") { matched = true; break; }
        if (top.type === "function") applyFunction(top.value);
        else applyOperator(top.value);
      }
      if (!matched) throw new CalcError("Unbalanced parentheses");
      const top = operators[operators.length - 1];
      if (top?.type === "function") applyFunction(operators.pop()!.value);
    }
  }

  while (operators.length) {
    const top = operators.pop()!;
    if (top.type === "paren") throw new CalcError("Unbalanced parentheses");
    if (top.type === "function") applyFunction(top.value);
    else applyOperator(top.value);
  }

  if (values.length !== 1) throw new CalcError("Malformed expression");
  const result = values[0];
  if (!Number.isFinite(result)) throw new CalcError("Result is undefined");
  return result;
}

/** Trims floating-point noise for display. */
export function formatCalcResult(value: number): string {
  if (Number.isInteger(value)) return String(value);
  const rounded = Number(value.toPrecision(12));
  if (Math.abs(rounded) >= 1e12 || (Math.abs(rounded) < 1e-6 && rounded !== 0)) {
    return rounded.toExponential(6);
  }
  return String(rounded);
}
