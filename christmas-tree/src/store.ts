import { create } from 'zustand'

export type InteractionState = 'TREE' | 'EXPLODE'

interface AppState {
  interactionState: InteractionState
  toggleInteractionState: () => void
  setInteractionState: (state: InteractionState) => void
  
  // Hand tracking state
  isHandDetected: boolean
  setHandDetected: (detected: boolean) => void
  handPosition: { x: number, y: number } // Normalized 0-1
  setHandPosition: (pos: { x: number, y: number }) => void
  handRotation: number // Rotation derived from hand movement
  setHandRotation: (rotation: number) => void
}

export const useStore = create<AppState>((set) => ({
  interactionState: 'TREE',
  toggleInteractionState: () => set((state) => ({ 
    interactionState: state.interactionState === 'TREE' ? 'EXPLODE' : 'TREE' 
  })),
  setInteractionState: (state) => set({ interactionState: state }),

  isHandDetected: false,
  setHandDetected: (detected) => set({ isHandDetected: detected }),
  handPosition: { x: 0.5, y: 0.5 },
  setHandPosition: (pos) => set({ handPosition: pos }),
  handRotation: 0,
  setHandRotation: (rotation) => set({ handRotation: rotation }),
}))

