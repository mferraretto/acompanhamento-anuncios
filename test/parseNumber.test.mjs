import assert from 'assert';
import { parseNumber } from '../utils.js';

assert.strictEqual(parseNumber('1.234,56'), 1234.56);
assert.strictEqual(parseNumber('1234.56'), 1234.56);
assert.strictEqual(parseNumber('-1.234,56'), -1234.56);
assert.strictEqual(parseNumber('50%'), 50);
assert.strictEqual(parseNumber('R$ 1.234,56'), 1234.56);
assert.strictEqual(parseNumber('1 234,56'), 1234.56);
assert.strictEqual(parseNumber('1 234 567,89'), 1234567.89);

console.log('parseNumber tests passed');
