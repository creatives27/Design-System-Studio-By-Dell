/* ============================================================
   UI.JS — Theme Toggle, Grid Toggle, Navigation, Export
   ============================================================
   HOW TO EDIT:
   - setTheme()           → controls light / brand-dark / grey-dark
   - showDarkMode()       → switches the dark surfaces demo panel
   - renderGreyScaleDemo() → builds the grey scale reference UI
   - setGrid()            → controls 4px/8pt grid toggle
   - exportTokens()       → controls what goes into the JSON download
   ============================================================ */

import {
  hexToRgb, rgbToHsl, hslToHex, generateScale,
  getContrast, hueDist, pairingLabel
} from './engine.js'

import {
  renderScale, renderSemanticGrid, renderWcagLive,
  renderPairing, renderSpacing, renderRadius,
  renderDarkSurfaces, renderUsageTokens, renderJsonPreview,
  GREY_SCALE, copyHex, showCopyToast
} from './render.js'


/* ============================================================
   THEME TOGGLE
   3 modes:
     'light'  → light mode
     'dark'   → dark mode, brand-tinted surfaces
     'grey'   → dark mode, neutral grey surfaces (industry standard)
   ============================================================ */
export function setTheme(t) {
  const html = document.documentElement

  if (t === 'light') {
    html.setAttribute('data-theme', 'light')
    html.removeAttribute('data-dark')
  } else if (t === 'dark') {
    html.setAttribute('data-theme', 'dark')
    html.removeAttribute('data-dark')
  } else if (t === 'grey') {
    html.setAttribute('data-theme', 'dark')
    html.setAttribute('data-dark', 'grey')
  }

  // Update sidebar button states
  document.getElementById('btn-light')?.classList.toggle('on', t === 'light')
  document.getElementById('btn-dark')?.classList.toggle('on', t === 'dark')
  document.getElementById('btn-dark-grey')?.classList.toggle('on', t === 'grey')
}


/* ============================================================
   DARK SURFACES SECTION — panel toggle
   Switches between brand-tinted and grey reference panels
   ============================================================ */
export function showDarkMode(mode) {
  const brandPanel = document.getElementById('ds-brand-panel')
  const greyPanel  = document.getElementById('ds-grey-panel')
  const brandBtn   = document.getElementById('ds-brand-btn')
  const greyBtn    = document.getElementById('ds-grey-btn')
  if (!brandPanel || !greyPanel) return

  const showGrey = mode === 'grey'
  brandPanel.style.display = showGrey ? 'none'  : 'block'
  greyPanel.style.display  = showGrey ? 'block' : 'none'
  brandBtn.className = showGrey ? 'btn btn-ghost btn-sm'   : 'btn btn-primary btn-sm'
  greyBtn.className  = showGrey ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'

  if (showGrey) renderGreyScaleDemo()
}


/* ============================================================
   GREY DARK MODE REFERENCE RENDERER
   Renders:
     1. Elevation layer demo (6 layers with --dg-* values)
     2. Full 20-stop --dg-* scale strip (click to copy)
     3. Real product references (GitHub, VS Code, Linear etc.)
   ============================================================ */
