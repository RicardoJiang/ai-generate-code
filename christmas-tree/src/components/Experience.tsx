import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import * as THREE from 'three'
import { TreeParticles } from './TreeParticles'
import { Star } from './Star'
import { Ribbon } from './Ribbon'

const Experience = () => {
  const { isHandDetected, handRotation } = useStore()
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_state, delta) => {
    if (groupRef.current) {
      if (isHandDetected) {
        // Control rotation with hand
        // handRotation is roughly -PI to PI based on screen width
        // We want to interpolate to this rotation
        // We might want to keep the current rotation as base and add hand offset, 
        // but simple absolute mapping is easier to understand:
        // Left screen = rotate left, Right screen = rotate right.
        
        // Use a lerp for smooth follow
        const targetRotation = handRotation * 2 // Amplify effect
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, delta * 5)
      } else {
         // Auto rotate
         groupRef.current.rotation.y += delta * 0.1
      }
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 5, 0]} intensity={2} color="#FF69B4" distance={10} decay={2} />
      
      <group ref={groupRef}>
        <TreeParticles />
        <Star />
        <Ribbon />
      </group>
    </>
  )
}

export default Experience
