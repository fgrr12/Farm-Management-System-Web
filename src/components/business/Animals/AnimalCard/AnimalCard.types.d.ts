import type { HTMLAttributes } from 'react'

export interface AnimalCardProps extends HTMLAttributes<HTMLDivElement> {
	uuid: string
	animalId: string
	breedName: string
	gender: Gender
	healthStatus?: 'healthy' | 'sick' | 'treatment' | 'unknown'
	lastHealthCheck?: string
	productionStatus?: 'active' | 'inactive' | 'pregnant'
	age?: number
	weight?: number
	notes?: string
	imageUrl?: string
	variant?: 'default' | 'compact' | 'detailed'
}

// Legacy support
export type CardProps = AnimalCardProps
