// src/pages/Animals/Animals.test.tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { Animals } from '../Animals'

// Mocks centralizados
vi.mock('@/store/useUserStore', () =>
	import('@/tests/__mocks__/stores').then((m) => m.mockUserStore)
)
vi.mock('@/store/useFarmStore', () =>
	import('@/tests/__mocks__/stores').then((m) => m.mockFarmStore)
)
vi.mock('@/store/useAppStore', () => import('@/tests/__mocks__/stores').then((m) => m.mockAppStore))
vi.mock('@/services/animals', () =>
	import('@/tests/__mocks__/services').then((m) => m.mockAnimalsService)
)

describe('Animals', () => {
	it('renders page and shows "no animals" message', async () => {
		render(
			<MemoryRouter>
				<Animals />
			</MemoryRouter>
		)

		expect(await screen.findByText(/no animals/i)).toBeInTheDocument()
	})
})
