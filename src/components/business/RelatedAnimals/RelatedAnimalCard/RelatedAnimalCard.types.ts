import type { HTMLAttributes } from 'react'

import type { RelatedAnimalInformation } from '@/pages/RelatedAnimalsForm/RelatedAnimalsForm.types'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
	animal: RelatedAnimalInformation
}
