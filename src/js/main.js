/* ============================================================
   MAIN.JS — Entry Point
   ============================================================ */

import { renderScale, renderSemanticGrid, renderSpacing, renderRadius, GREY_SCALE, copyHex } from './render.js'
import { renderGradients } from './render.js'
import {
  updateBrand, updateSecondary,
  onBrandPick, onBrandType, onSecPick, onSecType, onNameChange,
  setTheme, setGrid,
  exportTokens, copyAllCSS,
  showDarkMode, renderGreyScaleDemo,
  refreshGradients, copyCSS,
  renderResources, addResource, deleteResource, filterResources, resetResources,
  initNav, initScrollSpy,
  toggleSidebar, closeSidebar,
  initComponents,
} from './ui.js'

// ── Expose to HTML onclick="" handlers ───────────────────────
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
window.refreshGradients    = refreshGradients
window.copyCSS             = copyCSS
window.addResource         = addResource
window.deleteResource      = deleteResource
window.filterResources     = filterResources
window.resetResources      = resetResources
window.toggleSidebar       = toggleSidebar
window.closeSidebar        = closeSidebar
window.copyHex             = copyHex

// ── Init on DOM ready ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Brand + secondary
  updateBrand('#7A48CD')
  updateSecondary('#D3507A')

  // Scales
  renderScale(GREY_SCALE, 'grey-scale', '#737175')
  renderSemanticGrid()

  // Foundation
  renderSpacing('4')
  renderRadius()

  // Gradients
  renderGradients('#7A48CD', '#D3507A')

  // Resources
  renderResources('All')

  // Nav + components
  initNav()
  initScrollSpy()
  initComponents()
})