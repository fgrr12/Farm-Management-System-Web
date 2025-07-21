import type { ChangeEvent } from 'react'
import { useCallback } from 'react'

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter'

export const useFormTransforms = (register: Function, setValue: Function) => {
	const registerWithTransform = useCallback(
		(fieldName: string, transform?: (value: string) => any) => {
			const baseRegister = register(fieldName)

			if (!transform) return baseRegister

			return {
				...baseRegister,
				onChange: (e: ChangeEvent<HTMLInputElement>) => {
					const transformedValue = transform(e.target.value)
					setValue(fieldName, transformedValue)
				},
			}
		},
		[register, setValue]
	)

	const registerCapitalized = useCallback(
		(fieldName: string) => registerWithTransform(fieldName, capitalizeFirstLetter),
		[registerWithTransform]
	)

	const registerNumber = useCallback(
		(fieldName: string) =>
			registerWithTransform(fieldName, (val) => {
				const num = Number.parseFloat(val)
				return Number.isNaN(num) ? undefined : num
			}),
		[registerWithTransform]
	)

	const registerTextareaCapitalized = useCallback(
		(fieldName: string) => {
			const baseRegister = register(fieldName)

			return {
				...baseRegister,
				onChange: (e: ChangeEvent<HTMLTextAreaElement>) => {
					const transformedValue = capitalizeFirstLetter(e.target.value)
					setValue(fieldName, transformedValue)
				},
			}
		},
		[register, setValue]
	)

	return {
		registerWithTransform,
		registerCapitalized,
		registerNumber,
		registerTextareaCapitalized,
	}
}
