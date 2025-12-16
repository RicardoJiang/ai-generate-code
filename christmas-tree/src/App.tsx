import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import Experience from './components/Experience'
import UI from './components/UI'

function App() {
  return (
    <div className="w-full h-full bg-christmas-bg">
      <Canvas
        camera={{ position: [0, 0, 18], fov: 45 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050103']} />
        
        <Suspense fallback={null}>
          <Experience />
        </Suspense>

        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
          />
        </EffectComposer>

        <OrbitControls makeDefault enableZoom={false} enablePan={false} />
      </Canvas>
      <UI />
    </div>
  )
}

export default App

