'use strict';
// Storage-agnostic marker store. `backend` needs get(key)/set(key,value) (localStorage or file).
const KEY = 'markers:';
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function validate(m) {
  if (!m || typeof m !== 'object') throw new Error('invalid marker');
  if (!Number.isFinite(m.x) || !Number.isFinite(m.y)) throw new Error('marker needs numeric x/y');
  return { id: m.id || uid(), x: m.x, y: m.y, title: String(m.title || ''), note: String(m.note || ''), category: String(m.category || 'misc') };
}
class MarkerStore {
  constructor(backend, profileId) { this.b = backend; this.key = KEY + profileId; }
  all() { try { return JSON.parse(this.b.get(this.key) || '[]'); } catch { return []; } }
  _save(list) { this.b.set(this.key, JSON.stringify(list)); }
  add(m) { const v = validate(m); this._save([...this.all(), v]); return v; }
  update(id, patch) {
    const list = this.all(); const i = list.findIndex(m => m.id === id);
    if (i < 0) throw new Error('not found'); list[i] = validate({ ...list[i], ...patch, id }); this._save(list); return list[i];
  }
  remove(id) { const l = this.all(); const n = l.filter(m => m.id !== id); this._save(n); return n.length !== l.length; }
  byCategory(c) { return this.all().filter(m => m.category === c); }
  exportJSON() { return JSON.stringify({ format: 'dune-overlay-markers', version: 1, markers: this.all() }, null, 2); }
  importJSON(json, { merge = true } = {}) {
    const d = typeof json === 'string' ? JSON.parse(json) : json;
    const incoming = (Array.isArray(d) ? d : d.markers || []).map(validate);
    const base = merge ? this.all() : []; const ids = new Set(base.map(m => m.id));
    const out = base.concat(incoming.filter(m => !ids.has(m.id))); this._save(out); return incoming.length;
  }
}
function memoryBackend() { const s = new Map(); return { get: k => s.get(k), set: (k, v) => s.set(k, v) }; }
module.exports = { MarkerStore, memoryBackend, validate };