export function renderGreyScaleDemo() {
  // ── Full dark grey scale ───────────────────────────────
  const dgScale = [
    { v: '--dg-950', hex: '#0D0D0D', lbl: '950', use: 'Behind everything' },
    { v: '--dg-900', hex: '#111111', lbl: '900', use: 'Page bg (GitHub)' },
    { v: '--dg-875', hex: '#141414', lbl: '875', use: 'Page bg alt' },
    { v: '--dg-850', hex: '#171717', lbl: '850', use: 'App canvas (Vercel)' },
    { v: '--dg-800', hex: '#1A1A1A', lbl: '800', use: 'Card (Linear)' },
    { v: '--dg-775', hex: '#1E1E1E', lbl: '775', use: 'VS Code editor' },
    { v: '--dg-750', hex: '#222222', lbl: '750', use: 'Raised panel' },
    { v: '--dg-700', hex: '#252525', lbl: '700', use: 'Sidebar (Notion)' },
    { v: '--dg-650', hex: '#2A2A2A', lbl: '650', use: 'Overlay / hover' },
    { v: '--dg-600', hex: '#303030', lbl: '600', use: 'Float / dropdown' },
    { v: '--dg-550', hex: '#383838', lbl: '550', use: 'Border subtle' },
    { v: '--dg-500', hex: '#404040', lbl: '500', use: 'Border default' },
    { v: '--dg-450', hex: '#4A4A4A', lbl: '450', use: 'Border strong' },
    { v: '--dg-400', hex: '#525252', lbl: '400', use: 'Disabled text' },
    { v: '--dg-300', hex: '#6B6B6B', lbl: '300', use: 'Tertiary / placeholder' },
    { v: '--dg-200', hex: '#8A8A8A', lbl: '200', use: 'Secondary (muted)' },
    { v: '--dg-150', hex: '#A0A0A0', lbl: '150', use: 'Secondary (comfortable)' },
    { v: '--dg-100', hex: '#B8B8B8', lbl: '100', use: 'Body text' },
    { v: '--dg-50',  hex: '#E0E0E0', lbl: '50',  use: 'Primary — near white' },
    { v: '--dg-0',   hex: '#F5F5F5', lbl: '0',   use: 'Headings, labels' },
  ]

  // ── Elevation layers using --dg-* ─────────────────────
  const layers = [
    { n: 'dark-surface.base',    hex: '#0D0D0D', token: '--dg-950', border: '#1A1A1A', u: 'Behind everything — deepest',  lbl: 'Layer 0' },
    { n: 'dark-surface.page',    hex: '#111111', token: '--dg-900', border: '#222222', u: 'App background  (GitHub dark)', lbl: 'Layer 1' },
    { n: 'dark-surface.card',    hex: '#1A1A1A', token: '--dg-800', border: '#2A2A2A', u: 'Cards, table, content areas',  lbl: 'Layer 2' },
    { n: 'dark-surface.raised',  hex: '#252525', token: '--dg-700', border: '#303030', u: 'Sidebar, modals, panels',       lbl: 'Layer 3' },
    { n: 'dark-surface.overlay', hex: '#2A2A2A', token: '--dg-650', border: '#383838', u: 'Hover fill, input bg',          lbl: 'Layer 4' },
    { n: 'dark-surface.float',   hex: '#303030', token: '--dg-600', border: '#404040', u: 'Dropdowns, tooltips',           lbl: 'Layer 5' },
  ]

  const lc = document.getElementById('grey-scale-demo')
  if (lc) {
    lc.innerHTML = layers.map(l => `
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:52px;height:36px;border-radius:8px;background:${l.hex};border:0.5px solid ${l.border};flex-shrink:0"></div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:600;color:#E0E0E0">${l.n}</div>
          <div style="font-size:10px;font-family:monospace;color:#525252">
            ${l.hex} · <span style="color:#6B6B6B">${l.token}</span>
          </div>
          <div style="font-size:10px;color:#404040;margin-top:1px">${l.u}</div>
        </div>
        <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:9999px;background:rgba(255,255,255,.05);color:#525252;white-space:nowrap">
          ${l.lbl}
        </span>
      </div>`).join('')
  }

  // ── Full scale strip ───────────────────────────────────
  const strip = document.getElementById('dg-scale-strip')
  if (strip) {
    strip.innerHTML = dgScale.map(d => `
      <div style="flex:1;cursor:pointer;min-width:0" onclick="copyHex('${d.hex}')" title="${d.use} · ${d.hex}">
        <div style="height:52px;background:${d.hex}"></div>
        <div style="padding:5px 6px;background:var(--surf-card);border-top:1px solid var(--border-default)">
          <div style="font-size:10px;font-weight:700;color:var(--text-primary)">${d.lbl}</div>
          <div style="font-size:9px;font-family:monospace;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.hex}</div>
        </div>
      </div>`).join('')
  }

  // ── Popular product references ─────────────────────────
  const products = [
    { name: 'GitHub Dark',  page: '#0D1117', card: '#161B22', raised: '#21262D', border: '#30363D', text: '#E6EDF3', sub: '#8B949E' },
    { name: 'VS Code',      page: '#1E1E1E', card: '#252526', raised: '#2D2D2D', border: '#3E3E42', text: '#D4D4D4', sub: '#858585' },
    { name: 'Linear',       page: '#0F0F0F', card: '#1A1A1A', raised: '#212121', border: '#2E2E2E', text: '#F2F2F2', sub: '#6F6F6F' },
    { name: 'Vercel',       page: '#000000', card: '#111111', raised: '#1A1A1A', border: '#292929', text: '#EDEDED', sub: '#888888' },
    { name: 'Notion Dark',  page: '#191919', card: '#202020', raised: '#2A2A2A', border: '#373737', text: '#FFFFFE', sub: '#9B9B9B' },
    { name: 'Raycast',      page: '#060607', card: '#1C1C1E', raised: '#2C2C2E', border: '#38383A', text: '#FFFFFF', sub: '#8E8E93' },
  ]

  const pr = document.getElementById('product-dark-ref')
  if (pr) {
    pr.innerHTML = products.map(p => `
      <div style="border:1px solid var(--border-default);border-radius:var(--r-lg);overflow:hidden">
        <div style="background:${p.page};padding:12px 14px 10px">
          <div style="font-size:12px;font-weight:600;color:${p.text};margin-bottom:8px">${p.name}</div>
          <div style="display:flex;gap:6px;margin-bottom:8px">
            <div style="flex:1;height:28px;border-radius:5px;background:${p.card};border:0.5px solid ${p.border}"></div>
            <div style="flex:1;height:28px;border-radius:5px;background:${p.raised};border:0.5px solid ${p.border}"></div>
          </div>
          <div style="font-size:11px;color:${p.sub}">Secondary text example</div>
        </div>
        <div style="padding:8px 12px;background:var(--surf-card)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;font-size:9px;font-family:monospace;color:var(--text-tertiary)">
            <span>Page: ${p.page}</span>
            <span>Card: ${p.card}</span>
            <span>Border: ${p.border}</span>
            <span>Text: ${p.text}</span>
          </div>
        </div>
      </div>`).join('')
  }
}


