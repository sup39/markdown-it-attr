const {parseAttrs, attrConcat} = require('./utils.js');
const {inlineAttrsApplyRules} = require('./rules.js');

/**
 * @param {MarkdownIt} md
 * @param {{deliminator: string, re: RegExp}} opts
 */
function pluginAttr(md, opts={}) {
  const deliminator = opts.deliminator || '{';
  const deliminatorLength = deliminator.length;
  /* eslint-disable-next-line max-len */
  const reDefault = /\#(?<id>[^\s#.="'}]+)|\.(?<class>[^\s#.="'}]+)|(?<attr>[^\s#.="'}]+)(?:\=(?<val>[^\s#.="'}]+|(?<q>["']).*?\k<q>))?|}/g;
  const reRaw = opts.re;
  const re = reRaw ?
    (reRaw.sticky || reRaw.global) ? reRaw :
      new RegExp(reRaw, reRaw.flags+'g') :
    reDefault;

  md.block.ruler.before('table', 'block_attrs', (state, l0, l1, silent) => {
    const {src, bMarks, eMarks, tShift} = state;
    // guard thisLine.sCount == nextLine.sCount
    if (state.sCount[l0] !== state.sCount[l0+1]) return false;
    // disallow contiguous two { }
    if (
      l1 > l0+2 &&
      state.sCount[l0+1] === state.sCount[l0+2] &&
      src.startsWith(deliminator, bMarks[l0+1]+tShift[l0+1])
    ) return false;
    // parse
    const indexStart = bMarks[l0]+tShift[l0];
    const indexEnd = eMarks[l0];
    if (src.startsWith(deliminator, indexStart)) {
      // parse attrs
      re.lastIndex = indexStart+deliminatorLength;
      const {attrs, index} = parseAttrs(src, re) || {};
      // should meet end of line
      if (!(attrs && index === indexEnd)) return false;
      // push
      if (silent) return true;
      state.line = l0+1;
      const token = state.push('block_attr', '', 0);
      token.attrs = attrs;
      token.hidden = true;
      return true;
    }
    return false;
  }, {alt: ['paragraph']});

  md.inline.ruler.push('inline_attrs', (state, silent) => {
    const {src, pos} = state;
    if (src.startsWith(deliminator, pos)) {
      re.lastIndex = pos+deliminatorLength;
      const {attrs, index} = parseAttrs(src, re) || {};
      if (!attrs) return false;
      // set attr
      if (silent) return true;
      const token = state.push('inline_attr', '', 0);
      token.attrs = attrs;
      token.content = src.substring(pos, index);
      token.hidden = true;
      state.pos = index;
      return true;
    }
    return false;
  });

  md.core.ruler.after('block', 'apply_block_attrs', state => {
    state.tokens.forEach((token, i, tokens) => {
      if (token.type === 'block_attr' && token.attrs) {
        const tokenN = tokens[i+1];
        if (tokenN) {
          attrConcat(tokenN, token);
          tokens.splice(i, 1);
        }
      }
    });
  });

  md.core.ruler.after('inline', 'apply_inline_attrs', state => {
    state.tokens.forEach((blockToken, iBlock, blockTokens) => {
      const {children} = blockToken;
      if (!children) return;
      children.forEach((token, i, tokens) => {
        if (token.type !== 'inline_attr') return;
        const matched = inlineAttrsApplyRules.some(({handler, disabled}) =>
          disabled ? false : handler(token, i, tokens, iBlock, blockTokens));
        // not seen as attrs
        if (!matched) {
          token.type = 'text';
          token.hidden = false;
        }
      });
      // remove inline_attr here to prevent index changed
      blockToken.children = children.filter(t => t.type !== 'inline_attr');
    });
  });
}

module.exports = Object.assign(pluginAttr, {
  inlineAttrsApplyRules,
});
