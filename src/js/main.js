/* ============================================================
   MAIN.JS — Entry Point
   ============================================================ */

import { renderScale, renderSemanticGrid, renderSpacing, renderRadius, GREY_SCALE } from './render.js'
import {
  updateBrand, updateSecondary,
  onBrandPick, onBrandType, onSecPick, onSecType, onNameChange,
  setTheme, setGrid,
  exportTokens, copyAllCSS,
  showDarkMode, renderGreyScaleDemo,
  initNav, initScrollSpy,
  toggleSidebar, closeSidebar,
  initComponents,
} from './ui.js'
import { copyHex } from './render.js'

// ── Expose to HTML onclick="" handlers
window.onBrandPick         = onBrandPick
window.onBrandType         = onBrandType
window.onSecPick           = onSecPick
window.onSecType           = onSecType
window.onNameChange        = onNameChange
window.setTheme            = setTheme
window.setGrid             = setGrid
window.exportTokens        = exportTokens
window.copyAllCSS          = copyAllCSS
window.showDarkMode        = showDarkMode
window.renderGreyScaleDemo = renderGreyScaleDemo
window.toggleSidebar       = toggleSidebar
window.closeSidebar        = closeSidebar
window.copyHex             = copyHex

// ── Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  updateBrand('#7A48CD')
  updateSecondary('#D3507A')
  renderScale(GREY_SCALE, 'grey-scale', '#737175')
  renderSemanticGrid()
  renderSpacing('4')
  renderRadius()
  initNav()
  initScrollSpy()
  initComponents()
})
