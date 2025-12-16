import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'

const UI = () => {
  const {
    interactionState,
    toggleInteractionState,
    setInteractionState,
    setHandPosition,
    setHandDetected,
    setHandRotation
  } = useStore()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const handLandmarkerRef = useRef<HandLandmarker | null>(null)
  const lastVideoTimeRef = useRef(-1)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
        )
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        })
        
        setLoading(false)
        startWebcam()
      } catch (err) {
        console.error(err)
        setError("Failed to load MediaPipe")
        setLoading(false)
      }
    }

    initMediaPipe()

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  const startWebcam = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 }
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.addEventListener('loadeddata', predictWebcam)
        }
      } catch (err) {
        setError("Camera access denied")
      }
    }
  }

  const predictWebcam = () => {
    if (!handLandmarkerRef.current || !videoRef.current || !canvasRef.current) return

    let startTimeMs = performance.now()
    if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = videoRef.current.currentTime
      const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs)
      
      const canvasCtx = canvasRef.current.getContext('2d')
      if (canvasCtx) {
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        
        if (results.landmarks && results.landmarks.length > 0) {
          setHandDetected(true)
          const landmarks = results.landmarks[0]
          
          // Draw landmarks
          canvasCtx.fillStyle = '#FF69B4'
          for (const point of landmarks) {
             canvasCtx.beginPath()
             canvasCtx.arc(point.x * canvasRef.current.width, point.y * canvasRef.current.height, 2, 0, 2 * Math.PI)
             canvasCtx.fill()
          }

          // Logic
          // 1. Detect Pinch (Thumb tip 4 vs Index tip 8)
          const thumbTip = landmarks[4]
          const indexTip = landmarks[8]
          const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2)
          )

          // Threshold for pinch (normalized coords)
          if (distance < 0.05) {
             // Pinch/Grab -> TREE
             setInteractionState('TREE')
          } else if (distance > 0.1) {
             // Open -> EXPLODE
             setInteractionState('EXPLODE')
          }
          
          // 2. Hand Position (Centroid or wrist)
          const wrist = landmarks[0]
          setHandPosition({ x: wrist.x, y: wrist.y })
          
          // 3. Rotation (based on x position for now, as requested "hand moves left/right")
          // Map 0-1 to -PI to PI
          const rotation = (wrist.x - 0.5) * Math.PI * 2
          setHandRotation(rotation)

        } else {
          setHandDetected(false)
        }
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(predictWebcam)
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8">
      <div className="text-christmas-pink font-bold text-xl drop-shadow-[0_0_10px_rgba(255,105,180,0.8)] select-none">
        Christmas Tree 3D
      </div>
      
      <div className="self-end pointer-events-auto flex flex-col gap-2 items-end">
        <button 
          className="bg-christmas-pink/20 backdrop-blur-md border border-christmas-pink text-white px-4 py-2 rounded hover:bg-christmas-pink/40 transition-colors"
          onClick={toggleInteractionState}
        >
          {interactionState} Mode
        </button>
        {loading && <div className="text-white text-xs">Loading AI...</div>}
        {error && <div className="text-red-500 text-xs">{error}</div>}
      </div>

      {/* MediaPipe Preview */}
      <div className="absolute bottom-4 right-4 w-48 h-36 bg-black/50 border border-christmas-pink/30 rounded overflow-hidden pointer-events-auto relative">
         <video 
           ref={videoRef} 
           autoPlay 
           playsInline 
           muted
           className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
         />
         <canvas 
           ref={canvasRef}
           width={320}
           height={240}
           className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
         />
         {!loading && !error && (
            <div className="absolute top-1 left-1 text-[10px] text-white/70">
              Hand Tracking Active
            </div>
         )}
      </div>
      
      {/* Custom Cursor (Optional, based on hand position) */}
      <HandCursor />
    </div>
  )
}

const HandCursor = () => {
  const { isHandDetected, handPosition } = useStore()
  
  if (!isHandDetected) return null

  return (
    <div 
      className="fixed w-6 h-6 border-2 border-christmas-pink rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out shadow-[0_0_10px_#FF69B4]"
      style={{ 
        left: `${(1 - handPosition.x) * 100}%`, // Mirror effect
        top: `${handPosition.y * 100}%` 
      }}
    />
  )
}

export default UI
