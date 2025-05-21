import type { HTMLAttributes } from 'react'
import type { RelatedAnimalInformation } from '@/pages/RelatedAnimalsForm/RelatedAnimalsForm.types'

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
	title: string
	location: number
	animals: RelatedAnimalInformation[]
}
