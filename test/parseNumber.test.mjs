import assert from 'assert';
import { parseNumber } from '../utils.js';

assert.strictEqual(parseNumber('1.234,56'), 1234.56);
assert.strictEqual(parseNumber('1234.56'), 1234.56);

console.log('parseNumber tests passed');
