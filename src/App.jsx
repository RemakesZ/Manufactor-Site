import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { T } from './translations'
import { useCart } from './useCart'
import { NavBar, AuthModal, CookieBanner, LegalModal, Footer } from './components/ui'
import HomePage from './components/HomePage'
import ConfigurePage from './components/ConfigurePage'
import CartPage from './components/CartPage'
import MarketplacePage from './components/MarketplacePage'
import AccountPage from './components/AccountPage'

export default function App() {
  const [lang,      setLang]      = useState(() => (navigator.language || '').toLowerCase().startsWith('el') ? 'gr' : 'en')
  const [page,      setPage]      = useState('home')
  const [user,      setUser]      = useState(null)
  const [showAuth,  setShowAuth]  = useState(false)
  const [legal,     setLegal]     = useState(null)          // 'privacy' | 'terms' | null
  const [prefill,   setPrefill]   = useState(null)          // marketplace item → configure page
  const [threeLoaded, setThreeLoaded] = useState(false)

  const t    = T[lang]
  const cart = useCart(user)

  // ── Supabase auth: restore session on load ──────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser({ email: session.user.email, id: session.user.id })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email, id: session.user.id } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Load Three.js from CDN ──────────────────────────────────────────────────
  useEffect(() => {
    if (window.THREE) { setThreeLoaded(true); return }
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    s.onload = () => setThreeLoaded(true)
    document.head.appendChild(s)
  }, [])

  // ── When a marketplace item is clicked → go to configure with prefill ───────
  function handleOrderItem(item) {
    setPrefill({ stlUrl: item.stlUrl, stlName: item.name + '.stl' })
    setPage('quote')
  }

  // ── Sign out ────────────────────────────────────────────────────────────────
  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setPage('home')
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>
      <GlobalStyles />

      {/* Overlays */}
      {legal    && <LegalModal type={legal} t={t} onClose={() => setLegal(null)} />}
      {showAuth && <AuthModal t={t} lang={lang} onClose={() => setShowAuth(false)} onAuth={u => { setUser(u); setShowAuth(false) }} />}
      <CookieBanner t={t} />

      {/* Nav */}
      <NavBar
        page={page} setPage={setPage}
        lang={lang} setLang={setLang}
        user={user} onSignIn={() => setShowAuth(true)}
        t={t} cartCount={cart.totalItems}
      />

      {/* Pages */}
      {page === 'home' && (
        <HomePage t={t} lang={lang} setPage={setPage} onLegal={setLegal} />
      )}

      {page === 'quote' && (
        <ConfigurePage
          t={t} threeLoaded={threeLoaded}
          prefillItem={prefill}
          onAddToCart={item => { cart.addItem(item); setPrefill(null) }}
        />
      )}

      {page === 'cart' && (
        <CartPage t={t} cart={cart} user={user} lang={lang} />
      )}

      {page === 'market' && (
        <MarketplacePage
          t={t} lang={lang} user={user}
          threeLoaded={threeLoaded}
          onOrderItem={handleOrderItem}
          onSignIn={() => setShowAuth(true)}
        />
      )}

      {page === 'account' && (
        user
          ? <AccountPage t={t} lang={lang} user={user} onSignOut={signOut} />
          : <div style={{ paddingTop: 120, display: 'flex', justifyContent: 'center' }}>
              <button className="btn-p" onClick={() => setShowAuth(true)}>{t.nav_signin}</button>
            </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// All CSS variables, resets, shared component classes
// ─────────────────────────────────────────────────────────────────────────────
function GlobalStyles() {
  const GL = '1px solid rgba(197,160,80,0.28)'
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500&family=Barlow+Condensed:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

      :root {
        --bg: #0c0404; --bg2: #110606; --bg3: #160808;
        --red: #8b1a1a; --red-bright: #c0272d;
        --gold: #c5a050; --gold-dim: rgba(197,160,80,0.22);
        --text: #ede4df; --text-dim: rgba(237,228,223,0.55); --text-dimmer: rgba(237,228,223,0.27);
        --font-display: 'Bebas Neue', sans-serif;
        --font-cond: 'Barlow Condensed', sans-serif;
        --font-body: 'Inter', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
      }

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      ::selection { background: rgba(197,160,80,0.2); }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: var(--bg); }
      ::-webkit-scrollbar-thumb { background: rgba(197,160,80,0.22); }

      @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pulse   { 0%,100%{opacity:.4} 50%{opacity:.9} }

      .fu  { opacity:0; animation: fadeUp .6s ease forwards; }
      .fu1 { animation-delay: .0s;  }
      .fu2 { animation-delay: .12s; }
      .fu3 { animation-delay: .25s; }
      .fu4 { animation-delay: .4s;  }

      /* ── NAV ── */
      nav {
        position:fixed; top:0; left:0; right:0; z-index:200;
        display:flex; align-items:center; justify-content:space-between;
        padding:0 clamp(16px,4vw,72px); height:58px;
        background:rgba(12,4,4,0.96); backdrop-filter:blur(14px);
        border-bottom:${GL};
      }
      .n-logo { font-family:var(--font-display); font-size:1.48rem; letter-spacing:.14em; color:var(--text); cursor:pointer; user-select:none; flex-shrink:0; }
      .n-logo em { color:var(--red-bright); font-style:normal; }
      .n-logo img { height:30px; width:auto; object-fit:contain; }
      .n-r { display:flex; align-items:center; gap:20px; }
      .nl  { font-family:var(--font-cond); font-size:.78rem; letter-spacing:.12em; text-transform:uppercase; color:var(--text-dim); background:none; border:none; cursor:pointer; transition:color .2s; padding-bottom:2px; white-space:nowrap; }
      .nl:hover { color:var(--text); }
      .nl.act   { color:var(--text); border-bottom:1px solid var(--gold); }
      .n-user   { font-family:var(--font-mono); font-size:.62rem; letter-spacing:.08em; color:var(--gold); background:rgba(197,160,80,.08); border:${GL}; padding:4px 10px; cursor:pointer; transition:background .2s; white-space:nowrap; }
      .n-user:hover { background:rgba(197,160,80,.15); }
      .lt  { display:flex; border:${GL}; overflow:hidden; flex-shrink:0; }
      .lb  { font-family:var(--font-mono); font-size:.64rem; letter-spacing:.08em; padding:4px 9px; background:none; border:none; color:var(--text-dimmer); cursor:pointer; transition:all .18s; }
      .lb.act { background:rgba(197,160,80,.12); color:var(--gold); }
      .ls  { width:1px; background:rgba(197,160,80,.25); }

      /* Hamburger */
      .hbg { display:none; flex-direction:column; justify-content:center; gap:5px; background:none; border:none; cursor:pointer; padding:8px; margin-right:-8px; height:40px; }
      .hbg span { display:block; width:22px; height:1.5px; background:var(--text); transition:all .25s; transform-origin:center; }
      .hbg.open span:nth-child(1) { transform:translateY(6.5px) rotate(45deg); }
      .hbg.open span:nth-child(2) { opacity:0; transform:scaleX(0); }
      .hbg.open span:nth-child(3) { transform:translateY(-6.5px) rotate(-45deg); }

      /* Mobile drawer */
      .mob-drawer { position:fixed; top:58px; left:0; right:0; z-index:190; background:rgba(10,3,3,0.98); border-bottom:${GL}; backdrop-filter:blur(16px); display:flex; flex-direction:column; padding:16px clamp(16px,4vw,32px) 20px; transform:translateY(-110%); transition:transform .26s cubic-bezier(.4,0,.2,1); pointer-events:none; }
      .mob-drawer.open { transform:translateY(0); pointer-events:all; }
      .mob-nl { font-family:var(--font-cond); font-size:1.05rem; letter-spacing:.12em; text-transform:uppercase; color:var(--text-dim); background:none; border:none; cursor:pointer; text-align:left; padding:13px 0; border-bottom:1px solid rgba(197,160,80,.1); transition:color .2s; width:100%; }
      .mob-nl:last-of-type { border-bottom:none; }
      .mob-nl:hover, .mob-nl.act { color:var(--gold); }
      .mob-lang { display:flex; gap:0; border:${GL}; width:fit-content; margin-top:14px; }

      /* ── BUTTONS ── */
      .btn-p { display:inline-flex; align-items:center; gap:8px; font-family:var(--font-cond); font-size:.86rem; letter-spacing:.14em; text-transform:uppercase; padding:12px 26px; background:var(--red); color:var(--text); border:none; cursor:pointer; transition:background .22s,transform .18s; }
      .btn-p:hover:not(:disabled) { background:var(--red-bright); transform:translateY(-1px); }
      .btn-p:disabled { opacity:.5; cursor:not-allowed; transform:none; }
      .btn-s { display:inline-flex; align-items:center; gap:8px; font-family:var(--font-cond); font-size:.86rem; letter-spacing:.14em; text-transform:uppercase; padding:11px 26px; background:transparent; color:var(--text-dim); border:${GL}; cursor:pointer; transition:all .22s; }
      .btn-s:hover { color:var(--text); border-color:rgba(197,160,80,.6); }

      /* ── FORM ELEMENTS ── */
      .form-group { margin-bottom:20px; }
      label { display:block; font-family:var(--font-mono); font-size:.64rem; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:8px; }
      .fi, .fs, .fta { width:100%; background:rgba(255,255,255,.022); border:${GL}; color:var(--text); font-family:var(--font-body); font-size:.86rem; padding:10px 12px; outline:none; transition:border-color .2s; border-radius:0; appearance:none; }
      .fi:focus, .fs:focus, .fta:focus { border-color:rgba(197,160,80,.56); background:rgba(197,160,80,.03); }
      .fs { cursor:pointer; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23c5a050' stroke-width='1.3' fill='none'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:32px; background-color:rgba(12,4,4,.97); }
      option { background:#160808; color:var(--text); }
      .fta { min-height:84px; resize:vertical; line-height:1.6; }

      /* Upload zone */
      .uz { border:1px dashed rgba(197,160,80,.3); padding:28px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px; cursor:pointer; transition:all .2s; text-align:center; background:rgba(255,255,255,.016); }
      .uz:hover, .uz.dg { border-color:rgba(197,160,80,.6); background:rgba(197,160,80,.04); }
      .uz.ld { border-color:rgba(139,26,26,.5); border-style:solid; }
      .uph { font-family:var(--font-mono); font-size:.62rem; letter-spacing:.1em; color:var(--text-dimmer); text-transform:uppercase; }
      .upn { font-family:var(--font-cond); font-size:.87rem; color:var(--text); letter-spacing:.05em; }

      /* Quantity stepper */
      .qr { display:flex; align-items:center; border:${GL}; width:fit-content; }
      .qb { width:35px; height:35px; background:none; border:none; color:var(--text); font-size:1.08rem; cursor:pointer; transition:background .18s; }
      .qb:hover { background:rgba(197,160,80,.08); }
      .qv { min-width:40px; height:35px; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size:.85rem; color:var(--text); border-left:${GL}; border-right:${GL}; }

      /* Card grid */
      .cards3 { display:grid; grid-template-columns:repeat(3,1fr); border:${GL}; }
      .crd { padding:32px 24px; background:var(--bg2); border-right:${GL}; transition:background .22s; }
      .crd:last-child { border-right:none; }
      .crd:hover { background:rgba(139,26,26,.09); }

      /* ── RESPONSIVE ── */
      @media(max-width:900px) {
        .cards3 { grid-template-columns:1fr; }
        .crd { border-right:none; border-bottom:${GL}; }
        .crd:last-child { border-bottom:none; }
        .fin-row { grid-template-columns:1fr !important; }
        .two-col { grid-template-columns:1fr !important; }
        .configure-sidebar { position:static !important; border-top:${GL}; }
      }
      @media(max-width:680px) {
        .n-r .nl, .n-r .n-user, .n-r .lt { display:none; }
        .hbg { display:flex; }
        .hr { display:none; }
        .carousel-thumbs { display:none !important; }
        section { padding-left:16px !important; padding-right:16px !important; }
      }
      /* Prevent any element causing horizontal scroll */
      body { overflow-x:hidden; }
      img, video, canvas { max-width:100%; }
    `}</style>
  )
}
