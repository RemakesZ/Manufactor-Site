import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { DISCOUNT_CODES } from '../config'

const GL = '1px solid rgba(197,160,80,0.28)'

const STATUS_COLORS = {
  pending: 'var(--text-dimmer)', confirmed: 'var(--gold)',
  printing: '#4a90d9', shipped: '#7cba6a', complete: '#7cba6a',
}

function statusLabel(status, t) {
  return t[`order_status_${status}`] || status
}

export default function AccountPage({ t, lang, user, onSignOut }) {
  const [orders, setOrders] = useState([])
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!user) return
    // SUPABASE: load user's order history
    // const { data } = await supabase
    //   .from('quote_requests')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .order('created_at', { ascending: false })
    // setOrders(data ?? [])

    // Demo data — remove when Supabase is connected:
    setOrders([
      {
        id: 'ord-001', created_at: '2025-05-10T14:22:00Z', status: 'complete',
        items: [{ stl_name: 'bracket_v3.stl', material: 'PETG', qty: 2, unit_price: 12.40 }],
        total: 24.80, discount_code: null,
      },
      {
        id: 'ord-002', created_at: '2025-05-20T09:44:00Z', status: 'printing',
        items: [{ stl_name: 'flexicat.stl', material: 'PLA', qty: 1, unit_price: 8.00 }],
        total: 8.00, discount_code: 'FIRST10',
      },
    ])
  }, [user])

  // Which discount codes this user has access to (simplified: show all active ones)
  // In production you'd have a user_promos table with unlocked codes per user
  const availableCodes = Object.entries(DISCOUNT_CODES).map(([code, data]) => ({ code, ...data }))

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(lang === 'gr' ? 'el-GR' : 'en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  return (
    <div style={{ paddingTop: 58, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px clamp(20px,5vw,56px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.67rem', letterSpacing: '.18em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              Account <span style={{ width: 32, height: 1, background: 'rgba(197,160,80,.3)', display: 'inline-block' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', letterSpacing: '.04em', color: 'var(--text)', marginBottom: 8 }}>{t.account_title}</h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'var(--text-dimmer)', letterSpacing: '.08em', lineHeight: 2 }}>
              {user.email}
            </div>
          </div>
          <button className="btn-s" onClick={onSignOut}>{t.btn_signout}</button>
        </div>

        {/* Order history */}
        <Section label={t.account_orders}>
          {orders.length === 0 ? (
            <div style={{ border: GL, padding: '28px 24px', fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'var(--text-dimmer)', letterSpacing: '.08em' }}>
              {t.account_orders_empty}
            </div>
          ) : (
            <div style={{ border: GL }}>
              {orders.map((order, idx) => (
                <div key={order.id} style={{ borderBottom: idx < orders.length - 1 ? GL : 'none' }}>
                  {/* Order row */}
                  <div
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 16, padding: '16px 22px', cursor: 'pointer', transition: 'background .18s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,26,26,.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontFamily: 'var(--font-cond)', fontSize: '.98rem', letterSpacing: '.06em', color: 'var(--text)', marginBottom: 3 }}>
                        {order.items.map(i => i.stl_name).join(', ')}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--text-dimmer)', letterSpacing: '.07em' }}>
                        {formatDate(order.created_at)} · {order.items.reduce((s, i) => s + i.qty, 0)} parts
                        {order.discount_code && ` · ${order.discount_code}`}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.65rem', color: STATUS_COLORS[order.status] || 'var(--text-dimmer)', letterSpacing: '.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {statusLabel(order.status, t)}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '.04em', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                      €{order.total.toFixed(2)}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expanded === order.id && (
                    <div style={{ borderTop: GL, background: 'rgba(139,26,26,.04)', padding: '14px 22px 18px' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', color: 'var(--text-dim)', padding: '5px 0', borderBottom: i < order.items.length - 1 ? '1px solid rgba(197,160,80,.1)' : 'none' }}>
                          <span style={{ fontFamily: 'var(--font-cond)', letterSpacing: '.05em' }}>
                            {item.stl_name} · {item.material} · ×{item.qty}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
                            €{(item.unit_price * item.qty).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Discount codes */}
        <Section label={t.account_promos} style={{ marginTop: 36 }}>
          <p style={{ fontSize: '.84rem', color: 'var(--text-dimmer)', marginBottom: 16, fontStyle: 'italic', fontFamily: 'var(--font-mono)', fontSize: '.65rem', letterSpacing: '.06em' }}>
            {t.account_promos_note}
          </p>
          {availableCodes.length === 0 ? (
            <div style={{ border: GL, padding: '20px 24px', fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'var(--text-dimmer)' }}>{t.account_promos_empty}</div>
          ) : (
            <div style={{ border: GL }}>
              {availableCodes.map((c, i) => (
                <div key={c.code} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 16, padding: '14px 22px', borderBottom: i < availableCodes.length - 1 ? GL : 'none' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.75rem', letterSpacing: '.1em', color: 'var(--gold)', background: 'rgba(197,160,80,.08)', border: GL, padding: '4px 10px' }}>
                    {c.code}
                  </div>
                  <div>
                    <div style={{ fontSize: '.84rem', color: 'var(--text)', marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', color: 'var(--text-dimmer)', letterSpacing: '.06em' }}>
                      {c.condition?.type === 'min_qty'   && `Requires ${c.condition.value}+ items`}
                      {c.condition?.type === 'min_value' && `Requires €${c.condition.value}+ subtotal`}
                      {c.condition?.type === 'first_order' && 'First order only'}
                      {c.condition?.type === 'material'  && `Requires ${c.condition.value} in cart`}
                      {c.condition?.type === 'none'      && 'No minimum'}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '.04em', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                    {c.type === 'percent' ? `−${c.value}%` : `−€${c.value}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

      </div>
    </div>
  )
}

function Section({ label, children, style }) {
  return (
    <div style={{ marginBottom: 36, ...style }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.66rem', letterSpacing: '.15em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        {label} <span style={{ flex: 1, maxWidth: 40, height: 1, background: 'rgba(197,160,80,.3)', display: 'inline-block' }} />
      </div>
      {children}
    </div>
  )
}
