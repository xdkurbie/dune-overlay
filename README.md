# DuneOverlay

Original, open-source interactive map overlay for **Dune: Awakening** (more games via profiles). Not affiliated with Funcom or The Hidden Gaming Lair.

**Safe by design:** no kernel drivers, no game-memory reading, no injection, no admin rights. Position comes from screen capture + OCR of on-screen coordinates, or a manual “I'm here” click.

## Features
- Transparent, always-on-top, click-through overlay (Electron). Works over **borderless/windowed** games only.
- Hotkeys: `Ctrl+Shift+E` toggle interactive/click-through · `Ctrl+Shift+M` show/hide · `Ctrl+Shift+Q` quit
- Leaflet map (blank grid by default), markers with categories, edit/delete, JSON import/export (stored locally per profile).
- OCR (tesseract.js) of a screen region → player marker. Manual “I'm here” fallback.
- English / Norsk UI (i18n strings in `src/renderer/i18n.js`).
- Pluggable game profiles in `profiles/*.json`.

## Use your own map image
No map art is shipped (we don't have rights). In interactive mode click **Map image** and pick an image you own/are licensed to use (e.g. your own screenshot). It's stored locally and stretched to the profile's `map.width × map.height`. Then calibrate `transform` in the profile so game coordinates line up.

## Profiles
```json
{ "id": "my-game", "name": "My Game", "map": {"width":4096,"height":4096,"gridSize":256},
  "transform": {"originX":0,"originY":0,"scaleX":1,"scaleY":1},
  "categories": [{"id":"poi","label":"POI","color":"#c04040"}],
  "ocr": {"pattern": "X:\\s*(-?\\d+)\\s*Y:\\s*(-?\\d+)", "region": {"x":0,"y":0,"width":400,"height":60}, "intervalMs":1500} }
```
`mapPos = (gamePos - origin) * scale`. `ocr.region` is in physical screen pixels; `pattern` must capture x then y.

## Dev
```
npm ci && npm test && npm start
npm run dist:win   # portable .exe in dist/
```
OCR language data is downloaded by tesseract.js on first use (needs internet).

## Limitations
OCR accuracy depends on the game showing coordinates on screen; minimap template matching (OpenCV) is not implemented yet. Fullscreen-exclusive games will hide the overlay.
