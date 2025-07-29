import type { HTMLAttributes } from 'react'

export interface AnimalCardProps extends HTMLAttributes<HTMLDivElement> {
	animal: Animal & { breedName: string }
	healthStatus?: 'healthy' | 'sick' | 'treatment' | 'unknown'
	lastHealthCheck?: string
	productionStatus?: 'active' | 'inactive' | 'pregnant'
	age?: number
	weight?: number
	notes?: string
	variant?: 'default' | 'compact' | 'detailed'
}

// Legacy support
export type CardProps = AnimalCardProps
