import { useState, useEffect, useRef } from 'react'
import { MARKETPLACE_ITEMS, CATEGORIES } from '../config'
import { parseSTL, buildGeometry, autoOrient } from '../stlUtils'

const GL = '1px solid rgba(197,160,80,0.28)'

// ─────────────────────────────────────────────────────────────────────────────
// Generate a thumbnail from an STL URL using an offscreen Three.js renderer
// Returns a base64 PNG data URL, or null on failure
// ─────────────────────────────────────────────────────────────────────────────
async function generateThumbnail(stlUrl, THREE) {
  try {
    const response = await fetch(stlUrl)
    const buffer   = await response.arrayBuffer()
    const info     = parseSTL(buffer)
    const geom     = buildGeometry(buffer, THREE)

    const W = 240, H = 180
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setSize(W, H)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100000)

    const mat  = new THREE.MeshStandardMaterial({ color: 0x8b1a1a, roughness: 0.52, metalness: 0.38 })
    const mesh = new THREE.Mesh(geom, mat)
    if (info.boundingBox) autoOrient(mesh, info.boundingBox)
    scene.add(mesh)

    const box    = new THREE.Box3().setFromObject(mesh)
    const size   = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const dist   = (maxDim / 2) / Math.tan(22.5 * Math.PI / 180) * 1.5

    camera.position.set(dist * 0.6, dist * 0.5, dist)
    camera.lookAt(0, 0, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const d1 = new THREE.DirectionalLight(0xffc880, 1.2); d1.position.set(1, 2, 1); scene.add(d1)

    renderer.render(scene, camera)
    const dataUrl = renderer.domElement.toDataURL('image/png')
    renderer.dispose()
    return dataUrl
  } catch { return null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Single model card
// ─────────────────────────────────────────────────────────────────────────────
function ModelCard({ item, onOrder, t, threeLoaded, isUserModel, onDelete }) {
  const [thumb, setThumb] = useState(item.previewImg || item.thumbnail_url || null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (thumb || !item.stlUrl || !threeLoaded || !window.THREE) return
    setLoading(true)
    // Check for manual override first: /assets/previews/<id>.png
    const overridePath = `/assets/previews/${item.id}.png`
    fetch(overridePath, { method: 'HEAD' })
      .then(r => {
        if (r.ok) { setThumb(overridePath); setLoading(false) }
        else return generateThumbnail(item.stlUrl, window.THREE).then(t => { setThumb(t); setLoading(false) })
      })
      .catch(() => generateThumbnail(item.stlUrl, window.THREE).then(t => { setThumb(t); setLoading(false) }))
  }, [item.stlUrl, threeLoaded, thumb])

  return (
    <div style={{ background: 'var(--bg2)', border: GL, display: 'flex', flexDirection: 'column', transition: 'background .22s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,26,26,0.1)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}>

      {/* Preview image */}
      <div style={{ aspectRatio: '4/3', background: 'rgba(12,4,4,.65)', borderBottom: GL, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {thumb ? (
          <img src={thumb} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : loading ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.58rem', color: 'rgba(237,228,223,.25)', letterSpacing: '.1em', textTransform: 'uppercase', animation: 'pulse 1.5s ease-in-out infinite' }}>
            Rendering…
          </div>
        ) : (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity=".1"><rect x="2" y="6" width="28" height="22" rx="2" stroke="var(--text)" strokeWidth="1.2"/><circle cx="10" cy="15" r="3" stroke="var(--text)" strokeWidth="1.1"/><path d="M2 24l7-6 6 6 5-4 10 7" stroke="var(--text)" strokeWidth="1.1" strokeLinejoin="round"/></svg>
        )}
        {item.category && (
          <div style={{ position: 'absolute', top: 8, right: 8, fontFamily: 'var(--font-mono)', fontSize: '.55rem', letterSpacing: '.1em', color: 'var(--gold)', background: 'rgba(12,4,4,.78)', padding: '3px 7px', border: GL }}>
            {item.category}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '20px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ fontFamily: 'var(--font-cond)', fontSize: '1.02rem', letterSpacing: '.07em', color: 'var(--text)', textTransform: 'uppercase' }}>{item.name}</div>
        <div style={{ fontSize: '.82rem', lineHeight: 1.7, color: 'var(--text-dim)', fontWeight: 300, flex: 1 }}>{item.description}</div>
        {item.created_at && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.58rem', color: 'var(--text-dimmer)', letterSpacing: '.07em' }}>
            {new Date(item.created_at).toLocaleDateString()}
            {item.volume_mm3 && ` · ${(item.volume_mm3 / 1000).toFixed(1)} cm³`}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button className="btn-p" style={{ flex: 1, padding: '9px 14px', fontSize: '.78rem', justifyContent: 'center' }} onClick={() => onOrder(item)}>
            {t.market_order}
          </button>
          {isUserModel && onDelete && (
            <button onClick={() => onDelete(item)} style={{ background: 'none', border: '1px solid rgba(139,26,26,.35)', color: 'rgba(192,39,45,.65)', fontFamily: 'var(--font-cond)', fontSize: '.72rem', letterSpacing: '.1em', padding: '9px 12px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all .18s' }}
              onMouseEnter={e => { e.target.style.background = 'rgba(139,26,26,.15)'; e.target.style.color = 'var(--red-bright)' }}
              onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = 'rgba(192,39,45,.65)' }}>
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKETPLACE PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function MarketplacePage({ t, lang, user, onOrderItem, threeLoaded, onSignIn }) {
  const [tab,       setTab]       = useState('public')  // 'public' | 'user'
  const [cat,       setCat]       = useState('All')
  const [userFiles, setUserFiles] = useState([])

  // SUPABASE: load user's uploaded files
  useEffect(() => {
    if (!user) return
    // const { data } = await supabase.from('user_files').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    // setUserFiles(data ?? [])

    // Demo data — remove when Supabase is connected:
    setUserFiles([
      { id: 'uf1', name: 'bracket_v3.stl', stlUrl: null, thumbnail_url: null, volume_mm3: 18400, created_at: '2025-05-14T10:22:00Z', category: 'Custom' },
      { id: 'uf2', name: 'custom_knob.stl', stlUrl: null, thumbnail_url: null, volume_mm3: 6200,  created_at: '2025-04-28T16:05:00Z', category: 'Custom' },
    ])
  }, [user])

  async function deleteUserFile(item) {
    if (!window.confirm(`Delete ${item.name} from your models?`)) return
    setUserFiles(f => f.filter(x => x.id !== item.id))
    // SUPABASE:
    // await supabase.from('user_files').delete().eq('id', item.id)
    // await supabase.storage.from('user-stls').remove([`${user.id}/${item.id}.stl`])
  }

  const filtered = cat === 'All' ? MARKETPLACE_ITEMS : MARKETPLACE_ITEMS.filter(i => i.category === cat)

  return (
    <div style={{ paddingTop: 58, minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '48px clamp(20px,5vw,72px)' }}>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.67rem', letterSpacing: '.18em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          Models <span style={{ width: 34, height: 1, background: 'rgba(197,160,80,.3)', display: 'inline-block' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem,3.8vw,3rem)', letterSpacing: '.04em', color: 'var(--text)', marginBottom: 10 }}>{t.market_title}</h1>
        <p style={{ fontSize: '.88rem', lineHeight: 1.78, color: 'var(--text-dim)', fontWeight: 300, maxWidth: 540, marginBottom: 32 }}>{t.market_sub}</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, border: GL, width: 'fit-content', marginBottom: 28 }}>
          {['public', 'user'].map(tb => (
            <button key={tb} onClick={() => setTab(tb)} style={{ fontFamily: 'var(--font-cond)', fontSize: '.82rem', letterSpacing: '.1em', textTransform: 'uppercase', padding: '9px 20px', background: tab === tb ? 'rgba(197,160,80,.1)' : 'none', color: tab === tb ? 'var(--gold)' : 'var(--text-dim)', border: 'none', borderRight: tb === 'public' ? GL : 'none', cursor: 'pointer', transition: 'all .18s' }}>
              {tb === 'public' ? t.market_tab_public : t.market_tab_user}
            </button>
          ))}
        </div>

        {tab === 'public' && (
          <>
            {/* Category filter */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCat(c)} style={{ fontFamily: 'var(--font-cond)', fontSize: '.78rem', letterSpacing: '.1em', textTransform: 'uppercase', padding: '6px 14px', background: cat === c ? 'var(--red)' : 'none', color: cat === c ? 'var(--text)' : 'var(--text-dim)', border: cat === c ? '1px solid var(--red)' : GL, cursor: 'pointer', transition: 'all .2s' }}>
                  {c}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 1, border: GL }}>
              {filtered.map(item => (
                <ModelCard key={item.id} item={item} onOrder={onOrderItem} t={t} threeLoaded={threeLoaded} isUserModel={false} />
              ))}
            </div>
          </>
        )}

        {tab === 'user' && (
          <>
            {!user ? (
              <div style={{ border: GL, padding: '40px 28px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: 'var(--text-dimmer)', letterSpacing: '.08em', marginBottom: 20 }}>{t.market_user_login}</p>
                <button className="btn-p" onClick={onSignIn}>{t.nav_signin}</button>
              </div>
            ) : userFiles.length === 0 ? (
              <div style={{ border: GL, padding: '40px 28px', fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: 'var(--text-dimmer)', letterSpacing: '.08em' }}>
                {t.market_user_empty}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 1, border: GL }}>
                {userFiles.map(item => (
                  <ModelCard key={item.id} item={item} onOrder={onOrderItem} t={t} threeLoaded={threeLoaded} isUserModel={true} onDelete={deleteUserFile} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
