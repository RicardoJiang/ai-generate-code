import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

const COUNT = 6000
const DECORATION_COUNT = 1000
const TREE_HEIGHT = 11
const TREE_RADIUS = 4

const leafGeometry = new THREE.OctahedronGeometry(0.1, 0)
const leafMaterial = new THREE.MeshStandardMaterial({
  color: '#FFB7C5',
  roughness: 0.4,
  metalness: 0.6,
})

const decorationGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15)
const decorationMaterial = new THREE.MeshStandardMaterial({
  color: '#FFFFFF',
  roughness: 0.1,
  metalness: 0.9,
  emissive: '#FF69B4',
  emissiveIntensity: 0.2,
})

const tempObject = new THREE.Object3D()

export const TreeParticles = () => {
  const { interactionState } = useStore()
  
  const { leavesData } = useMemo(() => {
    const data = new Float32Array(COUNT * 3 * 2) 
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 6
      const ratio = i / COUNT
      const y = ratio * TREE_HEIGHT - TREE_HEIGHT / 2
      const radius = (1 - ratio) * TREE_RADIUS
      const angle = ratio * 50 + Math.random() * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const noise = 0.5
      data[i3] = x + (Math.random() - 0.5) * noise
      data[i3 + 1] = y + (Math.random() - 0.5) * noise
      data[i3 + 2] = z + (Math.random() - 0.5) * noise
      
      const r = 10 + Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      data[i3 + 3] = r * Math.sin(phi) * Math.cos(theta)
      data[i3 + 4] = r * Math.sin(phi) * Math.sin(theta)
      data[i3 + 5] = r * Math.cos(phi)
    }
    return { leavesData: data }
  }, [])

  const { decorationData } = useMemo(() => {
    const data = new Float32Array(DECORATION_COUNT * 3 * 2)
    for (let i = 0; i < DECORATION_COUNT; i++) {
      const i3 = i * 6
      const ratio = i / DECORATION_COUNT
      const y = ratio * TREE_HEIGHT - TREE_HEIGHT / 2
      const radius = (1 - ratio) * TREE_RADIUS + 0.2
      const angle = ratio * 30 + Math.random() * Math.PI * 2
      data[i3] = Math.cos(angle) * radius
      data[i3 + 1] = y
      data[i3 + 2] = Math.sin(angle) * radius
      
      const r = 15 + Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      data[i3 + 3] = r * Math.sin(phi) * Math.cos(theta)
      data[i3 + 4] = r * Math.sin(phi) * Math.sin(theta)
      data[i3 + 5] = r * Math.cos(phi)
    }
    return { decorationData: data }
  }, [])

  const leavesMesh = useRef<THREE.InstancedMesh>(null)
  const decorationMesh = useRef<THREE.InstancedMesh>(null)
  const blendRef = useRef(0)

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const targetBlend = interactionState === 'EXPLODE' ? 1 : 0
    blendRef.current += (targetBlend - blendRef.current) * delta * 2
    const blend = blendRef.current

    if (leavesMesh.current) {
      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 6
        const x = THREE.MathUtils.lerp(leavesData[i3], leavesData[i3 + 3], blend)
        const y = THREE.MathUtils.lerp(leavesData[i3 + 1], leavesData[i3 + 4], blend)
        const z = THREE.MathUtils.lerp(leavesData[i3 + 2], leavesData[i3 + 5], blend)
        
        tempObject.position.set(x, y, z)
        tempObject.rotation.x = t * 0.2 + i
        tempObject.rotation.y = t * 0.1 + i
        const scale = 1 + Math.sin(t * 2 + i) * 0.2
        tempObject.scale.setScalar(scale)
        tempObject.updateMatrix()
        leavesMesh.current.setMatrixAt(i, tempObject.matrix)
      }
      leavesMesh.current.instanceMatrix.needsUpdate = true
    }

    if (decorationMesh.current) {
       for (let i = 0; i < DECORATION_COUNT; i++) {
        const i3 = i * 6
        const x = THREE.MathUtils.lerp(decorationData[i3], decorationData[i3 + 3], blend)
        const y = THREE.MathUtils.lerp(decorationData[i3 + 1], decorationData[i3 + 4], blend)
        const z = THREE.MathUtils.lerp(decorationData[i3 + 2], decorationData[i3 + 5], blend)
        
        tempObject.position.set(x, y, z)
        tempObject.rotation.set(t, t, t)
        tempObject.updateMatrix()
        decorationMesh.current.setMatrixAt(i, tempObject.matrix)
       }
       decorationMesh.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <>
      <instancedMesh ref={leavesMesh} args={[leafGeometry, leafMaterial, COUNT]} />
      <instancedMesh ref={decorationMesh} args={[decorationGeometry, decorationMaterial, DECORATION_COUNT]} />
    </>
  )
}