/* ============================================================
   GRID TOGGLE
   ============================================================ */
export function setGrid(g) {
  document.documentElement.setAttribute('data-grid', g)
  document.getElementById('btn-4px')?.classList.toggle('on', g === '4')
  document.getElementById('btn-8pt')?.classList.toggle('on', g === '8')
  document.getElementById('gbtn-4')?.classList.toggle('active', g === '4')
  document.getElementById('gbtn-8')?.classList.toggle('active', g === '8')

  const lbl = document.getElementById('grid-label-indicator')
  if (lbl) lbl.textContent = g === '4'
    ? '4px base grid (Material Design)'
    : '8pt base grid (Apple HIG)'

  renderSpacing(g)
  renderRadius()
}


/* ============================================================
   BRAND + SECONDARY UPDATE ENGINE
   Called every time the user changes the brand hex input.
   Updates all CSS vars → entire UI cascades instantly.
   ============================================================ */
export function updateBrand(hex, updateInputs = true) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return
  const rgb = hexToRgb(hex)
  const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const root = document.documentElement

  root.style.setProperty('--brand-h', h)
  root.style.setProperty('--brand-s', s + '%')
  root.style.setProperty('--brand-l', l + '%')
  root.style.setProperty('--brand-hex', hex)

  const preview = document.getElementById('brand-preview')
  if (preview) preview.style.background = hex
  if (updateInputs) {
    const hexInput = document.getElementById('brand-hex-input')
    const picker   = document.getElementById('brand-color-picker')
    if (hexInput) hexInput.value = hex
    if (picker)   picker.value  = hex
  }

  const pillBrand = document.getElementById('pill-brand-hex')
  if (pillBrand) pillBrand.textContent = hex

  const typeMono = document.getElementById('type-mono-preview')
  if (typeMono) typeMono.textContent = `${hex} · rgba(${rgb.r}, ${rgb.g}, ${rgb.b})`

  const scale = generateScale(h, s, l)
  renderScale(scale, 'brand-scale', hex)
  renderWcagLive(scale)
  renderDarkSurfaces(h)
  renderSemanticGrid()

  const secHex = document.getElementById('sec-hex-input')?.value || '#D3507A'
  const name   = document.getElementById('brand-name')?.value    || 'Design System'
  renderJsonPreview(hex, secHex, name)
  renderUsageTokens(hex, secHex)
  renderPairing()
  // Refresh gradients with new brand color
  renderGradients(hex, secHex)
}

