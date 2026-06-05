import { useState } from 'react'
import { applyDiscount, validateCode } from '../config'
import { supabase } from '../supabase'

const GL = '1px solid rgba(197,160,80,0.28)'

function statusColor(status) {
  const map = { pending: 'var(--text-dimmer)', confirmed: 'var(--gold)', printing: '#4a90d9', shipped: '#7cba6a', complete: '#7cba6a' }
  return map[status] || 'var(--text-dimmer)'
}

export default function CartPage({ t, cart, user, lang }) {
  const { items, removeItem, clearCart, subtotal } = cart

  const [discountInput,   setDiscountInput]   = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [discountError,   setDiscountError]   = useState('')
  const [custName,        setCustName]        = useState('')
  const [email,           setEmail]           = useState(user?.email || '')
  const [generalNotes,    setGeneralNotes]    = useState('')
  const [sending,         setSending]         = useState(false)
  const [sent,            setSent]            = useState(false)

  // Pre-fill email when user logs in
  if (user?.email && !email) setEmail(user.email)

  const discounted = applyDiscount(subtotal, appliedDiscount)
  const savings    = subtotal - discounted

  function handleApplyCode() {
    setDiscountError('')
    // SUPABASE: fetch code from DB first:
    // const { data } = await supabase.from('discount_codes').select('*').eq('code', discountInput.toUpperCase()).eq('active', true).single()
    // Then validate locally. For now uses local DISCOUNT_CODES:
    const result = validateCode(discountInput, items, 0 /* TODO: pass real user order count */)
    if (result.valid) {
      setAppliedDiscount(result.discount)
    } else {
      setDiscountError(result.reason)
    }
  }

  async function handleSubmit() {
    if (!custName || !email || items.length === 0) return
    setSending(true)

    // SUPABASE: save the quote request and upload STL files
    // for (const item of items) {
    //   if (item.stlBuffer) {
    //     const path = `${user?.id ?? 'anon'}/${item.cartId}.stl`
    //     await supabase.storage.from('user-stls').upload(path, item.stlBuffer, { upsert: true })
    //   }
    // }
    // await supabase.from('quote_requests').insert({
    //   user_id: user?.id ?? null,
    //   name: custName, email,
    //   items: items.map(i => ({
    //     stl_name: i.stlName, volume_mm3: i.volumeMm3,
    //     material: i.material, layer: i.layer, infill: i.infill,
    //     post: i.post, color_hex: i.color?.hex, qty: i.qty,
    //     unit_price: i.unitPrice, notes: i.notes,
    //   })),
    //   subtotal, discount_code: appliedDiscount?.code ?? null,
    //   total: discounted, notes: generalNotes, status: 'pending',
    // })

    await new Promise(r => setTimeout(r, 1600))
    setSending(false)
    setSent(true)
    clearCart()
  }

  if (sent) {
    return (
      <div style={{ paddingTop: 58, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '60px 32px', maxWidth: 500 }}>
          <div style={{ color: 'var(--gold)', marginBottom: 18 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.4"/><path d="M13 24l8 8 14-14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', letterSpacing: '.06em', color: 'var(--text)', marginBottom: 10 }}>{t.sent_title}</div>
          <p style={{ fontSize: '.88rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>{t.sent_body}</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div style={{ paddingTop: 58, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '60px 32px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: 'var(--text-dimmer)', letterSpacing: '.1em', marginBottom: 24 }}>{t.cart_empty}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 58, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px clamp(20px,5vw,56px)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.67rem', letterSpacing: '.18em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12 }}>
          {t.nav_cart}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', letterSpacing: '.04em', color: 'var(--text)', marginBottom: 36 }}>{t.cart_title}</h1>

        <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>

          {/* ITEM LIST */}
          <div>
            <div style={{ border: GL }}>
              {items.map((item, idx) => (
                <div key={item.cartId} style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 16, padding: '18px 20px', borderBottom: idx < items.length - 1 ? GL : 'none', alignItems: 'start' }}>
                  {/* Thumbnail */}
                  <div style={{ width: 56, height: 56, border: GL, background: 'rgba(12,4,4,.6)', flexShrink: 0, overflow: 'hidden' }}>
                    {item.thumbnail
                      ? <img src={item.thumbnail} alt={item.stlName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '.5rem', color: 'rgba(237,228,223,.2)' }}>STL</div>
                    }
                  </div>

                  {/* Details */}
                  <div>
                    <div style={{ fontFamily: 'var(--font-cond)', fontSize: '1rem', letterSpacing: '.06em', color: 'var(--text)', marginBottom: 4 }}>{item.stlName}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--text-dimmer)', letterSpacing: '.06em', lineHeight: 1.8 }}>
                      {item.material} · {item.layer}mm · {item.infill} infill
                      {item.post !== 'none' && ` · ${item.post}`}
                      {item.color && <span> · <span style={{ display: 'inline-block', width: 8, height: 8, background: item.color.hex, border: '1px solid rgba(197,160,80,.3)', verticalAlign: 'middle', marginRight: 3 }}/>{item.color.name}</span>}
                      {' · '}qty {item.qty}
                    </div>
                    {item.notes && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', color: 'var(--text-dimmer)', marginTop: 4, fontStyle: 'italic' }}>{item.notes}</div>}
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', letterSpacing: '.04em', color: 'var(--text)', marginTop: 8 }}>
                      €{(item.unitPrice * item.qty).toFixed(2)}
                      {item.qty > 1 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--text-dimmer)', marginLeft: 6 }}>€{item.unitPrice.toFixed(2)} ea</span>}
                    </div>
                  </div>

                  {/* Remove */}
                  <button onClick={() => removeItem(item.cartId)} style={{ background: 'none', border: '1px solid rgba(139,26,26,.35)', color: 'rgba(192,39,45,.65)', fontFamily: 'var(--font-cond)', fontSize: '.72rem', letterSpacing: '.1em', padding: '5px 10px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all .18s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { e.target.style.background = 'rgba(139,26,26,.15)'; e.target.style.color = 'var(--red-bright)' }}
                    onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = 'rgba(192,39,45,.65)' }}>
                    {t.cart_item_remove}
                  </button>
                </div>
              ))}
            </div>

            {/* Contact + general notes */}
            <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t.name_label}</label>
                <input className="fi" value={custName} onChange={e => setCustName(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t.email_label}</label>
                <input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 14 }}>
              <label>{t.notes_all_label}</label>
              <textarea className="fta" value={generalNotes} onChange={e => setGeneralNotes(e.target.value)} placeholder={t.notes_all_placeholder} />
            </div>

            <button
              className="btn-p"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, opacity: (!custName || !email || sending) ? 0.5 : 1 }}
              onClick={handleSubmit}
              disabled={!custName || !email || sending}
            >
              {sending ? t.btn_sending : t.btn_request}
              {!sending && <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
          </div>

          {/* SIDEBAR — totals + discount */}
          <div style={{ position: 'sticky', top: 72, height: 'fit-content' }}>
            <div style={{ border: GL, padding: '22px', background: 'rgba(139,26,26,.06)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.64rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>Order Summary</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', color: 'var(--text-dim)' }}>
                  <span>{t.cart_subtotal}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>€{subtotal.toFixed(2)}</span>
                </div>
                {appliedDiscount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', color: '#7cba6a' }}>
                    <span>{appliedDiscount.code}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>−€{savings.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: GL, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-cond)', fontSize: '.95rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{t.cart_total}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '.04em', color: 'var(--text)' }}>€{discounted.toFixed(2)}</span>
              </div>

              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--text-dimmer)', marginTop: 10, lineHeight: 1.65, fontStyle: 'italic' }}>{t.cart_note}</p>
            </div>

            {/* Discount code */}
            <div style={{ marginTop: 12, border: GL, padding: '16px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '.64rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
                {t.cart_discount_label}
              </label>
              <div style={{ display: 'flex', gap: 0 }}>
                <input className="fi" style={{ flex: 1, borderRight: 'none' }}
                  value={discountInput}
                  onChange={e => { setDiscountInput(e.target.value); setDiscountError('') }}
                  placeholder={t.cart_discount_placeholder}
                  onKeyDown={e => e.key === 'Enter' && handleApplyCode()} />
                <button onClick={handleApplyCode} style={{ fontFamily: 'var(--font-cond)', fontSize: '.78rem', letterSpacing: '.1em', textTransform: 'uppercase', padding: '0 14px', background: 'none', border: GL, color: 'var(--text-dim)', cursor: 'pointer', transition: 'all .2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}>
                  {t.cart_discount_apply}
                </button>
              </div>
              {discountError && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: 'var(--red-bright)', marginTop: 7, letterSpacing: '.06em' }}>{discountError}</p>}
              {appliedDiscount && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: '#7cba6a', marginTop: 7, letterSpacing: '.06em' }}>✓ {appliedDiscount.label}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
