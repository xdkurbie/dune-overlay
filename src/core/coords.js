'use strict';
// Parse coordinate text from OCR, e.g. "X: 1234.5 Y: -678" or "1234, -678" or "N 12 / E 34".
function parseCoordinates(text, pattern) {
  if (typeof text !== 'string') return null;
  const clean = text.replace(/(?<=\d)[Oo]|[Oo](?=\d)/g, '0').replace(/,(?=\d{3}\b)/g, '').replace(/\s+/g, ' ');
  const re = pattern ? new RegExp(pattern, 'i') : /(-?\d+(?:[.,]\d+)?)\s*[,;/ ]\s*[A-Za-z]*\s*:?\s*(-?\d+(?:[.,]\d+)?)/;
  const m = clean.match(re);
  if (!m) return null;
  const x = parseFloat(m[1].replace(',', '.')), y = parseFloat(m[2].replace(',', '.'));
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}
// Affine transform game->map using profile: map = (game - origin) * scale, optional axis flip.
function gameToMap(pt, t) {
  return { x: (pt.x - t.originX) * t.scaleX, y: (pt.y - t.originY) * t.scaleY };
}
function mapToGame(pt, t) {
  return { x: pt.x / t.scaleX + t.originX, y: pt.y / t.scaleY + t.originY };
}
module.exports = { parseCoordinates, gameToMap, mapToGame };
