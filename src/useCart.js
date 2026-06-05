// useCart.js — cart state with localStorage (guests) + Supabase (logged-in users)
import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const LS_KEY = 'manufactor_cart'

function loadFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    // STL buffers can't be serialised to JSON, so we strip them on save
    // and mark items as needing re-upload
    return JSON.parse(raw).map(i => ({ ...i, stlBuffer: null, needsReload: true }))
  } catch { return [] }
}

function saveToLS(items) {
  try {
    // Don't serialise ArrayBuffer — just metadata
    const slim = items.map(({ stlBuffer, ...rest }) => rest)
    localStorage.setItem(LS_KEY, JSON.stringify(slim))
  } catch {}
}

export function useCart(user) {
  const [items, setItems] = useState(loadFromLS)

  // Persist to localStorage on every change
  useEffect(() => { saveToLS(items) }, [items])

  // SUPABASE: load user's saved cart on login
  // useEffect(() => {
  //   if (!user) return
  //   supabase.from('cart_items').select('*').eq('user_id', user.id)
  //     .then(({ data }) => { if (data?.length) setItems(data) })
  // }, [user])

  const addItem = useCallback(async (item) => {
    // item shape: { id, stlName, stlBuffer, volumeMm3, thumbnail,
    //               material, layer, infill, post, color, qty, unitPrice, notes }
    const newItem = { ...item, cartId: `${Date.now()}-${Math.random().toString(36).slice(2)}` }
    setItems(prev => [...prev, newItem])

    // SUPABASE: save STL file to storage + record to user_files
    // if (user && item.stlBuffer) {
    //   const path = `${user.id}/${newItem.cartId}.stl`
    //   await supabase.storage.from('user-stls').upload(path, item.stlBuffer)
    //   await supabase.from('user_files').insert({
    //     user_id: user.id, name: item.stlName,
    //     size_bytes: item.stlBuffer.byteLength,
    //     volume_mm3: item.volumeMm3, stl_path: path,
    //     thumbnail_url: item.thumbnail ?? null,
    //   })
    //   // Save to cart_items table for persistence
    //   await supabase.from('cart_items').insert({
    //     user_id: user.id, cart_id: newItem.cartId,
    //     stl_name: item.stlName, volume_mm3: item.volumeMm3,
    //     material: item.material, layer: item.layer, infill: item.infill,
    //     post: item.post, color_hex: item.color?.hex, qty: item.qty,
    //     unit_price: item.unitPrice, notes: item.notes,
    //   })
    // }
  }, [user])

  const removeItem = useCallback((cartId) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId))
    // SUPABASE: await supabase.from('cart_items').delete().eq('cart_id', cartId)
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    try { localStorage.removeItem(LS_KEY) } catch {}
    // SUPABASE: await supabase.from('cart_items').delete().eq('user_id', user.id)
  }, [])

  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0)

  return { items, addItem, removeItem, clearCart, totalItems, subtotal }
}
