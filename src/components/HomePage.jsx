import { ParticleCanvas, Typewriter, Carousel, Footer } from './ui'

const GL = '1px solid rgba(197,160,80,0.28)'

export default function HomePage({ t, lang, setPage, onLegal }) {
  return (
    <>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '80px clamp(20px,5vw,72px) 60px' }}>
        <ParticleCanvas style={{ zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="fu fu1" style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', letterSpacing: '.15em', color: 'var(--gold)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ display: 'block', width: 24, height: 1, background: 'var(--gold)' }} />{t.hero_tag}
            </div>
            <h1 className="fu fu2" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,5vw,4.8rem)', lineHeight: .96, letterSpacing: '.03em', color: 'var(--text)' }}>
              {t.hero_headline}
            </h1>
            <div className="fu fu3" style={{ minHeight: 22 }}><Typewriter slogans={t.slogans} /></div>
            <p className="fu fu3" style={{ fontSize: 'clamp(.85rem,1.2vw,.95rem)', lineHeight: 1.84, color: 'var(--text-dim)', fontWeight: 300, maxWidth: 450 }}>{t.hero_sub}</p>
            <div className="fu fu4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-p" onClick={() => setPage('quote')}>
                {t.cta_quote}
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="btn-s" onClick={() => document.getElementById('what')?.scrollIntoView({ behavior: 'smooth' })}>{t.cta_learn}</button>
            </div>
          </div>
          {/* Printer placeholder */}
          <div className="fu fu4 hr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 420, aspectRatio: '1', border: GL, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, background: 'linear-gradient(135deg,rgba(139,26,26,.07),transparent 65%)' }}>
              {[['top:-1px;left:-1px;border-top:2px solid var(--gold);border-left:2px solid var(--gold)'],
                ['top:-1px;right:-1px;border-top:2px solid var(--gold);border-right:2px solid var(--gold)'],
                ['bottom:-1px;left:-1px;border-bottom:2px solid var(--gold);border-left:2px solid var(--gold)'],
                ['bottom:-1px;right:-1px;border-bottom:2px solid var(--gold);border-right:2px solid var(--gold)']
              ].map((s, i) => <div key={i} style={{ position: 'absolute', width: 16, height: 16, ...(Object.fromEntries(s[0].split(';').map(r => { const [k,...v]=r.split(':'); return [k.trim().replace(/-([a-z])/g,(_,c)=>c.toUpperCase()), v.join(':').trim()] }))) }} />)}
              <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(197,160,80,.07)' }} />
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: .1 }}>
                <rect x="12" y="24" width="40" height="26" rx="2" stroke="var(--text)" strokeWidth="1.3"/>
                <rect x="20" y="16" width="24" height="10" rx="1" stroke="var(--text)" strokeWidth="1.3"/>
                <line x1="12" y1="40" x2="52" y2="40" stroke="var(--text)" strokeWidth="1"/>
                <circle cx="44" cy="32" r="3" fill="var(--text)"/>
                <rect x="24" y="50" width="16" height="8" stroke="var(--text)" strokeWidth="1.3"/>
              </svg>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.63rem', letterSpacing: '.13em', color: 'var(--text-dimmer)', textAlign: 'center', textTransform: 'uppercase' }}>
                Manufactor MK-I<br /><span style={{ color: 'var(--red-bright)', opacity: .45 }}>Render coming soon</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr style={{ height: 1, background: 'rgba(197,160,80,.2)', border: 'none', margin: 0 }} />

      {/* WHAT WE DO */}
      <section id="what" style={{ padding: 'clamp(50px,7vw,96px) clamp(20px,5vw,72px)', position: 'relative', overflow: 'hidden', background: 'var(--bg2)' }}>
        <ParticleCanvas style={{ opacity: .13 }} />
        <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.66rem', letterSpacing: '.18em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            01 <span style={{ width: 32, height: 1, background: 'rgba(197,160,80,.3)', display: 'inline-block' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem,3.6vw,3rem)', letterSpacing: '.04em', color: 'var(--text)', marginBottom: 22, lineHeight: 1 }}>{t.section_what}</h2>
          <p style={{ fontSize: '.91rem', lineHeight: 1.84, color: 'var(--text-dim)', maxWidth: 580, fontWeight: 300 }}>{t.what_p}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', border: GL, marginTop: 38 }} className="cards3">
            {[
              { n: '01', title: t.card_print_title, body: t.card_print_body },
              { n: '02', title: t.card_finish_title, body: t.card_finish_body },
              { n: '03', title: t.card_rapid_title, body: t.card_rapid_body },
            ].map(c => (
              <div key={c.n} className="crd">
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.59rem', color: 'var(--gold)', letterSpacing: '.12em', marginBottom: 14 }}>— {c.n}</div>
                <div style={{ fontFamily: 'var(--font-cond)', fontSize: '1.02rem', letterSpacing: '.07em', color: 'var(--text)', marginBottom: 10, textTransform: 'uppercase' }}>{c.title}</div>
                <div style={{ fontSize: '.83rem', lineHeight: 1.74, color: 'var(--text-dim)', fontWeight: 300 }}>{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr style={{ height: 1, background: 'rgba(197,160,80,.2)', border: 'none', margin: 0 }} />

      {/* FINISHING */}
      <section style={{ padding: 'clamp(50px,7vw,96px) clamp(20px,5vw,72px)', position: 'relative', overflow: 'hidden' }}>
        <ParticleCanvas style={{ opacity: .1 }} />
        <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.66rem', letterSpacing: '.18em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            02 <span style={{ width: 32, height: 1, background: 'rgba(197,160,80,.3)', display: 'inline-block' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem,3.6vw,3rem)', letterSpacing: '.04em', color: 'var(--text)', marginBottom: 22, lineHeight: 1 }}>Finishing Options</h2>
          <p style={{ fontSize: '.91rem', lineHeight: 1.8, color: 'var(--text-dim)', fontWeight: 300, maxWidth: 500 }}>{t.finishing_intro}</p>
          <div style={{ marginTop: 32, border: GL }}>
            {t.finishing_items.map((fi, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'start', padding: '18px 24px', borderBottom: i < t.finishing_items.length - 1 ? GL : 'none', gap: 18, transition: 'background .2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,26,26,.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                className="fin-row">
                <div style={{ fontFamily: 'var(--font-cond)', fontSize: '.96rem', letterSpacing: '.07em', color: 'var(--text)', textTransform: 'uppercase' }}>{fi.label}</div>
                <div style={{ fontSize: '.83rem', lineHeight: 1.72, color: 'var(--text-dim)', fontWeight: 300 }}>{fi.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr style={{ height: 1, background: 'rgba(197,160,80,.2)', border: 'none', margin: 0 }} />
      <Carousel t={t} />
      <hr style={{ height: 1, background: 'rgba(197,160,80,.2)', border: 'none', margin: 0 }} />

      {/* MANIFESTO */}
      <section style={{ padding: 'clamp(50px,7vw,96px) clamp(20px,5vw,72px)', position: 'relative', overflow: 'hidden', background: 'var(--bg3)', borderTop: GL, borderBottom: GL }}>
        <ParticleCanvas style={{ opacity: .11 }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.66rem', letterSpacing: '.18em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            03 <span style={{ width: 32, height: 1, background: 'rgba(197,160,80,.3)', display: 'inline-block' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem,3.6vw,3rem)', letterSpacing: '.04em', color: 'var(--text)', marginBottom: 24, lineHeight: 1 }}>{t.section_manifesto}</h2>
          <p style={{ fontFamily: 'var(--font-cond)', fontSize: 'clamp(.95rem,1.8vw,1.22rem)', lineHeight: 2, color: 'var(--text-dim)', whiteSpace: 'pre-line', letterSpacing: '.02em' }}>{t.manifesto_p}</p>
          <div style={{ marginTop: 36 }}>
            <button className="btn-p" onClick={() => setPage('quote')}>
              {t.cta_quote}
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </section>

      <Footer t={t} lang={lang} onLegal={onLegal} />
    </>
  )
}
