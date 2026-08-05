import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { OfflineQueueStore } from './useOfflineQueue.types'

export const useOfflineQueueStore = create<OfflineQueueStore>()(
	persist(
		(set) => ({
			queue: [],
			enqueue: (kind, payload) =>
				set((state) => ({
					queue: [
						...state.queue,
						{ id: crypto.randomUUID(), kind, payload, createdAt: Date.now(), retries: 0 },
					],
				})),
			dequeue: (id) => set((state) => ({ queue: state.queue.filter((item) => item.id !== id) })),
			bumpRetry: (id) =>
				set((state) => ({
					queue: state.queue.map((item) =>
						item.id === id ? { ...item, retries: item.retries + 1 } : item
					),
				})),
		}),
		{
			name: 'offline-queue-storage',
			storage: createJSONStorage(() => localStorage),
		}
	)
)