export function updateSecondary(hex) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return
  const rgb = hexToRgb(hex)
  const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const root = document.documentElement

  root.style.setProperty('--secondary-h', h)
  root.style.setProperty('--secondary-s', s + '%')
  root.style.setProperty('--secondary-l', l + '%')

  const preview = document.getElementById('sec-preview')
  if (preview) preview.style.background = hex

  const pillSec = document.getElementById('pill-sec-hex')
  if (pillSec) pillSec.textContent = hex

  const secScale = generateScale(h, s, l)
  renderScale(secScale, 'secondary-scale', hex)
  renderPairing()
}


/* ============================================================
   INPUT HANDLERS
   ============================================================ */
export function onBrandPick(val)  { updateBrand(val) }
export function onBrandType(val) {
  const hex = val.startsWith('#') ? val : '#' + val
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    const preview = document.getElementById('brand-preview')
    const picker  = document.getElementById('brand-color-picker')
    if (preview) preview.style.background = hex
    if (picker)  picker.value = hex
    updateBrand(hex, false)
  }
}
export function onSecPick(val) { updateSecondary(val) }
export function onSecType(val) {
  const hex = val.startsWith('#') ? val : '#' + val
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    const preview = document.getElementById('sec-preview')
    const picker  = document.getElementById('sec-color-picker')
    if (preview) preview.style.background = hex
    if (picker)  picker.value = hex
    updateSecondary(hex)
  }
}
export function onNameChange(val) {
  const name = val || 'Design System'
  ;['sb-name', 'footer-name', 'toast-brand-name'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.textContent = name
  })
  document.title = name + ' — Design System'
}


/* ============================================================
   EXPORT TOKENS JSON
   ============================================================ */
