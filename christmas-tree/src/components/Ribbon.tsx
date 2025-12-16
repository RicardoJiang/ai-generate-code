import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

const COUNT = 300
const TURNS = 3
const HEIGHT = 11
const RADIUS_BASE = 4.2 // Slightly larger than tree

const geometry = new THREE.TetrahedronGeometry(0.05)
const material = new THREE.MeshBasicMaterial({ color: '#FFFFFF' })
const tempObject = new THREE.Object3D()

export const Ribbon = () => {
  const { interactionState } = useStore()
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const blendRef = useRef(0)

  const positions = useMemo(() => {
    const data = new Float32Array(COUNT * 3 * 2) // Tree, Explode
    
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 6
      const ratio = i / COUNT
      
      // Tree: Spiral
      const y = ratio * HEIGHT - HEIGHT / 2
      const r = (1 - ratio) * RADIUS_BASE
      const angle = ratio * Math.PI * 2 * TURNS
      
      data[i3] = Math.cos(angle) * r
      data[i3 + 1] = y
      data[i3 + 2] = Math.sin(angle) * r
      
      // Explode: Chaos line or expanded spiral
      // Let's make it expand outward
      const rExp = r * 3 + 5
      data[i3 + 3] = Math.cos(angle) * rExp
      data[i3 + 4] = y * 0.5 // flatten a bit
      data[i3 + 5] = Math.sin(angle) * rExp
    }
    return data
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const targetBlend = interactionState === 'EXPLODE' ? 1 : 0
    blendRef.current += (targetBlend - blendRef.current) * delta * 2
    const blend = blendRef.current

    if (meshRef.current) {
      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 6
        
        const x = THREE.MathUtils.lerp(positions[i3], positions[i3 + 3], blend)
        const y = THREE.MathUtils.lerp(positions[i3 + 1], positions[i3 + 4], blend)
        const z = THREE.MathUtils.lerp(positions[i3 + 2], positions[i3 + 5], blend)
        
        tempObject.position.set(x, y, z)
        // Rotate individual tetrahedrons
        tempObject.rotation.set(t + i, t + i, 0)
        tempObject.updateMatrix()
        meshRef.current.setMatrixAt(i, tempObject.matrix)
      }
      meshRef.current.instanceMatrix.needsUpdate = true
      
      // Rotate the whole ribbon
      meshRef.current.rotation.y = t * 0.2
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, COUNT]} />
  )
}

