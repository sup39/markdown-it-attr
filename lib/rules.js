const {
  findOpenToken, find, rfind, rfindIndex, attrConcat,
} = require('./utils.js');

const inlineAttrsApplyRules = [
  {
    name: 'first_child',
    handler(token, i, tokens, iBlock, blockTokens) {
      if (i !== 0) return;
      const tokenO = rfind(
        blockTokens, iBlock-1, t=>!t.hidden, t=>t.nesting===1);
      if (!tokenO) return;
      // push attrs
      attrConcat(tokenO, token);
      const tokenNext = tokens[1];
      if (tokenNext && tokenNext.type==='text') {
        // trim start of next token
        tokenNext.content = tokenNext.content.replace(/^\s+/, '');
      }
      return true;
    },
  },
  {
    name: 'after_inline_block',
    handler(token, i, tokens, iBlock, blockTokens) {
      // find non-empty text token
      const iC = rfindIndex(tokens, i-1, t=>t.type!=='text'||t.content);
      const tokenC = iC>=0 && tokens[iC];
      if (!tokenC) return;
      // check tokenC type
      if (tokenC.nesting === -1) {
        // close token -> find open and apply
        const tokenO = findOpenToken(tokens, iC);
        if (!tokenO) return false;
        attrConcat(tokenO, token);
      } else if (tokenC.nesting === 0 && tokenC.type !== 'text') {
        // block token -> apply directly
        attrConcat(tokenC, token);
      } else return false; // not inline block
      return true;
    },
  },
  {
    name: 'last_child',
    handler(token, i, tokens, iBlock, blockTokens) {
      if (i !== tokens.length-1) return;
      const tokenC = find(
        blockTokens, iBlock+1, t=>!t.hidden, t=>t.nesting===-1);
      if (!tokenC) return;
      const {level} = tokenC;
      const tokenO = rfind(
        blockTokens, iBlock-1, t=>t.level===level, t=>t.nesting===1);
      if (!tokenO) return;
      token.attrs.forEach(attr => tokenO.attrPush(attr));
      const tokenLast = tokens[i-1];
      if (tokenLast && tokenLast.type==='text') {
        // trim end of last token
        tokenLast.content = tokenLast.content.replace(/\s+$/, '');
      }
      return true;
    },
  },
];

module.exports = {inlineAttrsApplyRules};

// TODO
inlineAttrsApplyRules.unshift({
  name: 'raw_table_tr',
  disabled: true,
  handler(token, i, tokens, iB, tokenBs) {
    if (tokens.length !== 1) return;
    if (tokenBs.length <= i+2) return;
    if (!(
      tokenBs[iB+1].type === 'td_close' &&
      tokenBs[iB+2].type === 'tr_close'
    )) return;
    const tokenO = findOpenToken(tokenBs, iB+2);
    if (!tokenO) return;
    attrConcat(tokenO, token);
    tokenBs.splice(iB+1, 1); // td_close
    tokenBs.splice(iB-1, 1); // td_open
    return true;
  },
});