export function exportTokens() {
  const brandHex = document.getElementById('brand-hex-input')?.value || '#7A48CD'
  const secHex   = document.getElementById('sec-hex-input')?.value   || '#D3507A'
  const name     = document.getElementById('brand-name')?.value      || 'Design System'

  const bRgb = hexToRgb(brandHex)
  const [bh, bs, bl] = rgbToHsl(bRgb.r, bRgb.g, bRgb.b)
  const scale = generateScale(bh, bs, bl)

  const sRgb = hexToRgb(secHex)
  const [sh, ss, sl] = rgbToHsl(sRgb.r, sRgb.g, sRgb.b)
  const secScale = generateScale(sh, ss, sl)

  const tokens = {
    global: {
      color: {
        brand:     Object.fromEntries(scale.map(s    => [s.shade, { value: s.hex, type: 'color' }])),
        secondary: Object.fromEntries(secScale.map(s => [s.shade, { value: s.hex, type: 'color' }])),
        grey: {
          '50':  { value: '#F7F7FB', type: 'color' },
          '100': { value: '#EFEFF0', type: 'color' },
          '200': { value: '#D9D8DB', type: 'color' },
          '700': { value: '#737175', type: 'color' },
          '800': { value: '#5B585E', type: 'color' },
          '950': { value: '#2B292D', type: 'color' },
        },
        // Neutral dark grey scale — included in every export
        'dark-grey': {
          '950': { value: '#0D0D0D', type: 'color', description: 'Behind everything' },
          '900': { value: '#111111', type: 'color', description: 'Page bg (GitHub dark)' },
          '875': { value: '#141414', type: 'color' },
          '850': { value: '#171717', type: 'color', description: 'App canvas (Vercel)' },
          '800': { value: '#1A1A1A', type: 'color', description: 'Card surface (Linear)' },
          '775': { value: '#1E1E1E', type: 'color', description: 'VS Code editor' },
          '750': { value: '#222222', type: 'color' },
          '700': { value: '#252525', type: 'color', description: 'Sidebar (Notion)' },
          '650': { value: '#2A2A2A', type: 'color', description: 'Overlay / hover' },
          '600': { value: '#303030', type: 'color', description: 'Float / dropdown' },
          '550': { value: '#383838', type: 'color', description: 'Border subtle' },
          '500': { value: '#404040', type: 'color', description: 'Border default' },
          '450': { value: '#4A4A4A', type: 'color', description: 'Border strong' },
          '400': { value: '#525252', type: 'color', description: 'Disabled text' },
          '300': { value: '#6B6B6B', type: 'color', description: 'Tertiary / placeholder' },
          '200': { value: '#8A8A8A', type: 'color', description: 'Secondary text (muted)' },
          '150': { value: '#A0A0A0', type: 'color', description: 'Secondary text' },
          '100': { value: '#B8B8B8', type: 'color', description: 'Body text' },
          '50':  { value: '#E0E0E0', type: 'color', description: 'Primary — near white' },
          '0':   { value: '#F5F5F5', type: 'color', description: 'Headings, labels' },
        },
      },
    },
    semantic: {
      color: {
        'action.primary':       { value: '{global.color.brand.600}',     type: 'color' },
        'action.primary-hover': { value: '{global.color.brand.700}',     type: 'color' },
        'action.subtle-bg':     { value: '{global.color.brand.100}',     type: 'color' },
        'action.secondary':     { value: '{global.color.secondary.500}', type: 'color' },
        'text.primary':         { value: '{global.color.grey.950}',      type: 'color' },
        'text.secondary':       { value: '{global.color.grey.700}',      type: 'color' },
        'surface.page':         { value: '{global.color.grey.50}',       type: 'color' },
        'surface.card':         { value: '#FFFFFF',                      type: 'color' },
        'border.default':       { value: '{global.color.grey.200}',      type: 'color' },
        'border.focus':         { value: '{global.color.brand.600}',     type: 'color' },
      },
    },
    'dark-brand': {
      description: 'Brand-tinted dark mode — surfaces carry brand hue',
      color: {
        'action.primary':  { value: `hsl(${bh}, ${Math.min(bs + 5, 75)}%, ${Math.min(bl + 12, 72)}%)`, type: 'color' },
        'text.primary':    { value: `hsl(${bh}, 50%, 92%)`, type: 'color' },
        'text.secondary':  { value: `hsl(${bh}, 25%, 60%)`, type: 'color' },
        'surface.page':    { value: `hsl(${bh}, ${bs}%, 7%)`,  type: 'color' },
        'surface.card':    { value: `hsl(${bh}, ${Math.max(bs - 5, 40)}%, 10%)`, type: 'color' },
        'surface.raised':  { value: `hsl(${bh}, ${Math.max(bs - 8, 35)}%, 14%)`, type: 'color' },
        'border.default':  { value: `hsl(${bh}, 35%, 18%)`, type: 'color' },
      },
    },
    'dark-grey': {
      description: 'Neutral grey dark mode — no brand hue on surfaces. Industry standard.',
      color: {
        'action.primary':  { value: `hsl(${bh}, ${Math.min(bs + 5, 75)}%, ${Math.min(bl + 12, 72)}%)`, type: 'color' },
        'text.primary':    { value: '{global.color.dark-grey.0}',   type: 'color' },
        'text.secondary':  { value: '{global.color.dark-grey.150}', type: 'color' },
        'text.tertiary':   { value: '{global.color.dark-grey.300}', type: 'color' },
        'text.disabled':   { value: '{global.color.dark-grey.400}', type: 'color' },
        'surface.page':    { value: '{global.color.dark-grey.900}', type: 'color' },
        'surface.card':    { value: '{global.color.dark-grey.800}', type: 'color' },
        'surface.raised':  { value: '{global.color.dark-grey.700}', type: 'color' },
        'surface.sunken':  { value: '{global.color.dark-grey.950}', type: 'color' },
        'surface.overlay': { value: '{global.color.dark-grey.650}', type: 'color' },
        'surface.float':   { value: '{global.color.dark-grey.600}', type: 'color' },
        'border.subtle':   { value: '{global.color.dark-grey.550}', type: 'color' },
        'border.default':  { value: '{global.color.dark-grey.500}', type: 'color' },
        'border.strong':   { value: '{global.color.dark-grey.450}', type: 'color' },
      },
    },
    '$metadata': {
      tokenSetOrder: ['global', 'semantic', 'dark-brand', 'dark-grey'],
    },
    '$themes': [
      { id: 'light',      name: 'Light',            selectedTokenSets: { global: 'enabled', semantic: 'enabled', 'dark-brand': 'disabled', 'dark-grey': 'disabled' } },
      { id: 'dark-brand', name: 'Dark — Brand',     selectedTokenSets: { global: 'enabled', semantic: 'disabled', 'dark-brand': 'enabled', 'dark-grey': 'disabled' } },
      { id: 'dark-grey',  name: 'Dark — Grey ★',    selectedTokenSets: { global: 'enabled', semantic: 'disabled', 'dark-brand': 'disabled', 'dark-grey': 'enabled' } },
    ],
  }

  const blob = new Blob([JSON.stringify(tokens, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name.toLowerCase().replace(/\s+/g, '-') + '-tokens.json'
  a.click()
  showCopyToast('Downloading ' + a.download)
}


/* ============================================================
   COPY CSS VARIABLES
   ============================================================ */
export function copyAllCSS() {
  const brandHex = document.getElementById('brand-hex-input')?.value || '#7A48CD'
  const secHex   = document.getElementById('sec-hex-input')?.value   || '#D3507A'
  const rgb = hexToRgb(brandHex)
  const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const css = `:root {
  --brand-h: ${h};
  --brand-s: ${s}%;
  --brand-l: ${l}%;
  --brand-hex: ${brandHex};
  --secondary-hex: ${secHex};
  --color-brand: hsl(${h}, ${s}%, ${l}%);
  --color-brand-hover: hsl(${h}, ${s}%, ${Math.max(l - 10, 30)}%);
  --color-brand-subtle: hsl(${h}, ${Math.min(s + 20, 95)}%, ${Math.min(l + 38, 95)}%);
}`
  navigator.clipboard.writeText(css).catch(() => {})
  showCopyToast('CSS variables copied!')
}


/* ============================================================
   NAVIGATION
   ============================================================ */
export function initNav() {
  document.querySelectorAll('.sb-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const target = link.getAttribute('data-target')
      const el = document.getElementById(target)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'))
      link.classList.add('active')
      const topSection = document.getElementById('topbar-section')
      if (topSection) topSection.textContent = link.textContent.trim()
      if (window.innerWidth <= 768) closeSidebar()
    })
  })
}

