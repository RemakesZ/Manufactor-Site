// ─────────────────────────────────────────────────────────────────────────────
// STL PARSER
// Returns volume in mm³.
//
// Problem with thin-walled / shell meshes:
// The divergence theorem gives SIGNED volume, which works perfectly for
// solid meshes. For hollow or thin-walled shells (electronics boxes, vases)
// the interior faces partially cancel out the exterior, producing a wildly
// low or near-zero result — which then gets multiplied by big layer/infill
// factors and either produces €0 (hits MIN_ORDER) or sometimes a huge
// number if the geometry has inverted normals summing the wrong way.
//
// Fix: after computing signed volume, cross-check against the
// axis-aligned bounding box volume. If the mesh volume is less than 2% of
// the bounding box, the mesh is almost certainly a shell — fall back to
// estimating volume as (surface_area × typical wall thickness of 1.2mm).
// ─────────────────────────────────────────────────────────────────────────────

export function parseSTL(buffer) {
  // Returns { volumeMm3, surfaceAreaMm2, boundingBox: {x,y,z}, triCount }
  try {
    const view = new DataView(buffer)
    const triCount = view.getUint32(80, true)
    if (buffer.byteLength !== 84 + triCount * 50 || triCount === 0) {
      return asciiSTLVolume(buffer)
    }

    let signedVol = 0
    let surfaceArea = 0
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    let minZ = Infinity, maxZ = -Infinity

    for (let i = 0; i < triCount; i++) {
      const b = 84 + i * 50
      const v1x = view.getFloat32(b + 12, true), v1y = view.getFloat32(b + 16, true), v1z = view.getFloat32(b + 20, true)
      const v2x = view.getFloat32(b + 24, true), v2y = view.getFloat32(b + 28, true), v2z = view.getFloat32(b + 32, true)
      const v3x = view.getFloat32(b + 36, true), v3y = view.getFloat32(b + 40, true), v3z = view.getFloat32(b + 44, true)

      // Signed volume contribution (divergence theorem)
      signedVol += v1x * (v2y * v3z - v3y * v2z)
                 - v1y * (v2x * v3z - v3x * v2z)
                 + v1z * (v2x * v3y - v3x * v2y)

      // Surface area of this triangle
      const ax = v2x - v1x, ay = v2y - v1y, az = v2z - v1z
      const bx = v3x - v1x, by = v3y - v1y, bz = v3z - v1z
      const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx
      surfaceArea += Math.sqrt(cx * cx + cy * cy + cz * cz) * 0.5

      // Bounding box
      minX = Math.min(minX, v1x, v2x, v3x); maxX = Math.max(maxX, v1x, v2x, v3x)
      minY = Math.min(minY, v1y, v2y, v3y); maxY = Math.max(maxY, v1y, v2y, v3y)
      minZ = Math.min(minZ, v1z, v2z, v3z); maxZ = Math.max(maxZ, v1z, v2z, v3z)
    }

    const meshVolume = Math.abs(signedVol) / 6
    const bbX = maxX - minX, bbY = maxY - minY, bbZ = maxZ - minZ
    const bbVolume = bbX * bbY * bbZ

    // Shell detection: if mesh volume < 2% of bounding box, treat as shell
    // Estimate real printed volume as surface area × assumed wall thickness
    const WALL_THICKNESS_MM = 1.4  // typical 2-perimeter wall
    const isShell = bbVolume > 0 && (meshVolume / bbVolume) < 0.02
    const volumeMm3 = isShell
      ? surfaceArea * WALL_THICKNESS_MM
      : meshVolume

    return {
      volumeMm3,
      surfaceAreaMm2: surfaceArea,
      boundingBox: { x: bbX, y: bbY, z: bbZ },
      triCount,
      isShell,
    }
  } catch {
    return { volumeMm3: 8000, surfaceAreaMm2: 0, boundingBox: { x: 50, y: 50, z: 50 }, triCount: 0, isShell: false }
  }
}

function asciiSTLVolume(buffer) {
  const text = new TextDecoder().decode(buffer)
  const matches = text.match(/facet normal/g)
  const triCount = matches ? matches.length : 100
  return { volumeMm3: triCount * 800, surfaceAreaMm2: triCount * 50, boundingBox: { x: 50, y: 50, z: 50 }, triCount, isShell: false }
}

// ─────────────────────────────────────────────────────────────────────────────
// Build Three.js BufferGeometry from binary STL buffer
// ─────────────────────────────────────────────────────────────────────────────
export function buildGeometry(buffer, THREE) {
  const geom = new THREE.BufferGeometry()
  try {
    const view = new DataView(buffer)
    const triCount = view.getUint32(80, true)
    if (triCount > 0 && buffer.byteLength === 84 + triCount * 50) {
      const pos = new Float32Array(triCount * 9)
      for (let i = 0; i < triCount; i++) {
        const b = 84 + i * 50
        for (let v = 0; v < 3; v++) {
          const vb = b + 12 + v * 12
          pos[i * 9 + v * 3]     = view.getFloat32(vb,     true)
          pos[i * 9 + v * 3 + 1] = view.getFloat32(vb + 4, true)
          pos[i * 9 + v * 3 + 2] = view.getFloat32(vb + 8, true)
        }
      }
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    }
  } catch {}
  geom.computeVertexNormals()
  geom.center()
  return geom
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-orient: rotate mesh so its longest dimension is vertical (Z up)
// Uses the actual bounding box from parseSTL.
// ─────────────────────────────────────────────────────────────────────────────
export function autoOrient(mesh, bb) {
  const { x, y, z } = bb
  // Find which axis is tallest and make it Y (Three.js up)
  if (x >= y && x >= z) {
    // X is longest → rotate so X becomes Y
    mesh.rotation.z = Math.PI / 2
  } else if (z >= y && z >= x) {
    // Z is longest → rotate so Z becomes Y
    mesh.rotation.x = Math.PI / 2
  }
  // Y already longest → no rotation needed
}
