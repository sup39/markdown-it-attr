/**
 * @typedef {import('markdown-it/lib/token')} Token
 */

/**
 * @param {string} s - input string
 * @param {RegExp} re - regular expression for attributes
 * @param {number} [limit=65536] - limit of attribute count
 * @return {{attrs: [string, string][], index: number}|null}
 */
function parseAttrs(s, re, limit=65536) {
  let count = 0;
  /** @type {string[]} */
  const classes = [];
  /** @type {[string, string][]} */
  const attrs = [];

  let m;
  while ((m = re.exec(s)) && count<limit) {
    const g = m.groups;
    if (g.id) attrs.push(['id', g.id]);
    else if (g.class) classes.push(g.class);
    else if (g.attr) {
      const ql = g.q && g.q.length;
      const val = ql ? g.val.slice(ql, -ql) : g.val || '';
      attrs.push([g.attr, val]);
    } else if (g.term) {
      if (classes.length) attrs.push(['class', classes.join(' ')]);
      return {attrs, index: m.index+m[0].length};
    }
    count++;
  }
  return null;
}

/**
 * @param {Token[]} tokens - tokens
 * @param {number} i - index of close token
 * @return {Token|null} - open token
 */
function findOpenToken(tokens, i) {
  const tokenC = tokens[i];
  if (!tokenC) return null;
  let dlevel = 0;
  for (i--; i>=0; i--) {
    const token = tokens[i];
    const {nesting} = token;
    if (nesting === 1 && dlevel === 0) return token;
    dlevel += nesting;
  }
  return null;
}

/**
 * @template T
 * @param {T[]} arr
 * @param {number} startIndex
 * @param {(elm: T) => boolean} test
 * @param {(elm: T) => boolean} [constraint]
 * @return {T|undefined} element;
 */
function find(arr, startIndex, test, constraint=()=>true) {
  for (let i=startIndex, len=arr.length; i<len; i++) {
    const elm = arr[i];
    if (!constraint(elm)) return;
    if (test(elm)) return elm;
  }
}

/**
 * @template T
 * @param {T[]} arr
 * @param {number} startIndex
 * @param {(elm: T) => boolean} test
 * @param {(elm: T) => boolean} [constraint]
 * @return {T|undefined} element;
 */
function rfind(arr, startIndex, test, constraint=()=>true) {
  for (let i=startIndex; i>=0; i--) {
    const elm = arr[i];
    if (!constraint(elm)) return;
    if (test(elm)) return elm;
  }
}

/**
 * @template T
 * @param {T[]} arr
 * @param {number} startIndex
 * @param {(elm: T) => boolean} test
 * @param {(elm: T) => boolean} [constraint]
 * @return {number} index ?? -1;
 */
function rfindIndex(arr, startIndex, test, constraint=()=>true) {
  for (let i=startIndex; i>=0; i--) {
    const elm = arr[i];
    if (!constraint(elm)) return -1;
    if (test(elm)) return i;
  }
  return -1;
}

/**
 * @param {Token} dst - Destination Token
 * @param {Token} src - Source Token
 */
function attrConcat(dst, src) {
  const {attrs} = src;
  if (attrs) attrs.forEach(attr => dst.attrPush(attr));
}

module.exports = {
  parseAttrs, findOpenToken, find, rfind, rfindIndex, attrConcat,
};
