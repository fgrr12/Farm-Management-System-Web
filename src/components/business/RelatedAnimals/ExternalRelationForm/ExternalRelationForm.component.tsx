import {
	type ChangeEvent,
	type FormEventHandler,
	forwardRef,
	useImperativeHandle,
	useRef,
	useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import { useUserStore } from '@/store/useUserStore'

import type { RelatedAnimalInformation } from '@/pages/RelatedAnimalsForm/RelatedAnimalsForm.types'

import { Button } from '@/components/ui/Button'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { TextField } from '@/components/ui/TextField'

import { useCreateRelatedAnimal } from '@/hooks/queries/useRelatedAnimals'

import type {
	ExternalRelation,
	ExternalRelationFormProps,
	ExternalRelationFormRef,
} from './ExternalRelationForm.types'

export const ExternalRelationForm = forwardRef<ExternalRelationFormRef, ExternalRelationFormProps>(
	({ currentAnimal }, ref) => {
		const { t } = useTranslation(['externalRelationForm'])
		const [relation, setRelation] = useState<ExternalRelation>(INITIAL_RELATION)
		const { user } = useUserStore()
		const dialogRef = useRef<HTMLDialogElement>(null)

		const createRelatedAnimal = useCreateRelatedAnimal()

		useImperativeHandle(ref, () => ({
			openModal: () => {
				dialogRef.current?.showModal()
			},
		}))

		// ... (handlers)
		const handleClose = () => {
			setRelation(INITIAL_RELATION)
			dialogRef.current?.close()
		}

		const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
			const { name, value } = e.target
			setRelation({ ...relation, [name]: value })
		}

		const handleSelectChange = (name: string) => (value: string | number | null) => {
			setRelation({ ...relation, [name]: value || '' })
		}

		const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
			e.preventDefault()
			const uuid = self.crypto.randomUUID()
			if (relation.relation === 'Parent') {
				await handleAddRelatedAnimal({ ...relation, uuid }, currentAnimal)
			} else {
				await handleAddRelatedAnimal(currentAnimal, { ...relation, uuid })
			}
			handleClose()
		}

		const buildRelation = (info: RelatedAnimalInformation, isChild: boolean) => ({
			animalUuid: info.uuid,
			animalId: info.animalId,
			breed: info.breed,
			relation:
				info.gender.toLowerCase() === Gender.FEMALE
					? isChild
						? Relation.DAUGHTER
						: Relation.MOTHER
					: isChild
						? Relation.SON
						: Relation.FATHER,
		})

		const handleAddRelatedAnimal = async (
			child: RelatedAnimalInformation,
			parent: RelatedAnimalInformation
		) => {
			await createRelatedAnimal.mutateAsync({
				relation: {
					child: buildRelation(child, true),
					parent: buildRelation(parent, false),
				},
				userUuid: user!.uuid,
			})
		}

		return (
			<dialog ref={dialogRef} className="modal">
				<div className="modal-box max-w-md bg-white dark:bg-gray-800 border dark:border-gray-600">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
								<i className="i-material-symbols-add-link w-5! h-5! text-blue-600 dark:text-blue-400" />
							</div>
							<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
								{t('title')}
							</h3>
						</div>
						<button
							type="button"
							className="btn btn-sm btn-ghost btn-circle hover:bg-gray-100 dark:hover:bg-gray-700"
							onClick={handleClose}
							aria-label="Close"
						>
							<i className="i-material-symbols-close w-5! h-5! text-gray-600 dark:text-gray-400" />
						</button>
					</div>

					{/* Relation Type Selector */}
					<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
						<p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
							{t('relationTypeLabel')}
						</p>
						<div className="grid grid-cols-2 gap-2">
							<button
								type="button"
								className={`btn btn-sm ${
									relation.relation === 'Child'
										? 'btn-primary'
										: 'btn-outline btn-primary dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white'
								} flex items-center gap-2`}
								onClick={() => setRelation({ ...relation, relation: 'Child' })}
							>
								<i className="i-material-symbols-family-restroom w-4! h-4!" />
								{t('relation.parent')}
							</button>
							<button
								type="button"
								className={`btn btn-sm ${
									relation.relation === 'Parent'
										? 'btn-primary'
										: 'btn-outline btn-primary dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white'
								} flex items-center gap-2`}
								onClick={() => setRelation({ ...relation, relation: 'Parent' })}
							>
								<i className="i-material-symbols-child-care w-4! h-4!" />
								{t('relation.child')}
							</button>
						</div>
					</div>

					<form method="dialog" className="space-y-4" autoComplete="off" onSubmit={handleSubmit}>
						{/* Animal Information */}
						<div className="space-y-4">
							<TextField
								label={t('animalId')}
								name="animalId"
								value={relation.animalId}
								onChange={handleChange}
								placeholder={t('animalIdPlaceholder')}
								required
							/>
							<CustomSelect
								label={t('gender')}
								options={[
									{ value: 'Female', label: t('female') },
									{ value: 'Male', label: t('male') },
								]}
								value={relation.gender}
								onChange={handleSelectChange('gender')}
								placeholder={t('selectGender')}
								required
								clearable
								searchable={false}
							/>
							<TextField
								label={t('breed')}
								name="breed"
								value={relation.breed}
								onChange={handleChange}
								placeholder={t('breedPlaceholder')}
								required
							/>
						</div>

						{/* Relation Preview */}
						{relation.animalId && (
							<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
								<div className="flex items-center gap-2 mb-2">
									<i className="i-material-symbols-info w-4! h-4! text-blue-600 dark:text-blue-400" />
									<span className="text-sm font-medium text-blue-800 dark:text-blue-200">
										{t('relationPreview')}
									</span>
								</div>
								<p className="text-sm text-blue-700 dark:text-blue-300">
									{t('newRelationPhrase', {
										currentAnimal: currentAnimal.animalId,
										animalId: relation.animalId,
										relation:
											relation.relation === 'Parent' ? t('relation.child') : t('relation.parent'),
									})}
								</p>
							</div>
						)}

						{/* Action Buttons */}
						<div className="flex gap-3 pt-4">
							<Button
								type="submit"
								className="flex-1 btn btn-primary flex items-center gap-2"
								disabled={!relation.animalId || !relation.gender || !relation.breed}
							>
								<i className="i-material-symbols-save w-4! h-4!" />
								{t('save')}
							</Button>
							<button
								type="button"
								className="btn btn-outline btn-error dark:border-red-500 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white flex items-center gap-2 h-full"
								onClick={handleClose}
							>
								<i className="i-material-symbols-cancel w-4! h-4!" />
								{t('cancel')}
							</button>
						</div>
					</form>
				</div>
				<form method="dialog" className="modal-backdrop bg-black/30 dark:bg-black/50">
					<button type="button" onClick={handleClose} />
				</form>
			</dialog>
		)
	}
)

const INITIAL_RELATION: ExternalRelation = {
	animalId: '',
	breed: '',
	gender: '',
	relation: 'Child',
}

enum Relation {
	MOTHER = 'Mother',
	FATHER = 'Father',
	SON = 'Son',
	DAUGHTER = 'Daughter',
}

enum Gender {
	FEMALE = 'female',
	MALE = 'male',
}