export function initScrollSpy() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id
        document.querySelectorAll('.sb-link').forEach(l => {
          l.classList.toggle('active', l.getAttribute('data-target') === id)
        })
        const active = document.querySelector(`.sb-link[data-target="${id}"]`)
        const topSection = document.getElementById('topbar-section')
        if (active && topSection) topSection.textContent = active.textContent.trim()
      }
    })
  }, { rootMargin: '-15% 0px -75% 0px' })
  document.querySelectorAll('.section').forEach(s => observer.observe(s))
}

export function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open')
  document.getElementById('backdrop')?.classList.toggle('show')
}
export function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open')
  document.getElementById('backdrop')?.classList.remove('show')
}

export function initComponents() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tab.closest('.tabs').querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
    })
  })
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.closest('.demo-body').querySelectorAll('.chip').forEach(c => c.classList.remove('selected'))
      chip.classList.add('selected')
    })
  })
}


/* ============================================================
   GRADIENTS
   Called every time the brand or secondary color changes.
   ============================================================ */
import { renderGradients } from './render.js'

export function refreshGradients() {
  const brandHex = document.getElementById('brand-hex-input')?.value || '#7A48CD'
  const secHex   = document.getElementById('sec-hex-input')?.value   || '#D3507A'
  renderGradients(brandHex, secHex)
}

export function copyCSS(cssValue, name) {
  const css = `background: ${cssValue};`
  navigator.clipboard.writeText(css).catch(() => {})
  showCopyToast(`Copied: ${name}`)
}


/* ============================================================
   RESOURCES & TOOLS
   Saves to localStorage so tools persist across sessions.
   ============================================================ */

