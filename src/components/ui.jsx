import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../supabase'

const GL = '1px solid rgba(197,160,80,0.28)'
const PARTICLE_SPEED = 0.22

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE CANVAS
// ─────────────────────────────────────────────────────────────────────────────
export function ParticleCanvas({ style }) {
  const canvasRef = useRef(null)
  const stateRef  = useRef({ particles: [], mouse: { x: -9999, y: -9999 }, raf: null })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const state = stateRef.current
    let W = 0, H = 0

    function resize() {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      canvas.width  = W * window.devicePixelRatio
      canvas.height = H * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    state.particles = Array.from({ length: 75 }, () => ({
      x: Math.random() * (W || 800), y: Math.random() * (H || 600),
      bvx: (Math.random() - .5) * PARTICLE_SPEED, bvy: (Math.random() - .5) * PARTICLE_SPEED,
      vx: 0, vy: 0, r: Math.random() * 1.5 + 0.5,
      gold: Math.random() > .72,
      wanderAngle: Math.random() * Math.PI * 2,
      wanderSpeed: .004 + Math.random() * .007,
    }))

    function onMove(e) {
      const r = canvas.getBoundingClientRect()
      state.mouse.x = e.clientX - r.left
      state.mouse.y = e.clientY - r.top
    }
    window.addEventListener('mousemove', onMove)

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const ps = state.particles, mx = state.mouse.x, my = state.mouse.y
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]
        p.wanderAngle += p.wanderSpeed * (Math.random() - .485)
        p.bvx += Math.cos(p.wanderAngle) * .003
        p.bvy += Math.sin(p.wanderAngle) * .003
        const bs = Math.sqrt(p.bvx ** 2 + p.bvy ** 2)
        if (bs > PARTICLE_SPEED * 1.15) { p.bvx *= (PARTICLE_SPEED * 1.15) / bs; p.bvy *= (PARTICLE_SPEED * 1.15) / bs }
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy, R = 130
        if (d2 < R * R && d2 > .01) { const d = Math.sqrt(d2), f = Math.pow((R - d) / R, 2) * 1.1; p.vx += dx / d * f; p.vy += dy / d * f }
        p.vx = (p.vx + p.bvx) * .95; p.vy = (p.vy + p.bvy) * .95
        p.x += p.vx; p.y += p.vy
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.gold ? 'rgba(197,160,80,0.7)' : 'rgba(165,32,32,0.55)'
        ctx.fill()
        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j], ex = p.x - q.x, ey = p.y - q.y, ed2 = ex * ex + ey * ey
          if (ed2 < 120 * 120) {
            const ed = Math.sqrt(ed2), a = (1 - ed / 120) * .18
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = (p.gold || q.gold) ? `rgba(197,160,80,${a})` : `rgba(155,32,32,${a})`
            ctx.lineWidth = .5; ctx.stroke()
          }
        }
      }
      state.raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(state.raf); ro.disconnect(); window.removeEventListener('mousemove', onMove) }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }} />
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPEWRITER
// ─────────────────────────────────────────────────────────────────────────────
export function Typewriter({ slogans }) {
  const [display, setDisplay] = useState('')
  const [idx,     setIdx]     = useState(0)
  const [phase,   setPhase]   = useState('typing')

  useEffect(() => {
    const slogan = slogans[idx % slogans.length]
    let timer
    if (phase === 'typing') {
      timer = display.length < slogan.length
        ? setTimeout(() => setDisplay(slogan.slice(0, display.length + 1)), 52)
        : setTimeout(() => setPhase('pause'), 2400)
    } else if (phase === 'pause') {
      timer = setTimeout(() => setPhase('erasing'), 200)
    } else {
      timer = display.length > 0
        ? setTimeout(() => setDisplay(d => d.slice(0, -1)), 26)
        : (() => { setIdx(i => i + 1); setPhase('typing') })()
    }
    return () => clearTimeout(timer)
  }, [display, phase, idx, slogans])

  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(.78rem,1.25vw,.93rem)', letterSpacing: '.05em', color: 'var(--gold)' }}>
      {display}<span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR — desktop + hamburger mobile drawer
// ─────────────────────────────────────────────────────────────────────────────
export function NavBar({ page, setPage, lang, setLang, user, onSignIn, t, cartCount }) {
  const [open, setOpen] = useState(false)

  function go(p) { setPage(p); setOpen(false) }

  const CartBadge = cartCount > 0 ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: 'var(--red-bright)', color: '#fff', fontSize: '.55rem', fontFamily: 'var(--font-mono)', marginLeft: 4, verticalAlign: 'middle' }}>
      {cartCount}
    </span>
  ) : null

  return (
    <>
      <nav>
        <div className="n-logo" onClick={() => go('home')}>MAN<em>U</em>FACTOR</div>
        <div className="n-r">
          <button className={`nl ${page === 'home'    ? 'act' : ''}`} onClick={() => go('home')}>{t.nav_home}</button>
          <button className={`nl ${page === 'market'  ? 'act' : ''}`} onClick={() => go('market')}>{t.nav_market}</button>
          <button className={`nl ${page === 'quote'   ? 'act' : ''}`} onClick={() => go('quote')}>{t.nav_quote}</button>
          <button className={`nl ${page === 'cart'    ? 'act' : ''}`} onClick={() => go('cart')} style={{ position: 'relative' }}>
            {t.nav_cart}{CartBadge}
          </button>
          {user
            ? <button className="n-user" onClick={() => go('account')}>{user.email.split('@')[0]}</button>
            : <button className="nl" onClick={onSignIn}>{t.nav_signin}</button>}
          <div className="lt">
            <button className={`lb ${lang === 'en' ? 'act' : ''}`} onClick={() => setLang('en')}>EN</button>
            <div className="ls" style={{ alignSelf: 'stretch' }} />
            <button className={`lb ${lang === 'gr' ? 'act' : ''}`} onClick={() => setLang('gr')}>ΕΛ</button>
          </div>
          <button className={`hbg ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mob-drawer ${open ? 'open' : ''}`}>
        {[
          ['home',    t.nav_home],
          ['market',  t.nav_market],
          ['quote',   t.nav_quote],
          ['cart',    `${t.nav_cart}${cartCount > 0 ? ` (${cartCount})` : ''}`],
        ].map(([p, label]) => (
          <button key={p} className={`mob-nl ${page === p ? 'act' : ''}`} onClick={() => go(p)}>{label}</button>
        ))}
        {user
          ? <button className={`mob-nl ${page === 'account' ? 'act' : ''}`} onClick={() => go('account')}>{t.nav_account} — {user.email.split('@')[0]}</button>
          : <button className="mob-nl" onClick={() => { setOpen(false); onSignIn() }}>{t.nav_signin}</button>}
        <div className="mob-lang">
          <button className={`lb ${lang === 'en' ? 'act' : ''}`} onClick={() => setLang('en')}>EN</button>
          <div className="ls" style={{ alignSelf: 'stretch' }} />
          <button className={`lb ${lang === 'gr' ? 'act' : ''}`} onClick={() => setLang('gr')}>ΕΛ</button>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH MODAL
// ─────────────────────────────────────────────────────────────────────────────
export function AuthModal({ lang, t, onClose, onAuth }) {
  const [mode,    setMode]    = useState('signin')
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    if (mode === 'signup') {
      if (pass.length < 6)    { setError(t.auth_error_short); return }
      if (pass !== confirm)   { setError(t.auth_error_match); return }
    }
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({ email, password: pass })
        if (err) throw err
        onAuth({ email, id: data.user.id })
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password: pass })
        if (err) throw err
        onAuth({ email, id: data.user.id })
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Authentication failed.')
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 910, background: 'rgba(8,2,2,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--bg3)', border: GL, maxWidth: 420, width: '100%', padding: '34px 30px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: GL, paddingBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', letterSpacing: '.05em', color: 'var(--text)' }}>
            {mode === 'signin' ? t.signin_title : t.signup_title}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dimmer)', cursor: 'pointer', fontSize: '1.3rem' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            [t.auth_email, 'email', email, setEmail],
            [t.auth_password, 'password', pass, setPass],
            ...(mode === 'signup' ? [[t.auth_confirm, 'password', confirm, setConfirm]] : []),
          ].map(([lbl, type, val, setter]) => (
            <div key={lbl}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '.64rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 7 }}>{lbl}</label>
              <input className="fi" type={type} value={val} onChange={e => setter(e.target.value)} style={{ width: '100%' }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          ))}
          {error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', color: 'var(--red-bright)', letterSpacing: '.06em' }}>{error}</p>}
          <button className="btn-p" style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? .6 : 1 }} onClick={handleSubmit} disabled={loading}>
            {loading ? '…' : mode === 'signin' ? t.btn_signin : t.btn_signup}
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-dimmer)', fontFamily: 'var(--font-mono)', fontSize: '.64rem', letterSpacing: '.07em', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, marginTop: 2 }}
            onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError('') }}>
            {mode === 'signin' ? t.switch_to_signup : t.switch_to_signin}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COOKIE BANNER
