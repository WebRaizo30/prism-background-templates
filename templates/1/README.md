# Shape Wave

Source: original [CodePen](https://codepen.io/donotfold/pen/yyapzOP). MIT License per the author on CodePen; see [`../ATTRIBUTION.md`](../ATTRIBUTION.md) (this folder does not ship a separate `LICENSE.txt`).

Bundled as a Prism template. Full list: [../ATTRIBUTION.md](../ATTRIBUTION.md).

## Prism runtime API (`dist/script.js`)

Inside the preview iframe, `window.__prismShapeWave` exposes:

- **`applyConfig(partial)`** — merge numeric/string options (see defaults below).
- **`getState()`** — current snapshot (JSON-serializable).
- **`reset()`** — restore original pen defaults.
- **`defaults`** — reference object.

Tunable fields: `gap`, `radiusVmin`, `speedIn`, `speedOut`, `restScale`, `minHoverScale`, `maxHoverScale`, `waveSpeed`, `waveWidth`, `bgColor`.

## Standalone export (Prism app)

The Prism UI can **download** a single `.html` file that inlines CSS + JS and sets `window.__PRISM_BOOTSTRAP` to your current settings before the script runs. Open the file locally or host it anywhere; keep MIT attribution as in [`../ATTRIBUTION.md`](../ATTRIBUTION.md) if you redistribute.
