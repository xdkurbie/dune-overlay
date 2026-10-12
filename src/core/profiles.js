'use strict';
const REQUIRED = ['id', 'name', 'map', 'transform', 'categories'];
function validateProfile(p) {
  for (const k of REQUIRED) if (p[k] === undefined) throw new Error(`profile missing "${k}"`);
  const t = p.transform; for (const k of ['originX', 'originY', 'scaleX', 'scaleY']) if (!Number.isFinite(t[k])) throw new Error(`transform.${k} must be number`);
  if (!t.scaleX || !t.scaleY) throw new Error('scale must be non-zero');
  if (!Array.isArray(p.categories) || !p.categories.length) throw new Error('categories must be non-empty array');
  if (!Number.isFinite(p.map.width) || !Number.isFinite(p.map.height)) throw new Error('map.width/height required');
  return { ocr: { pattern: null, region: null, intervalMs: 1500 }, ...p };
}
function loadProfiles(dir, fs = require('fs'), path = require('path')) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()
    .map(f => validateProfile(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))));
}
module.exports = { validateProfile, loadProfiles };
