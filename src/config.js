// ─────────────────────────────────────────────────────────────────────────────
// PRICING
// All rates and multipliers live here — edit freely
// ─────────────────────────────────────────────────────────────────────────────

export const MATERIAL_RATES = {
  PLA: 0.28, PETG: 0.34, ABS: 0.38, ASA: 0.42, TPU: 0.52,
}

// Machine time multiplier per layer height
// Finer layers = exponentially more time
export const LAYER_MULT = {
  "0.08": 2.6, "0.10": 2.0, "0.12": 1.6,
  "0.16": 1.2, "0.20": 1.0, "0.24": 0.88, "0.28": 0.78,
}

// Infill multiplier — material used + print time combined
export const INFILL_MULT = {
  light: 0.60, standard: 1.0, strong: 1.65, solid: 2.4, engineering: 3.6,
}

// Flat post-processing fee per piece
export const POST_ADD = { none: 0, vapor: 14, sand: 20, paint: 45 }

export const MIN_ORDER = 4  // €4 minimum per line item

// Volume discount curve — large parts get a rate reduction
// because setup cost is the same regardless of size
export function volumeDiscount(volCm3) {
  if (volCm3 < 5)   return 1.00
  if (volCm3 < 20)  return 0.95
  if (volCm3 < 60)  return 0.88
  if (volCm3 < 150) return 0.80
  return 0.72
}

// Calculate unit price for one line item
// volMm3: volume in mm³ from STL parser
export function calcUnitPrice(volMm3, material, layer, infill, post) {
  const volCm3 = volMm3 / 1000
  const base = volCm3
    * (MATERIAL_RATES[material] ?? MATERIAL_RATES.PLA)
    * (LAYER_MULT[layer]        ?? 1.0)
    * (INFILL_MULT[infill]      ?? 1.0)
    * volumeDiscount(volCm3)
    + (POST_ADD[post]           ?? 0)
  return Math.max(MIN_ORDER, base)
}

// Apply a validated discount to a subtotal
export function applyDiscount(subtotal, discount) {
  if (!discount) return subtotal
  if (discount.type === 'percent') return subtotal * (1 - discount.value / 100)
  if (discount.type === 'fixed')   return Math.max(0, subtotal - discount.value)
  return subtotal
}

// ─────────────────────────────────────────────────────────────────────────────
// DISCOUNT CODES
// In production these come from Supabase (discount_codes table).
// This local copy is the fallback / dev version.
//
// condition types:
//   { type: 'none' }                    — always valid
//   { type: 'min_qty', value: N }       — cart must have N+ total items
//   { type: 'min_value', value: N }     — cart subtotal must be €N+
//   { type: 'first_order' }             — user has no previous orders
//   { type: 'material', value: 'ABS' }  — cart must contain that material
// ─────────────────────────────────────────────────────────────────────────────
export const DISCOUNT_CODES = {
  FIRST10:  { type: 'percent', value: 10, label: '10% off your first order',  condition: { type: 'first_order' } },
  WELCOME5: { type: 'fixed',   value: 5,  label: '€5 off',                   condition: { type: 'none' } },
  MAKER15:  { type: 'percent', value: 15, label: '15% maker discount',        condition: { type: 'none' } },
  BULK20:   { type: 'percent', value: 20, label: '20% bulk discount',         condition: { type: 'min_qty', value: 5 } },
  ABS10:    { type: 'percent', value: 10, label: '10% off ABS orders',        condition: { type: 'material', value: 'ABS' } },
}

