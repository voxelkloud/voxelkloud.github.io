'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 2600

/** Honours the OS motion setting; the scene is decorative, so it just stops. */
function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function CloudField({ animate }: { animate: boolean }) {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const bright = new THREE.Color('#c4f04d')
    const dim = new THREE.Color('#718c2e')
    const color = new THREE.Color()

    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT
      const angle = t * Math.PI * 18 + Math.sin(i * 0.13) * 0.45
      const radius = Math.sqrt(t) * 3.5
      const noise = Math.sin(i * 2.7) * 0.12 + Math.cos(i * 0.37) * 0.08
      positions[i * 3] = Math.cos(angle) * radius + noise
      positions[i * 3 + 1] = Math.sin(t * Math.PI * 5) * 0.65 + Math.sin(angle * 0.7) * 0.25 + noise
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.46 + Math.cos(i * 0.2) * 0.1
      color.copy(bright).lerp(dim, Math.min(1, radius / 4.3))
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return { positions, colors }
  }, [])

  useFrame((state, delta) => {
    if (!pointsRef.current || !animate) return
    pointsRef.current.rotation.y += delta * 0.055
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.08
  })

  return (
    <points ref={pointsRef} rotation={[0.2, -0.3, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/**
 * The hero backdrop. Decorative only — the wrapper is aria-hidden and does not
 * take pointer events, so there are no controls to attach.
 */
export function PointCloudScene() {
  const reduced = prefersReducedMotion()

  return (
    <div className="point-cloud-scene">
      <Canvas
        camera={{ position: [0, 1.1, 8.6], fov: 38 }}
        dpr={[1, 1.5]}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ antialias: true, alpha: true }}
      >
        <CloudField animate={!reduced} />
      </Canvas>
    </div>
  )
}
