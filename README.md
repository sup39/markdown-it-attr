# markdown-it-attr
A [markdown-it](https://github.com/markdown-it/markdown-it) plugin
to write id, classes, and attributes.

## Syntax
`{#id .class1 .class2 attr=val attr1='val"s"' attr2="val's" attr3}`

### Where to put `{...}`
|type|where|example|
|:-:|:-:|--|
|inline block|**AFTER** tag|em / strong / code|
|inline container|beginning / end|li / td / th|
|block|**BEFORE** block|h1 / ul / table|

Note: There is no way to add attributes to `tr` without extension.  
See [Extension: Attributes for tr](#tr-extension) for more info.

## Examples
### Attributes for inline block
Add `{...}` **AFTER** the inline block.

#### em / strong
Example Input:
```markdown
*x*{.a} **y**{.b} ***z***{.c}
```
Output:
```html
<p><em class="a">x</em> <strong class="b">y</strong> <em class="c"><strong>z</strong></em></p>
```

### Attributes for inline container
Add `{...}` at the **beginning** or the **end** in the inline container.

#### list item
Example Input:
```markdown
- {.a} x1
- x2 {.b}
- x3
```
Output:
```html
<ul>
<li class="a">x1</li>
<li class="b">x2</li>
<li>x3</li>
</ul>
```

#### th / td
Example Input:
```markdown
|h1{.a}|h2{.b}|
|------|------|
|d1{.c}|d2{.d}|
```
Output:
```html
<table>
<thead>
<tr>
<th class="a">h1</th>
<th class="b">h2</th>
</tr>
</thead>
<tbody>
<tr>
<td class="c">d1</td>
<td class="d">d2</td>
</tr>
</tbody>
</table>
```

### Attributes for block
Add `{...}` **BEFORE** the block.

#### header
Example Input:
```markdown
{.a}
# h1
```
Output:
```html
<h1 class="a">h1</h1>
```

#### list
Example Input:
```markdown
{.b}
- l1
- l2
```
Output:
```html
<ul class="b">
<li>l1</li>
<li>l2</li>
</ul>
```

#### table
Example Input:
```markdown
{.c}
|h1|h2|
|--|--|
|d1|d2|
```
Output:
```html
<table class="c">
<thead>
<tr>
<th>h1</th>
<th>h2</th>
</tr>
</thead>
<tbody>
<tr>
<td>d1</td>
<td>d2</td>
</tr>
</tbody>
</table>
```

## Usage
```js
const md = require('markdown-it')();
const mia = require('@sup39/markdown-it-attr');

console.log(md.use(mia).render(`
{#head-id}
# head
`));
```
Expected output:
```html
<h1 id="head-id">head</h1>
```

<h2 id="tr-extension">Extension: Attributes for tr</h2>
To make adding attributes to `tr` work, it is required to use
[@sup39/markdown-it-raw-table](https://github.com/sup39/markdown-it-raw-table)
plugin, in order to prevent forcing td count to be equal to th count,
which eliminates the attributes of `tr`.

```js
const md = require('markdown-it')();
const mia = require('@sup39/markdown-it-attr');
const mrt = require('@sup39/markdown-it-raw-table');

// enable raw_table_tr rule
mia.inlineAttrsApplyRules.find(e=>e.name==='raw_table_tr').disabled = false;

console.log(md.use(mia).use(mrt).render(`
| h1 | h2 | h3 {.ch} |
| -- | -- | -- |
| x1 | x2 {.c2} | x3 {rowspan=2} | {.r1}
| x4 {colspan=2 .c4} | {.r2}
`));
```

Expected output:

```html
<table>
<thead>
<tr>
<th>h1</th>
<th>h2</th>
<th class="ch">h3</th>
</tr>
</thead>
<tbody>
<tr class="r1">
<td>x1</td>
<td class="c2">x2</td>
<td rowspan="2" class="c3">x3</td>
</tr>
<tr class="r2">
<td colspan="2" class="c4">x4</td>
</tr>
</tbody>
</table>
```

<table>
<thead>
<tr>
<th>h1</th>
<th>h2</th>
<th class="ch">h3</th>
</tr>
</thead>
<tbody>
<tr class="r1">
<td>x1</td>
<td class="c2">x2</td>
<td rowspan="2" class="c3">x3</td>
</tr>
<tr class="r2">
<td colspan="2" class="c4">x4</td>
</tr>
</tbody>
</table>

Note that adding attributes to `tr` of the `th` row is NOT available.
