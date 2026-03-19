/* ============================================================
   RENDER.JS — DOM Render Functions
   ============================================================
   HOW TO EDIT:
   - renderScale()     → controls how color chips are displayed
   - renderSpacing()   → controls the spacing bar display
   - renderRadius()    → controls the radius preview boxes
   - renderDarkSurfaces() → controls the dark mode layer display
   - renderUsageTokens() → the token table in Usage Tokens section
   - renderJsonPreview() → the JSON export preview
   ============================================================ */

import {
  hexToRgb, rgbToHsl, hslToHex,
  generateScale, getContrast, hueDist, pairingLabel,
  wcagBadge, wcagBadgeSmall
} from './engine.js'

// ── COLOR SCALE CHIPS ─────────────────────────────────────────
export function renderScale(shades, containerId, brandHex) {
  const container = document.getElementById(containerId)
  if (!container) return
  container.innerHTML = ''
  shades.forEach(d => {
    const ratio = getContrast(d.hex)
    const chip = document.createElement('div')
    chip.className = 'scale-chip' + (d.hex.toUpperCase() === brandHex.toUpperCase() ? ' is-brand' : '')
    chip.onclick = () => copyHex(d.hex)
    chip.title = 'Click to copy ' + d.hex
    chip.innerHTML = `
      <div class="chip-swatch" style="background:${d.hex}"></div>
      <div class="chip-body">
        <div class="chip-shade">${d.shade}</div>
        <div class="chip-hex">${d.hex}</div>
        <div class="chip-wcag">${wcagBadgeSmall(ratio)}</div>
      </div>`
    container.appendChild(chip)
  })
}

