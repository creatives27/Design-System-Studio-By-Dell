# Design System Studio

A reusable design system documentation and token generator.
Change the brand color once — every scale, component, token, and dark surface updates live.

## Features

- **Live brand engine** — input any hex, full 50–950 scale generates instantly
- **WCAG auto-test** — every shade is tested against white in real time
- **Light + Dark mode** — dark surfaces are generated from your brand hue
- **4px (Material) or 8pt (Apple HIG)** grid toggle
- **16 component types** — all wired to CSS variables
- **Token export** — downloads Tokens Studio JSON for Figma
- **CSS export** — copies CSS custom properties to clipboard
- **Fully responsive** — works on mobile and desktop

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start the dev server
```bash
npm run dev
```
This opens the app at `http://localhost:3000` with live reload.

### 3. Build for production
```bash
npm run build
```
Output goes to the `dist/` folder — ready to deploy anywhere.

---

## File Structure

```
design-system-studio/
│
├── index.html                  ← Main HTML — add new sections here
│
├── src/
│   ├── css/
│   │   ├── tokens.css          ← ✏️ EDIT: colors, fonts, spacing, radius
│   │   ├── base.css            ← ✏️ EDIT: layout, sidebar, hero, responsive
│   │   └── components.css      ← ✏️ EDIT: buttons, cards, inputs, badges
│   │
│   └── js/
│       ├── engine.js           ← ✏️ EDIT: color math, WCAG, scale generation
│       ├── render.js           ← ✏️ EDIT: how each section renders
│       ├── ui.js               ← ✏️ EDIT: theme, grid, nav, export logic
│       └── main.js             ← Entry point — wires everything together
│
├── package.json
├── vite.config.js
└── .gitignore
```

---

## How to Customize

### Change the font
Open `src/css/tokens.css` and edit:
```css
--font-sans:    'Your Font', sans-serif;
--font-display: 'Your Display Font', sans-serif;
```

### Change the default brand color
Open `src/css/tokens.css` and edit:
```css
--brand-h: 262;   /* Hue: 0-360 */
--brand-s: 57%;   /* Saturation */
--brand-l: 55%;   /* Lightness */
```

### Change all border radius values
Open `src/css/tokens.css` and edit the `--r-*` variables:
```css
--r-sm:  4px;   /* Tags, chips */
--r-md:  8px;   /* Buttons, inputs */
--r-lg:  12px;  /* Alerts, modals */
--r-xl:  16px;  /* Cards, panels */
```

### Add a new button variant
Open `src/css/components.css`, find the `/* ── BUTTONS ──` section, and add:
```css
.btn-custom {
  background: var(--color-brand);
  color: #fff;
  border: 2px solid var(--color-brand-hover);
}
.btn-custom:hover { background: var(--color-brand-hover) }
```
Then add it to `index.html` inside any `.demo-body`.

### Add a new section
1. In `index.html`, copy an existing `<section class="section" id="...">` block
2. Add a new nav link: `<a class="sb-link" data-target="your-id">Your Section</a>`
3. If it needs dynamic content, add a render function in `src/js/render.js`
4. Call it in `src/js/main.js`

### Adjust the color scale algorithm
Open `src/js/engine.js` and edit the `stops` array in `generateScale()`:
```js
{ sh: '600', hs: s, ls: l },  // ← This is your brand base (600)
{ sh: '700', hs: s + 2, ls: l - 10 }, // ← Darker by 10% lightness
```

---

## Deploying to GitHub Pages

1. Push your code to GitHub
2. In `vite.config.js`, set the base path:
   ```js
   base: '/your-repo-name/'
   ```
3. Run `npm run build`
4. Push the `dist/` folder to the `gh-pages` branch, or use a GitHub Action

### Automated GitHub Pages deploy (recommended)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Using for a New Project

1. Clone or copy this folder
2. Open `src/css/tokens.css`
3. Change `--brand-h`, `--brand-s`, `--brand-l` to your brand color's HSL values
4. Change `--font-sans` and `--font-display` to your project fonts
5. Run `npm run dev` — the entire system rebuilds from your new brand

That's it. Every color, component, token, and dark surface updates from that one change.

---

## Tech Stack

- **Vite** — build tool and dev server (no framework required)
- **Vanilla JS with ES modules** — no dependencies
- **CSS Custom Properties** — the entire cascade system
- **DM Mono** — only external font (system Helvetica for UI)

---

## Token Export

Click "Export JSON" in the app to download a Tokens Studio-compatible JSON file.

**Importing into Figma:**
1. Figma → Plugins → Tokens Studio for Figma
2. Settings → Import → select the downloaded JSON
3. Load tokens — `global`, `semantic`, and `dark` sets appear
4. Switch themes via the Themes panel
