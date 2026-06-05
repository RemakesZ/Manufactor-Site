import { useEffect, useRef } from 'react'
import { buildGeometry, autoOrient } from '../stlUtils'

// ─────────────────────────────────────────────────────────────────────────────
// STL VIEWER
// Props:
//   buffer      — ArrayBuffer of the STL file
//   colorHex    — hex string e.g. "#8b1a1a", updates material live
//   boundingBox — { x, y, z } from parseSTL, used for auto-orient
//   onThumbnail — called with a base64 PNG data URL after first render
// ─────────────────────────────────────────────────────────────────────────────
export default function STLViewer({ buffer, colorHex, boundingBox, onThumbnail }) {
  const mountRef = useRef(null)
  const glRef    = useRef(null)   // { renderer, mat }

  // Live color update without remount
  useEffect(() => {
    if (!glRef.current?.mat || !colorHex || !window.THREE) return
    glRef.current.mat.color.set(colorHex)
  }, [colorHex])

  useEffect(() => {
    if (!window.THREE || !buffer) return
    const THREE = window.THREE
    const el = mountRef.current
    if (!el) return

    if (glRef.current) { glRef.current.renderer.dispose(); el.innerHTML = '' }

    const W = el.offsetWidth
    const H = el.offsetHeight || 300
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    // Prevent page scroll while interacting with the viewer
    renderer.domElement.style.touchAction = 'none'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100000)

    const geom = buildGeometry(buffer, THREE)
    const mat = new THREE.MeshStandardMaterial({ color: colorHex || '#8b1a1a', roughness: 0.52, metalness: 0.38 })
    const mesh = new THREE.Mesh(geom, mat)
    scene.add(mesh)

    // Auto-orient using actual bounding box data
    if (boundingBox) autoOrient(mesh, boundingBox)

    const box = new THREE.Box3().setFromObject(mesh)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const fitDist = (maxDim / 2) / Math.tan(22.5 * Math.PI / 180) * 1.4

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const d1 = new THREE.DirectionalLight(0xffc880, 1.3); d1.position.set(1, 2, 1.5); scene.add(d1)
    const d2 = new THREE.DirectionalLight(0x8b2020, 0.5); d2.position.set(-1, -0.5, -1); scene.add(d2)

    // Orbit state
    let theta = 0, phi = 0.18
    let spinDTheta = 0.007, spinDPhi = 0
    let autoSpin = true, isDragging = false
    let lastX = 0, lastY = 0, velTheta = 0, velPhi = 0

    function camPos() {
      const r = fitDist
      camera.position.set(
        r * Math.cos(phi) * Math.sin(theta),
        r * Math.sin(phi),
        r * Math.cos(phi) * Math.cos(theta)
      )
      camera.lookAt(0, 0, 0)
    }
    camPos()

    const dom = renderer.domElement
    dom.style.cursor = 'grab'

    // Fixed sensitivity — feels right across screen sizes
    const sensitivity = 0.007

    function onPointerDown(e) {
      e.preventDefault()
      isDragging = true; autoSpin = false
      lastX = e.clientX; lastY = e.clientY
      velTheta = 0; velPhi = 0
      dom.style.cursor = 'grabbing'
      dom.setPointerCapture(e.pointerId)
    }
    function onPointerMove(e) {
      if (!isDragging) return
      e.preventDefault()
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      velTheta = -dx * sensitivity
      velPhi   = -dy * sensitivity
      theta += velTheta
      phi = Math.max(-1.3, Math.min(1.3, phi + velPhi))
      lastX = e.clientX; lastY = e.clientY
    }
    function onPointerUp() {
      isDragging = false
      dom.style.cursor = 'grab'
      spinDTheta = Math.max(-0.018, Math.min(0.018, velTheta * 0.7))
      spinDPhi   = Math.max(-0.004, Math.min(0.004, velPhi   * 0.3))
      if (Math.abs(spinDTheta) < 0.002) spinDTheta = 0.007
      setTimeout(() => { autoSpin = true }, 1200)
    }

    dom.addEventListener('pointerdown',   onPointerDown,  { passive: false })
    dom.addEventListener('pointermove',   onPointerMove,  { passive: false })
    dom.addEventListener('pointerup',     onPointerUp)
    dom.addEventListener('pointercancel', onPointerUp)

    let raf
    let thumbnailCaptured = false
    function animate() {
      raf = requestAnimationFrame(animate)
      if (autoSpin) {
        theta += spinDTheta
        phi = Math.max(-1.3, Math.min(1.3, phi + spinDPhi))
        spinDPhi *= 0.99
      } else if (!isDragging) {
        velTheta *= 0.91; velPhi *= 0.91
        theta += velTheta
        phi = Math.max(-1.3, Math.min(1.3, phi + velPhi))
      }
      camPos()
      renderer.render(scene, camera)

      // Capture thumbnail on first frame
      if (!thumbnailCaptured && onThumbnail) {
        thumbnailCaptured = true
        // Slight delay so mesh is visible
        setTimeout(() => {
          try {
            const dataUrl = renderer.domElement.toDataURL('image/png')
            onThumbnail(dataUrl)
          } catch {}
        }, 200)
      }
    }
    animate()
    glRef.current = { renderer, mat }

    return () => {
      cancelAnimationFrame(raf)
      dom.removeEventListener('pointerdown',   onPointerDown)
      dom.removeEventListener('pointermove',   onPointerMove)
      dom.removeEventListener('pointerup',     onPointerUp)
      dom.removeEventListener('pointercancel', onPointerUp)
      renderer.dispose()
    }
  }, [buffer, boundingBox])

  return (
    <div ref={mountRef} style={{ width: '100%', height: '300px', overflow: 'hidden', background: 'rgba(10,3,3,0.75)', border: '1px solid rgba(197,160,80,0.14)', borderRadius: '1px', touchAction: 'none' }}>
      {!buffer && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-mono)', fontSize: '.64rem', color: 'rgba(232,221,216,0.18)', letterSpacing: '.12em' }}>
          3D PREVIEW
        </div>
      )}
    </div>
  )
}