const DEFAULT_RESOURCES = [
  // Color
  { id: 1, name: 'Adobe Color Wheel',  url: 'https://color.adobe.com/create/color-wheel',        cat: 'Color',         desc: 'Find complementary, split-comp, triadic pairs from any hex' },
  { id: 2, name: 'UI Colors',          url: 'https://uicolors.app',                               cat: 'Color',         desc: 'Generate full 50–950 Tailwind scale from one hex' },
  { id: 3, name: 'Coolors',            url: 'https://coolors.co',                                 cat: 'Color',         desc: 'Lock brand color, hit spacebar — endless palette generation' },
  { id: 4, name: 'Tints.dev',          url: 'https://www.tints.dev',                              cat: 'Color',         desc: 'Multi-scale generator — paste brand + secondary together' },
  { id: 5, name: 'Huemint',            url: 'https://huemint.com',                                cat: 'Color',         desc: 'AI color schemes shown on real UI mockups' },
  { id: 6, name: 'Palettte',           url: 'https://palettte.app',                               cat: 'Color',         desc: 'Fine-tune scale curves for perceptually uniform steps' },
  // Accessibility
  { id: 7, name: 'Who Can Use',        url: 'https://www.whocanuse.com',                          cat: 'Accessibility',  desc: 'WCAG contrast against 8 vision types — makes it human' },
  { id: 8, name: 'WebAIM Contrast',    url: 'https://webaim.org/resources/contrastchecker',       cat: 'Accessibility',  desc: 'Gold standard WCAG AA/AAA checker — industry reference' },
  { id: 9, name: 'Leonardo by Adobe',  url: 'https://leonardocolor.io',                           cat: 'Accessibility',  desc: 'Generate scales with guaranteed contrast ratios baked in' },
  // Icons
  { id: 10, name: 'Heroicons',         url: 'https://heroicons.com',                              cat: 'Icons',          desc: 'Outline + solid per icon — best for business dashboards' },
  { id: 11, name: 'Lucide Icons',      url: 'https://lucide.dev',                                 cat: 'Icons',          desc: '1000+ icons, 1.5px stroke, consistent 24px grid' },
  { id: 12, name: 'Phosphor Icons',    url: 'https://phosphoricons.com',                          cat: 'Icons',          desc: '6 styles per icon including duotone — most flexible' },
  { id: 13, name: 'Tabler Icons',      url: 'https://tabler.io/icons',                            cat: 'Icons',          desc: '5000+ icons — has every niche insurance / finance icon' },
  // Illustration
  { id: 14, name: 'Undraw',            url: 'https://undraw.co/illustrations',                    cat: 'Illustration',   desc: 'Open-source SVG illustrations — set your brand color' },
  { id: 15, name: 'Storyset',          url: 'https://storyset.com',                               cat: 'Illustration',   desc: 'Animated illustrations with customizable colors' },
  { id: 16, name: 'Blush Design',      url: 'https://blush.design',                               cat: 'Illustration',   desc: 'Mix-and-match character illustrations' },
  // Tokens
  { id: 17, name: 'Tokens Studio',     url: 'https://tokens.studio',                              cat: 'Tokens',         desc: 'Import the JSON from this system directly into Figma' },
  { id: 18, name: 'Style Dictionary',  url: 'https://styledictionary.com',                        cat: 'Tokens',         desc: 'Transform tokens to CSS, iOS, Android — Amazon standard' },
  // Typography
  { id: 19, name: 'Google Fonts',      url: 'https://fonts.google.com',                           cat: 'Typography',     desc: 'Free fonts — filter by category and weight' },
  { id: 20, name: 'Font Pair',         url: 'https://www.fontpair.co',                            cat: 'Typography',     desc: 'Curated font pairings — display + body combinations' },
  // Inspiration
  { id: 21, name: 'Mobbin',            url: 'https://mobbin.com',                                 cat: 'Inspiration',    desc: 'Real app screenshots — the largest UI reference library' },
  { id: 22, name: 'Dribbble',          url: 'https://dribbble.com',                               cat: 'Inspiration',    desc: 'Design shots — good for visual direction and color' },
]

const CAT_COLORS = {
  'Color':         { bg: 'var(--color-brand-subtle)',     text: 'var(--color-brand)' },
  'Accessibility': { bg: 'var(--success-bg)',             text: 'var(--success)' },
  'Icons':         { bg: 'var(--warning-bg)',             text: 'var(--warning)' },
  'Illustration':  { bg: 'var(--color-secondary-subtle)', text: 'var(--color-secondary)' },
  'Tokens':        { bg: 'var(--info-bg)',                text: 'var(--info)' },
  'Typography':    { bg: '#F3E8FF',                       text: '#7C3AED' },
  'Inspiration':   { bg: 'var(--error-bg)',               text: 'var(--error)' },
  'Other':         { bg: 'var(--surf-sunken)',            text: 'var(--text-secondary)' },
}

function getResources() {
  try {
    const saved = localStorage.getItem('ds-resources')
    return saved ? JSON.parse(saved) : DEFAULT_RESOURCES
  } catch { return DEFAULT_RESOURCES }
}

function saveResources(list) {
  try { localStorage.setItem('ds-resources', JSON.stringify(list)) } catch {}
}

let activeFilter = 'All'

