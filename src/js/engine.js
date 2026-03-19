/* ============================================================
   ENGINE.JS — Color Engine, Scale Generator, WCAG Tester
   ============================================================
   HOW TO EDIT:
   - generateScale() controls how shades 50–950 are derived
     from the brand hue. Edit the 'stops' array to adjust how
     light/dark each shade is.
   - getContrast() calculates WCAG contrast ratio
   - pairingLabel() controls the pairing strategy descriptions
   ============================================================ */

// ── HEX ↔ HSL CONVERSION ──────────────────────────────────────
export function hexToRgb(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s
  const l = (max + min) / 2
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

export function hslToHex(h, s, l) {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return '#' + f(0) + f(8) + f(4)
}

// ── WCAG CONTRAST ─────────────────────────────────────────────
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function getContrast(hex1, hex2 = '#ffffff') {
  const c1 = hexToRgb(hex1), c2 = hexToRgb(hex2)
  const l1 = getLuminance(c1.r, c1.g, c1.b)
  const l2 = getLuminance(c2.r, c2.g, c2.b)
  return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2)
}

export function wcagLevel(ratio) {
  if (ratio >= 7)   return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3)   return 'Large/UI'
  return 'Fail'
}

// ── SCALE GENERATOR ───────────────────────────────────────────
// Edit the 'stops' array to adjust the lightness of each shade.
// Each stop: { shade, hs (saturation adjustment), ls (lightness) }
export function generateScale(h, s, l) {
  const stops = [
    { sh: '50',  hs: Math.min(s + 20, 95), ls: Math.min(l + 40, 97) },
    { sh: '100', hs: Math.min(s + 16, 90), ls: Math.min(l + 34, 94) },
    { sh: '200', hs: Math.min(s + 10, 85), ls: Math.min(l + 24, 88) },
    { sh: '300', hs: Math.min(s + 5,  80), ls: Math.min(l + 14, 80) },
    { sh: '400', hs: Math.min(s + 2,  75), ls: Math.min(l + 6,  70) },
    { sh: '500', hs: s,                    ls: Math.min(l + 3,  62) },
    { sh: '600', hs: s,                    ls: l },                    // ← Brand base
    { sh: '700', hs: Math.min(s + 2, 75),  ls: Math.max(l - 10, 38) },
    { sh: '800', hs: Math.min(s + 4, 75),  ls: Math.max(l - 20, 28) },
    { sh: '900', hs: Math.min(s + 6, 75),  ls: Math.max(l - 30, 18) },
    { sh: '950', hs: Math.min(s + 8, 75),  ls: Math.max(l - 38, 12) },
  ]
  return stops.map(st => ({ shade: st.sh, hex: hslToHex(h, st.hs, st.ls) }))
}

// ── COLOR PAIRING ANALYSIS ────────────────────────────────────
export function hueDist(a, b) {
  const d = Math.abs(a - b)
  return Math.min(d, 360 - d)
}

export function pairingLabel(dist) {
  if (dist <= 30)  return { label: 'Same family', severity: 'error', tip: 'Too close — looks like a mistake. Choose 30°+ apart.' }
  if (dist <= 90)  return { label: 'Harmonious — Analogous / Split-comp', severity: 'success', tip: 'Sweet spot. Distinct but share an undertone.' }
  if (dist <= 150) return { label: 'Distinct — Triadic', severity: 'warning', tip: 'Strong contrast. Check cultural meaning first.' }
  return               { label: 'Complementary — 180°', severity: 'info', tip: 'Maximum tension. Use secondary at max 10% of UI.' }
}

// ── WCAG BADGE HTML ───────────────────────────────────────────
export function wcagBadge(ratio) {
  if (ratio >= 7)   return `<span class="wcag-badge wcag-pass-aaa">AAA ${ratio}:1</span>`
  if (ratio >= 4.5) return `<span class="wcag-badge wcag-pass-aa">AA ${ratio}:1</span>`
  if (ratio >= 3)   return `<span class="wcag-badge wcag-pass-lg">Large ${ratio}:1</span>`
  return                   `<span class="wcag-badge wcag-fail">Fail ${ratio}:1</span>`
}

export function wcagBadgeSmall(ratio) {
  if (ratio >= 7)   return `<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:#ECFDF5;color:#065F46;font-weight:600">AAA</span>`
  if (ratio >= 4.5) return `<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:#EFF6FF;color:#1D4ED8;font-weight:600">AA</span>`
  if (ratio >= 3)   return `<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:#FFFBEB;color:#B45309;font-weight:600">LG</span>`
  return                   `<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:#f5f5f5;color:#888;font-weight:600">✕</span>`
}