// ── SEMANTIC COLORS ───────────────────────────────────────────
export function renderSemanticGrid() {
  const semantics = [
    { name: 'Success', hex: '#15803D', bg: '#F0FDF4', border: '#BBF7D0', icon: '✓' },
    { name: 'Warning', hex: '#B45309', bg: '#FFFBEB', border: '#FDE68A', icon: '⚠' },
    { name: 'Error',   hex: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', icon: '✕' },
    { name: 'Info',    hex: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE', icon: 'ℹ' },
  ]
  const grid = document.getElementById('semantic-grid')
  if (!grid) return
  grid.innerHTML = semantics.map(s => `
    <div class="semantic-card" style="border-color:${s.border}">
      <div class="semantic-swatch" style="background:${s.bg}">${s.icon}</div>
      <div class="semantic-info">
        <div class="semantic-name" style="color:${s.hex}">${s.name}</div>
        <div class="semantic-hex">${s.hex}</div>
      </div>
    </div>`).join('')
}

// ── WCAG LIVE TEST ────────────────────────────────────────────
export function renderWcagLive(scale) {
  const container = document.getElementById('wcag-live-rows')
  if (!container) return
  // Only show 600–950 (text-safe range)
  const textShades = ['600', '700', '800', '900', '950']
  container.innerHTML = scale
    .filter(s => textShades.includes(s.shade))
    .map(d => {
      const ratio = getContrast(d.hex)
      return `<div class="wcag-row">
        <div class="wcag-swatch" style="background:${d.hex}"></div>
        <div class="wcag-info">
          <span class="wcag-shade">${d.shade}</span>
          <span class="wcag-ratio">${ratio}:1</span>
        </div>
        ${wcagBadge(ratio)}
      </div>`
    }).join('')
}

// ── PAIRING ANALYSIS ──────────────────────────────────────────
export function renderPairing() {
  const bHex = document.getElementById('brand-hex-input')?.value || '#7A48CD'
  const sHex = document.getElementById('sec-hex-input')?.value || '#D3507A'
  const bRgb = hexToRgb(bHex), sRgb = hexToRgb(sHex)
  const [bh] = rgbToHsl(bRgb.r, bRgb.g, bRgb.b)
  const [sh] = rgbToHsl(sRgb.r, sRgb.g, sRgb.b)
  const dist = hueDist(bh, sh)
  const p = pairingLabel(dist)
  const pr = document.getElementById('pairing-result')
  if (pr) pr.innerHTML = `<strong style="color:var(--text-primary)">${p.label}</strong><br>${dist}° hue distance · ${p.tip}`
}

// ── SPACING BARS ──────────────────────────────────────────────
export function renderSpacing(gridSize) {
  const container = document.getElementById('spacing-bars')
  if (!container) return

  // 4px grid values
  const sp4 = [
    { t: '--sp-1',  v: '4px',  u: 'Icon gap, tight insets' },
    { t: '--sp-2',  v: '8px',  u: 'Badge padding, tag gap' },
    { t: '--sp-3',  v: '12px', u: 'Input padding Y, btn-sm' },
    { t: '--sp-4',  v: '16px', u: 'Card inner, list gap' },
    { t: '--sp-5',  v: '20px', u: 'Section margin' },
    { t: '--sp-6',  v: '24px', u: 'Card padding' },
    { t: '--sp-8',  v: '32px', u: 'Between sections' },
    { t: '--sp-12', v: '48px', u: 'Page sections' },
    { t: '--sp-16', v: '64px', u: 'Hero padding' },
  ]

  // 8pt grid values (Apple HIG)
  const sp8 = [
    { t: '--sp-1',  v: '8px',   u: 'Minimum gap' },
    { t: '--sp-2',  v: '16px',  u: 'Default padding' },
    { t: '--sp-3',  v: '24px',  u: 'Card padding' },
    { t: '--sp-4',  v: '32px',  u: 'Section inner' },
    { t: '--sp-5',  v: '40px',  u: 'Component spacing' },
    { t: '--sp-6',  v: '48px',  u: 'Section spacing' },
    { t: '--sp-8',  v: '64px',  u: 'Major sections' },
    { t: '--sp-12', v: '96px',  u: 'Page sections' },
    { t: '--sp-16', v: '128px', u: 'Hero padding' },
  ]

  const items = gridSize === '8' ? sp8 : sp4
  const maxPx = parseInt(items[items.length - 1].v)

  container.innerHTML = items.map(i => `
    <div class="sp-row">
      <span class="sp-token">${i.t}</span>
      <span class="sp-val">${i.v}</span>
      <div class="sp-bar-wrap">
        <div class="sp-bar" style="width:${Math.min(parseInt(i.v) / maxPx * 360, 360)}px"></div>
      </div>
      <span class="sp-use">${i.u}</span>
    </div>`).join('')
}

// ── BORDER RADIUS DEMOS ───────────────────────────────────────
export function renderRadius() {
  const radii = [
    { n: 'r-none', v: '0',    sz: 40, u: 'No rounding' },
    { n: 'r-sm',   v: '4px',  sz: 44, u: 'Tags, chips' },
    { n: 'r-md',   v: '8px',  sz: 52, u: 'Buttons, inputs' },
    { n: 'r-lg',   v: '12px', sz: 60, u: 'Alerts, modals' },
    { n: 'r-xl',   v: '16px', sz: 68, u: 'Cards, panels' },
    { n: 'r-2xl',  v: '24px', sz: 72, u: 'Feature cards' },
    { n: 'r-full', v: '9999px', sz: 60, u: 'Pills, avatars' },
  ]
  const container = document.getElementById('radius-demo')
  if (!container) return
  container.innerHTML = radii.map(r => `
    <div class="radius-item">
      <div class="radius-box" style="width:${r.sz}px;height:${r.sz}px;border-radius:var(--${r.n})"></div>
      <div class="radius-lbl">
        <div class="rn">${r.n}</div>
        <div class="rv">${r.v}</div>
        <div class="ru">${r.u}</div>
      </div>
    </div>`).join('')
}

// ── DARK SURFACE LAYERS ───────────────────────────────────────
export function renderDarkSurfaces(h) {
  const layers = [
    { n: 'dark-surface.base',    bg: `hsl(${h}, 60%, 5%)`,  border: `hsl(${h}, 45%, 10%)`, u: 'Behind everything — deepest', lbl: 'Layer 0' },
    { n: 'dark-surface.page',    bg: `hsl(${h}, 58%, 7%)`,  border: `hsl(${h}, 42%, 12%)`, u: 'App background canvas',       lbl: 'Layer 1' },
    { n: 'dark-surface.card',    bg: `hsl(${h}, 55%, 10%)`, border: `hsl(${h}, 40%, 16%)`, u: 'Cards, table, content areas', lbl: 'Layer 2' },
    { n: 'dark-surface.raised',  bg: `hsl(${h}, 50%, 14%)`, border: `hsl(${h}, 38%, 20%)`, u: 'Sidebar, modals, panels',     lbl: 'Layer 3' },
    { n: 'dark-surface.overlay', bg: `hsl(${h}, 46%, 18%)`, border: `hsl(${h}, 36%, 24%)`, u: 'Hover fill, input bg',        lbl: 'Layer 4' },
    { n: 'dark-surface.float',   bg: `hsl(${h}, 44%, 22%)`, border: `hsl(${h}, 34%, 28%)`, u: 'Dropdowns, tooltips',         lbl: 'Layer 5' },
  ]
  const container = document.getElementById('dark-surfaces-demo')
  if (!container) return
  container.style.background = `hsl(${h}, 60%, 5%)`
  container.innerHTML = layers.map(l => `
    <div class="dark-layer">
      <div class="dark-swatch" style="background:${l.bg};border:0.5px solid ${l.border}"></div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:600;color:hsl(${h},40%,80%)">${l.n}</div>
        <div style="font-size:10px;font-family:monospace;color:hsl(${h},25%,50%)">${l.bg}</div>
        <div style="font-size:10px;color:hsl(${h},20%,40%);margin-top:1px">${l.u}</div>
      </div>
      <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:9999px;background:rgba(255,255,255,0.06);color:hsl(${h},25%,50%)">${l.lbl}</span>
    </div>`).join('')
}

// ── USAGE TOKEN TABLE ─────────────────────────────────────────
export function renderUsageTokens(brandHex, secHex) {
  const tokens = [
    { t: 'action.primary',        css: '--color-brand',         lv: brandHex,               dv: 'lightened 1 stop',        u: 'Buttons, links, nav active' },
    { t: 'action.primary-hover',  css: '--color-brand-hover',   lv: 'darker 1 stop',        dv: 'original brand',          u: 'Hover state of primary' },
    { t: 'action.subtle-bg',      css: '--color-brand-subtle',  lv: 'Brand 100',            dv: 'Brand 18% tint on dark',  u: 'Chip bg, hover fill' },
    { t: 'action.secondary',      css: '--color-secondary',     lv: secHex,                 dv: 'lightened 1 stop',        u: 'Secondary CTA, accent' },
    { t: 'text.primary',          css: '--text-primary',        lv: 'Grey 950 (#2B292D)',   dv: 'off-white (94% lightness)',u: 'Headings, body copy' },
    { t: 'text.secondary',        css: '--text-secondary',      lv: 'Grey 700 (#737175)',   dv: 'muted purple-grey',        u: 'Helper text, captions' },
    { t: 'text.brand',            css: '--text-brand',          lv: brandHex,               dv: 'lightened brand',          u: 'Brand-colored links' },
    { t: 'surface.page',          css: '--surf-page',           lv: 'Grey 50',              dv: 'brand-tinted dark 7%',     u: 'App background' },
    { t: 'surface.card',          css: '--surf-card',           lv: 'White',                dv: 'dark card layer 10%',      u: 'Cards, modals' },
    { t: 'surface.raised',        css: '--surf-raised',         lv: 'White',                dv: 'raised dark layer 14%',    u: 'Sidebar, panels' },
    { t: 'border.default',        css: '--border-default',      lv: 'Grey 200',             dv: 'dark border 18%',          u: 'Card borders, dividers' },
    { t: 'border.focus',          css: '--border-focus',        lv: brandHex,               dv: 'lightened brand',          u: 'Input focus ring' },
    { t: 'feedback.success-text', css: '--success',             lv: '#15803D',              dv: '#4ADE80',                  u: 'Success states' },
    { t: 'feedback.warning-text', css: '--warning',             lv: '#B45309',              dv: '#FCD34D',                  u: 'Warning states' },
    { t: 'feedback.error-text',   css: '--error',               lv: '#B91C1C',              dv: '#FCA5A5',                  u: 'Error states' },
    { t: 'feedback.info-text',    css: '--info',                lv: '#1D4ED8',              dv: '#93C5FD',                  u: 'Info states' },
  ]
  const tbody = document.getElementById('usage-token-tbody')
  if (!tbody) return
  tbody.innerHTML = tokens.map(t => `
    <tr>
      <td><span class="mono">${t.t}</span></td>
      <td><span class="mono" style="font-size:11px">${t.css}</span></td>
      <td style="font-size:12px;color:var(--text-secondary)">${t.lv}</td>
      <td style="font-size:12px;color:var(--text-secondary)">${t.dv}</td>
      <td style="font-size:12px;color:var(--text-secondary)">${t.u}</td>
    </tr>`).join('')
}

// ── JSON EXPORT PREVIEW ───────────────────────────────────────
export function renderJsonPreview(brandHex, secHex, name) {
  const rgb = hexToRgb(brandHex)
  const [bh, bs, bl] = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const scale = generateScale(bh, bs, bl)
  const container = document.getElementById('json-preview')
  if (!container) return
  container.innerHTML = `<span class="jc">// ${name} — Tokens Studio JSON · Brand: ${brandHex}</span>
<span class="js">{</span>
  <span class="jk">"global"</span>: <span class="js">{</span>
    <span class="jk">"color"</span>: <span class="js">{</span>
      <span class="jk">"brand"</span>: <span class="js">{</span>
${scale.map(s => `        <span class="jk">"${s.shade}"</span>: <span class="js">{ "value":</span> <span class="jv">"${s.hex}"</span><span class="js">, "type": "color" }</span>`).join(',\n')}
      <span class="js">}</span>
    <span class="js">}</span>
  <span class="js">},</span>
  <span class="jk">"semantic"</span>: <span class="js">{</span>
    <span class="jk">"action.primary"</span>: <span class="js">{ "value": "{global.color.brand.600}", "type": "color" },</span>
    <span class="jk">"text.primary"</span>:   <span class="js">{ "value": "{global.color.grey.950}", "type": "color" },</span>
    <span class="jk">"surface.page"</span>:   <span class="js">{ "value": "{global.color.grey.50}", "type": "color" }</span>
  <span class="js">},</span>
  <span class="jk">"dark"</span>: <span class="js">{</span>
    <span class="jk">"action.primary"</span>: <span class="js">{ "value":</span> <span class="jv">"hsl(${bh}, ${Math.min(bs + 5, 75)}%, ${Math.min(bl + 12, 72)}%)"</span><span class="js">, "type": "color" },</span>
    <span class="jk">"surface.page"</span>:   <span class="js">{ "value":</span> <span class="jv">"hsl(${bh}, ${bs}%, 7%)"</span><span class="js">, "type": "color" }</span>
  <span class="js">}</span>
<span class="js">}</span>`
}

// ── GREY SCALE (fixed) ────────────────────────────────────────
export const GREY_SCALE = [
  { shade: '50',  hex: '#F7F7FB' },
  { shade: '100', hex: '#EFEFF0' },
  { shade: '200', hex: '#D9D8DB' },
  { shade: '300', hex: '#C6C4C8' },
  { shade: '400', hex: '#BEBCC1' },
  { shade: '500', hex: '#9F9DA2' },
  { shade: '600', hex: '#827F85' },
  { shade: '700', hex: '#737175' },
  { shade: '800', hex: '#5B585E' },
  { shade: '900', hex: '#423F44' },
  { shade: '950', hex: '#2B292D' },
]

// ── COPY HEX UTILITY ─────────────────────────────────────────
export function copyHex(hex) {
  navigator.clipboard.writeText(hex).catch(() => {})
  showCopyToast('Copied ' + hex)
}

export function showCopyToast(msg) {
  const toast = document.getElementById('copy-toast')
  if (!toast) return
  toast.textContent = msg
  toast.classList.add('show')
  clearTimeout(toast._timer)
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2000)
}
