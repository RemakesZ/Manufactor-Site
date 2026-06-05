import { useState, useRef, useCallback, useEffect } from 'react'
import STLViewer from './STLViewer'
import { parseSTL } from '../stlUtils'
import { calcUnitPrice, MATERIAL_RATES, LAYER_MULT, INFILL_MULT, POST_ADD, volumeDiscount, QUICK_SWATCHES } from '../config'

const GL = '1px solid rgba(197,160,80,0.28)'

// ─────────────────────────────────────────────────────────────────────────────
// COLOUR PICKER — color wheel + hex input + quick swatches
// ─────────────────────────────────────────────────────────────────────────────
function ColourPicker({ value, onChange, label, disclaimer }) {
  const [hexInput, setHexInput] = useState(value?.hex || '#8b1a1a')

  useEffect(() => { setHexInput(value?.hex || '#8b1a1a') }, [value?.hex])

  function commitHex(raw) {
    let h = raw.trim()
    if (!h.startsWith('#')) h = '#' + h
    if (/^#[0-9a-fA-F]{3}$/.test(h)) h = '#' + h[1]+h[1]+h[2]+h[2]+h[3]+h[3]
    if (/^#[0-9a-fA-F]{6}$/.test(h)) {
      setHexInput(h.toLowerCase())
      const match = QUICK_SWATCHES.find(s => s.hex === h.toLowerCase())
      onChange({ hex: h.toLowerCase(), name: match?.name || h.toUpperCase() })
    }
  }

  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, background: value?.hex || '#8b1a1a', border: GL }} />
          <input type="color" value={value?.hex || '#8b1a1a'}
            onChange={e => { setHexInput(e.target.value); const match = QUICK_SWATCHES.find(s => s.hex === e.target.value); onChange({ hex: e.target.value, name: match?.name || e.target.value.toUpperCase() }) }}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
        </div>
        <input className="fi" value={hexInput}
          onChange={e => setHexInput(e.target.value)}
          onBlur={e => commitHex(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commitHex(hexInput)}
          placeholder="#8b1a1a"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', letterSpacing: '.08em', flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
          {value?.name || ''}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9,1fr)', gap: 5, marginBottom: 9 }}>
        {QUICK_SWATCHES.map(s => (
          <button key={s.hex} title={s.name} onClick={() => { setHexInput(s.hex); onChange(s) }}
            style={{ width: '100%', aspectRatio: '1', border: value?.hex === s.hex ? '2px solid var(--gold)' : GL, background: s.hex, cursor: 'pointer', borderRadius: 1, transition: 'border-color .15s' }} />
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--text-dimmer)', lineHeight: 1.65, fontStyle: 'italic' }}>{disclaimer}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURE PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ConfigurePage({ t, threeLoaded, onAddToCart, prefillItem }) {
  const [stlBuffer,  setStlBuffer]  = useState(prefillItem?.stlBuffer || null)
  const [stlName,    setStlName]    = useState(prefillItem?.stlName   || '')
  const [stlInfo,    setStlInfo]    = useState(prefillItem?.stlInfo   || null)  // { volumeMm3, boundingBox, isShell }
  const [thumbnail,  setThumbnail]  = useState(prefillItem?.thumbnail || null)
  const [material,   setMaterial]   = useState(prefillItem?.material  || 'PLA')
  const [layer,      setLayer]      = useState(prefillItem?.layer     || '0.20')
  const [infill,     setInfill]     = useState(prefillItem?.infill    || 'standard')
  const [post,       setPost]       = useState(prefillItem?.post      || 'none')
  const [qty,        setQty]        = useState(prefillItem?.qty       || 1)
  const [color,      setColor]      = useState(prefillItem?.color     || QUICK_SWATCHES[0])
  const [notes,      setNotes]      = useState(prefillItem?.notes     || '')
  const [dragOver,   setDragOver]   = useState(false)
  const [added,      setAdded]      = useState(false)
  const fileRef = useRef(null)

  // Load prefill STL from URL (marketplace item)
  useEffect(() => {
    if (prefillItem?.stlUrl && !prefillItem.stlBuffer) {
      fetch(prefillItem.stlUrl)
        .then(r => r.arrayBuffer())
        .then(buf => {
          setStlBuffer(buf)
          const info = parseSTL(buf)
          setStlInfo(info)
          setStlName(prefillItem.stlName)
        })
        .catch(() => {})
    }
  }, [prefillItem?.stlUrl])

  function handleFile(file) {
    if (!file) return
    setStlName(file.name)
    setAdded(false)
    const reader = new FileReader()
    reader.onload = e => {
      const buf = e.target.result
      setStlBuffer(buf)
      setStlInfo(parseSTL(buf))
      setThumbnail(null)
    }
    reader.readAsArrayBuffer(file)
  }

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const volMm3    = stlInfo?.volumeMm3 || 0
  const volCm3    = volMm3 / 1000
  const unitPrice = volMm3 > 0 ? calcUnitPrice(volMm3, material, layer, infill, post) : null
  const totalLine = unitPrice !== null ? unitPrice * qty : null

  function handleAddToCart() {
    if (!stlBuffer || unitPrice === null) return
    onAddToCart({
      stlName, stlBuffer, volumeMm3: volMm3, thumbnail,
      material, layer, infill, post, color, qty, unitPrice, notes,
      stlInfo,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  const layerLabels = {
    '0.08': 'Ultrafine', '0.10': 'Superfine', '0.12': 'Fine',
    '0.16': 'Optimal',   '0.20': 'Standard',  '0.24': 'Draft', '0.28': 'Superdraft',
  }

  return (
    <div style={{ paddingTop: 58, minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="two-col" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 320px', position: 'relative', zIndex: 1 }}>

        {/* FORM COLUMN */}
        <div style={{ padding: '44px clamp(20px,5vw,56px)', borderRight: GL }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.67rem', letterSpacing: '.18em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            Configure <span style={{ width: 32, height: 1, background: 'rgba(197,160,80,.3)', display: 'inline-block' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', letterSpacing: '.04em', color: 'var(--text)', marginBottom: 8 }}>{t.configure_title}</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '.85rem', maxWidth: 500, lineHeight: 1.78, fontWeight: 300, marginBottom: 32 }}>{t.configure_sub}</p>

          {/* Upload zone */}
          <div className="form-group">
            <label>{t.upload_label}</label>
            <div className={`uz${dragOver ? ' dg' : ''}${stlBuffer ? ' ld' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}>
              {stlBuffer ? (
                <>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2v9M8 8l3 3 3-3" stroke="var(--red-bright)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 16v1.5A1.5 1.5 0 003.5 19h15a1.5 1.5 0 001.5-1.5V16" stroke="var(--gold)" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  <div className="upn">{stlName}</div>
                  <div className="uph">{t.upload_loaded} · {(stlBuffer.byteLength / 1024).toFixed(0)} KB {stlInfo?.isShell ? '· shell mesh detected' : ''}</div>
                </>
              ) : (
                <>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="2" y="6" width="22" height="16" rx="2" stroke="rgba(197,160,80,0.45)" strokeWidth="1.2"/><path d="M13 18V10M9 14l4-4 4 4" stroke="rgba(197,160,80,0.65)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div className="upn" style={{ color: 'var(--text-dim)' }}>STL</div>
                  <div className="uph">{t.upload_hint}</div>
                </>
              )}
              <input ref={fileRef} type="file" accept=".stl" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>
          </div>

          {/* 3D viewer */}
          {threeLoaded && (
            <div className="form-group">
              <label>3D Preview {stlBuffer && <span style={{ color: 'var(--text-dimmer)', fontSize: '.58rem' }}>— drag to rotate</span>}</label>
              <STLViewer
                buffer={stlBuffer}
                colorHex={color?.hex}
                boundingBox={stlInfo?.boundingBox}
                onThumbnail={setThumbnail}
              />
            </div>
          )}

          {/* Material */}
          <div className="form-group">
            <label>{t.mat_label}</label>
            <select className="fs" value={material} onChange={e => setMaterial(e.target.value)}>
              {Object.keys(MATERIAL_RATES).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <ColourPicker value={color} onChange={setColor} label={t.color_label} disclaimer={t.color_disclaimer} />

          {/* Layer */}
          <div className="form-group">
            <label>{t.layer_label}</label>
            <select className="fs" value={layer} onChange={e => setLayer(e.target.value)}>
              {Object.keys(layerLabels).map(v => (
                <option key={v} value={v}>{v} mm — {layerLabels[v]}</option>
              ))}
            </select>
          </div>

          {/* Infill */}
          <div className="form-group">
            <label>{t.infill_label}</label>
            <select className="fs" value={infill} onChange={e => setInfill(e.target.value)}>
              <option value="light">Minimal (10%)</option>
              <option value="standard">Standard (15%)</option>
              <option value="strong">Strong (30%)</option>
              <option value="solid">Solid (50%)</option>
              <option value="engineering">Engineering (80%)</option>
            </select>
          </div>

          {/* Post */}
          <div className="form-group">
            <label>{t.post_label}</label>
            <select className="fs" value={post} onChange={e => setPost(e.target.value)}>
              <option value="none">{t.post_none}</option>
              <option value="vapor">{t.post_vapor}</option>
              <option value="sand">{t.post_sand}</option>
              <option value="paint">{t.post_paint}</option>
            </select>
          </div>

          {/* Quantity */}
          <div className="form-group">
            <label>{t.qty_label}</label>
            <div className="qr">
              <button className="qb" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <div className="qv">{qty}</div>
              <button className="qb" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>{t.notes_label}</label>
            <textarea className="fta" value={notes} onChange={e => setNotes(e.target.value)} placeholder={t.notes_placeholder} />
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="configure-sidebar" style={{ padding: '44px 28px', position: 'sticky', top: 58, height: 'fit-content' }}>
          <div style={{ border: GL, padding: '24px', background: 'rgba(139,26,26,.06)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.64rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>
              Line Estimate
            </div>
            {totalLine !== null ? (
              <>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.6rem', letterSpacing: '.04em', color: 'var(--text)', lineHeight: 1 }}>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginRight: 2 }}>€</span>{totalLine.toFixed(2)}
                </div>
                {qty > 1 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--text-dimmer)', marginTop: 4 }}>€{unitPrice.toFixed(2)} × {qty}</div>}
                <div style={{ marginTop: 14, borderTop: GL, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    ['Volume', `${volCm3.toFixed(2)} cm³`],
                    ['Material', `${material} ×${MATERIAL_RATES[material]}/cm³`],
                    ['Layer', `${layer} mm ×${LAYER_MULT[layer]}`],
                    ['Infill', `${infill} ×${INFILL_MULT[infill]}`],
                    volCm3 > 5 && ['Vol. discount', `×${volumeDiscount(volCm3).toFixed(2)}`],
                    POST_ADD[post] > 0 && ['Post-process', `+€${POST_ADD[post]}`],
                    stlInfo?.isShell && ['⚠ Shell mesh', 'area-based estimate'],
                  ].filter(Boolean).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--text-dim)' }}>
                      <span>{k}</span><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'var(--text-dimmer)', letterSpacing: '.08em', padding: '16px 0' }}>
                Upload an STL to see estimate
              </div>
            )}
          </div>

          {/* Add to cart */}
          <button
            className="btn-p"
            style={{ width: '100%', justifyContent: 'center', marginTop: 14, opacity: (!stlBuffer || unitPrice === null) ? 0.45 : 1, background: added ? '#2a5c2a' : undefined }}
            onClick={handleAddToCart}
            disabled={!stlBuffer || unitPrice === null}
          >
            {added ? '✓ Added to Cart' : t.btn_add_cart}
            {!added && (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', color: 'var(--text-dimmer)', marginTop: 10, lineHeight: 1.6, fontStyle: 'italic' }}>
            Estimate only. Final price confirmed after manual review.
          </p>
        </div>
      </div>
    </div>
  )
}
