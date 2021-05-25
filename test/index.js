const mdi = require('markdown-it');
const mrt = require('@sup39/markdown-it-raw-table');
const mia = require('..');
const test = require('./test');

describe('Attributes', () => {
  const md = mdi().use(mia);
  test(md, 'attrs.txt');
});
describe('Common', () => {
  const md = mdi().use(mia);
  test(md, 'common.txt');
});
describe('Escape', () => {
  const md = mdi().use(mia);
  test(md, 'escape.txt');
});
describe('Table (with @sup39/markdown-it-raw-table)', () => {
  const md = mdi().use(mrt).use(mia);
  // enable raw_table_tr
  mia.inlineAttrsApplyRules.find(e=>e.name==='raw_table_tr').disabled = false;
  test(md, 'table.txt');
});

describe('No-Filtering', () => {
  const mdd = mdi().use(mia);
  test(mdd, 'filtering-default.txt');
});
describe('Filtering', () => {
  const md = mdi().use(mia, {
    /* eslint-disable-next-line max-len */
    re: /\#(?<id>[^\s#.="'}]+)|\.(?<class>[^\s#.="'}]+)|(?:on[^\s#.="'}]+|(?<attr>[^\s#.="'}]+))(?:\=(?<val>[^\s}"'][^\s}]*|(?<q>["']).*?\k<q>))?|(?<term>})/g,
  });
  test(md, 'filtering.txt');
});
