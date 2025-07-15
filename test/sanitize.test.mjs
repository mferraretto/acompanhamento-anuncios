import assert from 'assert';
import { sanitize } from '../utils.js';

assert.strictEqual(sanitize('<script>'), '&lt;script&gt;');
assert.strictEqual(sanitize('a & b'), 'a &amp; b');
assert.strictEqual(sanitize('"quoted"'), '&quot;quoted&quot;');
assert.strictEqual(sanitize("it's"), 'it&#39;s');
assert.strictEqual(sanitize(null), '');

console.log('sanitize tests passed');
