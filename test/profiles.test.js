const test = require('node:test'), assert = require('node:assert'), path = require('path');
const { loadProfiles, validateProfile } = require('../src/core/profiles');
test('loads bundled profiles', () => { const p = loadProfiles(path.join(__dirname, '..', 'profiles')); assert.ok(p.find(x => x.id === 'dune-awakening')); assert.ok(p.every(x => x.ocr)); });
test('rejects missing fields', () => assert.throws(() => validateProfile({ id: 'x' }), /missing/));
test('rejects zero scale', () => assert.throws(() => validateProfile({ id: 'x', name: 'x', map: { width: 1, height: 1 }, categories: [{}], transform: { originX: 0, originY: 0, scaleX: 0, scaleY: 1 } })));
