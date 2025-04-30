import type { RelatedAnimalInformation } from '@/pages/RelatedAnimalsForm/RelatedAnimalsForm.types'
import type { HTMLAttributes } from 'react'

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
	title: string
	location: number
	animals: RelatedAnimalInformation[]
}