export function renderResources(filter = activeFilter) {
  activeFilter = filter
  const all = getResources()
  const filtered = filter === 'All' ? all : all.filter(r => r.cat === filter)

  // Filter pills
  const cats = ['All', ...new Set(all.map(r => r.cat))]
  const filterRow = document.getElementById('res-filter-row')
  if (filterRow) {
    filterRow.innerHTML = cats.map(c => {
      const col = CAT_COLORS[c] || CAT_COLORS['Other']
      const isActive = c === filter
      return `<button onclick="filterResources('${c}')"
        style="padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:500;cursor:pointer;border:1.5px solid ${isActive ? 'var(--color-brand)' : 'var(--border-default)'};background:${isActive ? 'var(--color-brand)' : 'var(--surf-card)'};color:${isActive ? '#fff' : 'var(--text-secondary)'};transition:all .15s;font-family:var(--font-sans)">
        ${c} <span style="opacity:.6;font-size:10px">${c === 'All' ? all.length : all.filter(r => r.cat === c).length}</span>
      </button>`
    }).join('')
  }

  // Resource cards
  const grid = document.getElementById('resources-grid')
  if (!grid) return
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:var(--sp-8);color:var(--text-secondary);font-size:14px">No tools in this category yet. Add one above.</div>`
    return
  }

  grid.innerHTML = filtered.map(r => {
    const col = CAT_COLORS[r.cat] || CAT_COLORS['Other']
    return `
    <div style="background:var(--surf-card);border:1px solid var(--border-default);border-radius:var(--r-xl);padding:var(--sp-4) var(--sp-4) var(--sp-3);box-shadow:var(--shadow-sm);display:flex;flex-direction:column;gap:8px;transition:box-shadow .15s;position:relative"
         onmouseenter="this.style.boxShadow='var(--shadow-md)'" onmouseleave="this.style.boxShadow='var(--shadow-sm)'">
      <!-- Category badge + delete -->
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;background:${col.bg};color:${col.text}">${r.cat}</span>
        <button onclick="deleteResource(${r.id})" title="Remove"
          style="width:22px;height:22px;border-radius:50%;border:none;background:transparent;color:var(--text-disabled);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .15s;font-family:var(--font-sans)"
          onmouseenter="this.style.background='var(--error-bg)';this.style.color='var(--error)'"
          onmouseleave="this.style.background='transparent';this.style.color='var(--text-disabled)'">×</button>
      </div>
      <!-- Name -->
      <div style="font-size:14px;font-weight:600;color:var(--text-primary)">${r.name}</div>
      <!-- Description -->
      <div style="font-size:12px;color:var(--text-secondary);line-height:1.55;flex:1">${r.desc}</div>
      <!-- URL + open -->
      <a href="${r.url}" target="_blank" rel="noopener"
         style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-brand);font-weight:500;text-decoration:none;padding:7px 12px;border-radius:var(--r-md);border:1.5px solid var(--color-brand);background:transparent;justify-content:center;transition:all .15s"
         onmouseenter="this.style.background='var(--color-brand-subtle)'"
         onmouseleave="this.style.background='transparent'">
        Open tool ↗
      </a>
    </div>`
  }).join('')
}

export function addResource() {
  const name  = document.getElementById('res-name')?.value?.trim()
  const url   = document.getElementById('res-url')?.value?.trim()
  const cat   = document.getElementById('res-cat')?.value
  const error = document.getElementById('res-error')

  if (!name || !url) {
    if (error) error.style.display = 'block'
    return
  }
  if (error) error.style.display = 'none'

  const list = getResources()
  const newId = Math.max(...list.map(r => r.id), 0) + 1
  const cleanUrl = url.startsWith('http') ? url : 'https://' + url

  list.push({ id: newId, name, url: cleanUrl, cat, desc: cleanUrl.replace('https://', '') })
  saveResources(list)

  // Clear inputs
  ;['res-name', 'res-url'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })

  renderResources(cat) // jump to the new category
  showCopyToast(`${name} added!`)
}

export function deleteResource(id) {
  const list = getResources().filter(r => r.id !== id)
  saveResources(list)
  renderResources()
}

export function filterResources(cat) {
  renderResources(cat)
}

export function resetResources() {
  localStorage.removeItem('ds-resources')
  renderResources('All')
  showCopyToast('Resources reset to defaults')
}