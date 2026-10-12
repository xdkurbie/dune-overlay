const test = require('node:test'), assert = require('node:assert');
const { parseCoordinates, gameToMap, mapToGame } = require('../src/core/coords');
test('parses X/Y labels', () => assert.deepStrictEqual(parseCoordinates('X: 1234.5 Y: -678'), { x: 1234.5, y: -678 }));
test('parses comma pair', () => assert.deepStrictEqual(parseCoordinates('pos 12, 34'), { x: 12, y: 34 }));
test('fixes OCR O->0', () => assert.deepStrictEqual(parseCoordinates('X: 1O5 Y: 2O'), { x: 105, y: 20 }));
test('custom pattern', () => assert.deepStrictEqual(parseCoordinates('lat=5 lon=7', 'lat=(\\d+) lon=(\\d+)'), { x: 5, y: 7 }));
test('garbage -> null', () => { assert.strictEqual(parseCoordinates('no coords'), null); assert.strictEqual(parseCoordinates(null), null); });
test('transform round trip', () => {
  const t = { originX: -1000, originY: 500, scaleX: 0.5, scaleY: -0.25 };
  const m = gameToMap({ x: 1000, y: 100 }, t); assert.deepStrictEqual(m, { x: 1000, y: 100 });
  assert.deepStrictEqual(mapToGame(m, t), { x: 1000, y: 100 });
});
