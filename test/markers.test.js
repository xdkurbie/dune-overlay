const test = require('node:test'), assert = require('node:assert');
const { MarkerStore, memoryBackend } = require('../src/core/markers');
test('add/update/remove', () => {
  const s = new MarkerStore(memoryBackend(), 'g'); const m = s.add({ x: 1, y: 2, title: 'a', category: 'poi' });
  assert.equal(s.all().length, 1); s.update(m.id, { title: 'b' }); assert.equal(s.all()[0].title, 'b');
  assert.equal(s.byCategory('poi').length, 1); assert.ok(s.remove(m.id)); assert.equal(s.all().length, 0);
});
test('rejects invalid', () => assert.throws(() => new MarkerStore(memoryBackend(), 'g').add({ x: 'a' })));
test('profiles isolated', () => { const b = memoryBackend(); new MarkerStore(b, 'a').add({ x: 1, y: 1 }); assert.equal(new MarkerStore(b, 'b').all().length, 0); });
test('export/import roundtrip + dedupe', () => {
  const a = new MarkerStore(memoryBackend(), 'g'); a.add({ x: 1, y: 2 }); a.add({ x: 3, y: 4 });
  const b = new MarkerStore(memoryBackend(), 'g'); assert.equal(b.importJSON(a.exportJSON()), 2); b.importJSON(a.exportJSON());
  assert.deepStrictEqual(b.all(), a.all());
});
test('corrupt storage -> empty', () => { const be = memoryBackend(); be.set('markers:g', '{bad'); assert.deepStrictEqual(new MarkerStore(be, 'g').all(), []); });