// Validate a code against current cart state and user history
// Returns { valid: bool, reason?: string, discount?: object }
export function validateCode(rawCode, cartItems, userOrderCount = 0) {
  const code = rawCode.trim().toUpperCase()
  const entry = DISCOUNT_CODES[code]
  if (!entry) return { valid: false, reason: 'Code not recognised.' }

  const c = entry.condition
  if (c.type === 'min_qty') {
    const total = cartItems.reduce((s, i) => s + i.qty, 0)
    if (total < c.value) return { valid: false, reason: `Requires ${c.value}+ items in cart (you have ${total}).` }
  }
  if (c.type === 'min_value') {
    const subtotal = cartItems.reduce((s, i) => s + i.unitPrice * i.qty, 0)
    if (subtotal < c.value) return { valid: false, reason: `Requires €${c.value}+ subtotal.` }
  }
  if (c.type === 'first_order') {
    if (userOrderCount > 0) return { valid: false, reason: 'This code is for first orders only.' }
  }
  if (c.type === 'material') {
    const hasMat = cartItems.some(i => i.material === c.value)
    if (!hasMat) return { valid: false, reason: `Requires at least one ${c.value} item in cart.` }
  }

  return { valid: true, discount: { ...entry, code } }
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKETPLACE ITEMS
// stlUrl: path relative to site root — put files in /public/assets/STLs/
// previewImg: optional override — put PNGs in /public/assets/previews/
//   e.g. previewImg: '/assets/previews/flexicat.png'
//   If null, the app auto-generates a thumbnail from the STL.
// ─────────────────────────────────────────────────────────────────────────────
export const MARKETPLACE_ITEMS = [
  { id: 'mk1', name: 'Flexicat',            category: 'Art',         description: 'Articulated flexible cat. Prints in place, no supports.',          stlUrl: '/assets/STLs/flexicat.stl',              previewImg: null },
  { id: 'mk2', name: 'Cable Clip XL',       category: 'Utility',     description: 'Heavy-duty cable management clip. Fits up to 8mm bundles.',        stlUrl: '/assets/STLs/cable-clip-xl.stl',          previewImg: null },
  { id: 'mk3', name: 'Parametric Enclosure',category: 'Electronics', description: 'Snap-fit electronics enclosure with M3 standoffs.',                stlUrl: '/assets/STLs/parametric-enclosure.stl',   previewImg: null },
  { id: 'mk4', name: 'Wall Hook',           category: 'Utility',     description: 'Low-profile load-bearing hook. 3 mounting variants.',              stlUrl: '/assets/STLs/wall-hook.stl',              previewImg: null },
  { id: 'mk5', name: 'Miniature Vase',      category: 'Art',         description: 'Gyroid-infill decorative vase.',                                   stlUrl: '/assets/STLs/miniature-vase.stl',         previewImg: null },
  { id: 'mk6', name: 'Lens Cap Holder',     category: 'Photography', description: 'Mounts to camera strap. Never lose a lens cap again.',             stlUrl: '/assets/STLs/lens-cap-holder.stl',        previewImg: null },
]

export const CATEGORIES = ['All', 'Art', 'Utility', 'Electronics', 'Photography']

// ─────────────────────────────────────────────────────────────────────────────
// COLOURS — quick swatch palette
// ─────────────────────────────────────────────────────────────────────────────
export const QUICK_SWATCHES = [
  { hex: '#1a1a1a', name: 'Black' },
  { hex: '#f0ede8', name: 'White' },
  { hex: '#8b1a1a', name: 'Dark Red' },
  { hex: '#a8a8a8', name: 'Silver' },
  { hex: '#444444', name: 'Dark Grey' },
  { hex: '#e8dbb0', name: 'Natural' },
  { hex: '#1a2a4a', name: 'Navy' },
  { hex: '#2a4a2a', name: 'Forest Green' },
  { hex: '#c85a18', name: 'Orange' },
  { hex: '#d4aa20', name: 'Yellow' },
  { hex: '#1a3a7a', name: 'Blue' },
  { hex: '#4a1a6a', name: 'Purple' },
  { hex: '#c0272d', name: 'Red' },
  { hex: '#8b4513', name: 'Brown' },
  { hex: '#4a90d9', name: 'Sky Blue' },
  { hex: '#7cba6a', name: 'Green' },
  { hex: '#e8c84a', name: 'Gold' },
  { hex: '#c87890', name: 'Pink' },
]
