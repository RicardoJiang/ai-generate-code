import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { Sparkles } from '@react-three/drei'

export const Star = () => {
  const { interactionState } = useStore()
  const meshRef = useRef<THREE.Mesh>(null)
  
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    const points = 5
    const outerRadius = 0.5
    const innerRadius = 0.2
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (i === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    }
    s.closePath()
    return s
  }, [])

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1
      
      const targetY = interactionState === 'TREE' ? 6.0 : 9.5 // Adjusted for new tree height (11/2 + 0.5)
      meshRef.current.position.y += (targetY - meshRef.current.position.y) * delta * 2
    }
  })

  const extrudeSettings = {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2
  }

  return (
    <group>
      <mesh ref={meshRef} position={[0, 6.0, 0]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FFD700"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      
      {/* Dynamic Sparkles around the star */}
      <Sparkles 
        position={[0, 6.0, 0]} 
        scale={2} 
        count={50} 
        speed={2} 
        opacity={1} 
        color="#FFF"
        size={2}
      />
    </group>
  )
}