// ─────────────────────────────────────────────────────────────────────────────
export function CookieBanner({ t }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { try { if (!localStorage.getItem('cookie_ok')) setVisible(true) } catch { setVisible(true) } }, [])
  function accept() { try { localStorage.setItem('cookie_ok', '1') } catch {}; setVisible(false) }
  if (!visible) return null
  return (
    <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 999, background: 'rgba(18,6,6,0.97)', border: GL, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 16, backdropFilter: 'blur(12px)', maxWidth: 500 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.63rem', letterSpacing: '.07em', color: 'var(--text-dim)', lineHeight: 1.6 }}>{t.cookie_msg}</span>
      <button onClick={accept} style={{ background: 'none', border: GL, color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '.63rem', letterSpacing: '.1em', padding: '5px 11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>{t.cookie_ok}</button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGAL MODAL
// ─────────────────────────────────────────────────────────────────────────────
export function LegalModal({ type, t, onClose }) {
  const title = type === 'privacy' ? t.privacy_title : t.terms_title
  const items = type === 'privacy' ? t.privacy_items : t.terms_items
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(8,2,2,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--bg3)', border: GL, maxWidth: 620, width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: '34px 30px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, borderBottom: GL, paddingBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', letterSpacing: '.05em', color: 'var(--text)' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dimmer)', cursor: 'pointer', fontSize: '1.3rem' }}>×</button>
        </div>
        <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 14, fontSize: '.85rem', lineHeight: 1.78, color: 'var(--text-dim)', fontWeight: 300 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--gold)', minWidth: 20, paddingTop: 3 }}>{String(i + 1).padStart(2, '0')}</span>
              {item}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO CAROUSEL — swipeable on mobile, thumbnail list on desktop
// Replace PHOTOS src: null with your actual image paths
// ─────────────────────────────────────────────────────────────────────────────
const PHOTOS = [
  { src: null, label: 'Flexicat · PLA · Vapor Smoothed' },
  { src: null, label: 'Enclosure Panel · PETG · Standard' },
  { src: null, label: 'Mechanical Bracket · ABS · Painted' },
  { src: null, label: 'Display Model · PLA · Primed' },
  { src: null, label: 'Custom Housing · ASA · Raw' },
]

export function Carousel({ t }) {
  const [active,    setActive]    = useState(0)
  const [touchX,    setTouchX]    = useState(null)
  const [animDir,   setAnimDir]   = useState(0)  // -1 left, 1 right

  function go(idx, dir) {
    setAnimDir(dir)
    setActive((idx + PHOTOS.length) % PHOTOS.length)
  }

  function onTouchStart(e) { setTouchX(e.touches[0].clientX) }
  function onTouchEnd(e) {
    if (touchX === null) return
    const dx = e.changedTouches[0].clientX - touchX
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1)
    setTouchX(null)
  }

  useEffect(() => { const id = setInterval(() => go(active + 1, 1), 4500); return () => clearInterval(id) }, [active])

  return (
    <section style={{ padding: 0, background: 'var(--bg2)', borderTop: GL, borderBottom: GL, position: 'relative', overflow: 'hidden' }}>
      <ParticleCanvas style={{ opacity: .14 }} />
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: 'clamp(36px,5vw,72px) clamp(20px,5vw,72px)', position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.66rem', letterSpacing: '.18em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          04 <span style={{ width: 32, height: 1, background: 'rgba(197,160,80,.3)', display: 'inline-block' }} />{t.photos_label}
        </div>

        {/* Main photo — swipeable */}
        <div style={{ position: 'relative', border: GL, aspectRatio: '16/9', maxHeight: 480, background: 'rgba(12,4,4,.8)', overflow: 'hidden', touchAction: 'pan-y' }}
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {PHOTOS[active].src
            ? <img src={PHOTOS[active].src} alt={PHOTOS[active].label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" opacity=".1"><rect x="2" y="6" width="32" height="24" rx="2" stroke="var(--text)" strokeWidth="1.2"/><circle cx="12" cy="17" r="4" stroke="var(--text)" strokeWidth="1.1"/><path d="M2 26l8-7 7 7 5-4 12 7" stroke="var(--text)" strokeWidth="1.1" strokeLinejoin="round"/></svg>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', color: 'rgba(237,228,223,.16)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Drop photo here</span>
              </div>}
          {/* Caption */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 16px', background: 'linear-gradient(transparent,rgba(10,3,3,.88))', fontFamily: 'var(--font-cond)', fontSize: '.82rem', letterSpacing: '.06em', color: 'var(--text-dim)' }}>
            {PHOTOS[active].label}
          </div>
          {/* Prev / Next arrows */}
          {['←', '→'].map((arrow, i) => (
            <button key={arrow} onClick={() => go(active + (i === 0 ? -1 : 1), i === 0 ? -1 : 1)}
              style={{ position: 'absolute', top: '50%', [i === 0 ? 'left' : 'right']: 12, transform: 'translateY(-50%)', background: 'rgba(12,4,4,.7)', border: GL, color: 'var(--text-dim)', width: 36, height: 36, cursor: 'pointer', fontFamily: 'var(--font-cond)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .18s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
              {arrow}
            </button>
          ))}
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
          {PHOTOS.map((_, i) => (
            <button key={i} onClick={() => go(i, i > active ? 1 : -1)}
              style={{ width: i === active ? 20 : 6, height: 6, background: i === active ? 'var(--gold)' : 'rgba(197,160,80,.25)', border: 'none', borderRadius: 3, cursor: 'pointer', transition: 'all .25s', padding: 0 }} />
          ))}
        </div>

        {/* Thumbnail strip — hidden on mobile via CSS */}
        <div className="carousel-thumbs" style={{ display: 'flex', gap: 8, marginTop: 16, overflowX: 'auto' }}>
          {PHOTOS.map((p, i) => (
            <div key={i} onClick={() => go(i, i > active ? 1 : -1)}
              style={{ flexShrink: 0, width: 110, border: i === active ? '1px solid rgba(197,160,80,.65)' : GL, cursor: 'pointer', background: i === active ? 'rgba(197,160,80,.06)' : 'transparent', transition: 'all .18s', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ width: '100%', aspectRatio: '4/3', background: 'rgba(12,4,4,.6)', backgroundImage: p.src ? `url(${p.src})` : 'none', backgroundSize: 'cover' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.52rem', letterSpacing: '.06em', color: i === active ? 'var(--text)' : 'var(--text-dimmer)', lineHeight: 1.4 }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
export function Footer({ t, lang, onLegal }) {
  return (
    <footer style={{ borderTop: GL, padding: '22px clamp(20px,5vw,72px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, position: 'relative', zIndex: 2 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.08rem', letterSpacing: '.12em', color: 'var(--text-dimmer)' }}>MANUFACTOR</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '.09em', color: 'var(--text-dimmer)' }}>{t.footer_copy}</div>
      <div style={{ display: 'flex', gap: 16 }}>
        {['privacy', 'terms'].map(type => (
          <button key={type} onClick={() => onLegal(type)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', letterSpacing: '.09em', color: 'var(--text-dimmer)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, transition: 'color .18s' }}
            onMouseEnter={e => e.target.style.color = 'var(--gold)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-dimmer)'}>
            {type === 'privacy' ? (lang === 'gr' ? 'Απόρρητο' : 'Privacy Policy') : (lang === 'gr' ? 'Όροι Χρήσης' : 'Terms of Service')}
          </button>
        ))}
      </div>
    </footer>
  )
}
