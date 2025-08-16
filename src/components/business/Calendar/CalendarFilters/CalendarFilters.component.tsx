import { memo } from 'react'
import { useTranslation } from 'react-i18next'

interface CalendarFiltersProps {
	selectedCategories: string[]
	onCategoriesChange: (categories: string[]) => void
}

export const CalendarFilters = memo<CalendarFiltersProps>(
	({ selectedCategories, onCategoriesChange }) => {
		const { t } = useTranslation(['calendar'])

		const categories = [
			{ id: 'all', label: t('categories.all'), color: 'bg-gray-100 text-gray-800' },
			{ id: 'medication', label: t('categories.medication'), color: 'bg-red-100 text-red-800' },
			{ id: 'checkup', label: t('categories.health'), color: 'bg-yellow-100 text-yellow-800' },
			{ id: 'task', label: t('categories.task'), color: 'bg-blue-100 text-blue-800' },
			{ id: 'birth', label: t('categories.breeding'), color: 'bg-pink-100 text-pink-800' },
			{ id: 'drying', label: t('categories.drying'), color: 'bg-purple-100 text-purple-800' },
			{ id: 'custom', label: t('categories.custom'), color: 'bg-indigo-100 text-indigo-800' },
			// { id: 'general', label: t('categories.feeding'), color: 'bg-green-100 text-green-800' },
		]

		const handleCategoryToggle = (categoryId: string) => {
			if (categoryId === 'all') {
				onCategoriesChange(['all'])
				return
			}

			let newCategories = [...selectedCategories]

			// Remover 'all' si está seleccionado
			if (newCategories.includes('all')) {
				newCategories = newCategories.filter((id) => id !== 'all')
			}

			if (newCategories.includes(categoryId)) {
				newCategories = newCategories.filter((id) => id !== categoryId)
			} else {
				newCategories.push(categoryId)
			}

			// Si no hay categorías seleccionadas, seleccionar 'all'
			if (newCategories.length === 0) {
				newCategories = ['all']
			}

			onCategoriesChange(newCategories)
		}

		return (
			<div className="flex flex-wrap gap-2">
				<span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
					{t('filters.categories')}:
				</span>
				{categories.map((category) => {
					const isSelected = selectedCategories.includes(category.id)

					return (
						<button
							key={category.id}
							type="button"
							onClick={() => handleCategoryToggle(category.id)}
							className={`
							px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200
							${
								isSelected
									? `${category.color} border-current shadow-sm`
									: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
							}
						`}
						>
							{category.label}
						</button>
					)
				})}
			</div>
		)
	}
)
