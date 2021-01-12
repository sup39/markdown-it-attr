const assert = require('assert');
const fs = require('fs');
const path = require('path');
const testCaseDir = path.join(__dirname, 'cases');
/**
 * @param {MarkdownIt} md
 * @param {string} fileName
 */
module.exports = function test(md, fileName) {
  const raw =
    fs.readFileSync(path.join(testCaseDir, fileName)).toString();
  const elms = raw.split(/\n\.\n/);
  for (let i=2; i<elms.length; i+=3) {
    const title = elms[i-2].trim();
    it(title, () => {
      assert.equal(md.render(elms[i-1]), elms[i]+'\n');
    });
  }
};
