import { type FormEvent, memo, type ReactNode } from 'react'

import { cn } from '@/utils/cn'

import { Button } from '@/components/ui/Button'

export interface FormSectionProps {
	title: string
	icon?: string
	children: ReactNode
	columns?: 1 | 2
	className?: string
}

export interface FormLayoutProps {
	sidebar?: ReactNode
	sections: FormSectionProps[]
	onSubmit: (e: FormEvent) => void
	submitButton: {
		label: string
		isSubmitting?: boolean
		icon?: string
		disabled?: boolean
	}
	formId?: string
	className?: string
}

export const FormSection = memo(
	({ title, icon, children, columns = 2, className }: FormSectionProps) => {
		return (
			<div
				className={cn(
					'bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20',
					className
				)}
			>
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
					{icon && (
						<i className={`i-material-symbols-${icon} w-5! h-5! bg-blue-600! dark:bg-blue-500!`} />
					)}
					{title}
				</h3>
				<div
					className={cn('grid gap-4', columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1')}
				>
					{children}
				</div>
			</div>
		)
	}
)

FormSection.displayName = 'FormSection'

export const FormLayout = memo(
	({ sidebar, sections, onSubmit, submitButton, formId = 'form', className }: FormLayoutProps) => {
		return (
			<div
				className={cn(
					'bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300',
					className
				)}
			>
				<form
					id={formId}
					className="p-4 sm:p-6 lg:p-8"
					onSubmit={onSubmit}
					autoComplete="off"
					noValidate
				>
					<div
						className={cn(
							'grid gap-6 lg:gap-8',
							sidebar ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
						)}
					>
						{/* Sidebar Section */}
						{sidebar && <div className="lg:col-span-1">{sidebar}</div>}

						{/* Main Content Section */}
						<div className={cn('space-y-6', sidebar ? 'lg:col-span-2' : 'lg:col-span-1')}>
							{sections.map((section, index) => (
								<FormSection key={index} {...section} />
							))}
						</div>
					</div>

					{/* Submit Button */}
					<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
						<Button
							type="submit"
							className="btn btn-primary h-12 text-lg disabled:loading flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl dark:shadow-blue-900/20 dark:hover:shadow-blue-800/30"
							disabled={submitButton.isSubmitting || submitButton.disabled}
						>
							{submitButton.isSubmitting ? (
								<>
									<i className="i-material-symbols-hourglass-empty w-6! h-6! animate-spin" />
									Loading...
								</>
							) : (
								<>
									{submitButton.icon && (
										<i className={`i-material-symbols-${submitButton.icon} w-6! h-6!`} />
									)}
									{submitButton.label}
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		)
	}
)

FormLayout.displayName = 'FormLayout'
