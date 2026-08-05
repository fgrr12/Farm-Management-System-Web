import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { VoiceQueueStore } from './useVoiceQueue.types'

export const useVoiceQueueStore = create<VoiceQueueStore>()(
	persist(
		(set) => ({
			pending: [],
			ready: [],
			enqueuePending: (recording) =>
				set((state) => ({
					pending: [
						...state.pending,
						{ ...recording, id: crypto.randomUUID(), createdAt: Date.now() },
					],
				})),
			dequeuePending: (id) =>
				set((state) => ({ pending: state.pending.filter((r) => r.id !== id) })),
			enqueueReady: (command) =>
				set((state) => ({
					ready: [...state.ready, { ...command, id: crypto.randomUUID(), createdAt: Date.now() }],
				})),
			dequeueReady: (id) => set((state) => ({ ready: state.ready.filter((c) => c.id !== id) })),
		}),
		{
			name: 'voice-queue-storage',
			storage: createJSONStorage(() => localStorage),
		}
	)
)
