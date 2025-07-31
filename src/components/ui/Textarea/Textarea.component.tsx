import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type { FC } from 'react'
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import type { TextareaProps } from './Textarea.types'

export const Textarea: FC<TextareaProps> = memo(
	({
		label,
		error,
		helperText,
		variant = 'default',
		resize = 'vertical',
		autoResize = false,
		maxLength,
		showCharCount = false,
		success = false,
		successMessage,
		loading = false,
		required,
		value,
		className,
		...rest
	}) => {
		const fieldId = useId()
		const textareaRef = useRef<HTMLTextAreaElement>(null)
		const [isFocused, setIsFocused] = useState(false)
		const [charCount, setCharCount] = useState(0)

		const textareaClasses = useMemo(() => {
			const baseClasses =
				'w-full min-h-24 transition-all duration-200 focus:outline-none rounded-lg'

			const variantClasses = {
				default:
					'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 py-3',
				filled:
					'bg-gray-100 dark:bg-gray-700 border-0 border-b-2 border-gray-300 dark:border-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-600 rounded-t-lg rounded-b-none text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 py-3',
				outlined:
					'bg-transparent border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 py-3',
			}

			const resizeClasses = {
				none: 'resize-none',
				vertical: 'resize-y',
				horizontal: 'resize-x',
				both: 'resize',
			}

			const stateClasses = error
				? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-500/20'
				: success
					? 'border-green-500 dark:border-green-400 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-200 dark:focus:ring-green-500/20'
					: ''

			return `${baseClasses} ${variantClasses[variant]} ${resizeClasses[resize]} ${stateClasses} ${className || ''}`
		}, [variant, resize, error, success, className])

		const labelClasses = useMemo(() => {
			const baseClasses = 'block text-sm font-medium mb-2 transition-colors duration-200'
			const stateClasses = error
				? 'text-red-700 dark:text-red-400'
				: success
					? 'text-green-700 dark:text-green-400'
					: isFocused
						? 'text-blue-700 dark:text-blue-400'
						: 'text-gray-700 dark:text-gray-300'

			return `${baseClasses} ${stateClasses}`
		}, [error, success, isFocused])

		const adjustHeight = useCallback(() => {
			if (autoResize && textareaRef.current) {
				const textarea = textareaRef.current
				textarea.style.height = 'auto'
				textarea.style.height = `${textarea.scrollHeight}px`
			}
		}, [autoResize])

		useGSAP(() => {
			if (textareaRef.current) {
				gsap.fromTo(
					textareaRef.current,
					{ y: 10, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
				)
			}
		}, [])

		const handleFocus = useCallback(
			(e: React.FocusEvent<HTMLTextAreaElement>) => {
				setIsFocused(true)
				if (textareaRef.current) {
					gsap.to(textareaRef.current, { scale: 1.01, duration: 0.2, ease: 'power1.out' })
				}
				rest.onFocus?.(e)
			},
			[rest.onFocus]
		)

		const handleBlur = useCallback(
			(e: React.FocusEvent<HTMLTextAreaElement>) => {
				setIsFocused(false)
				if (textareaRef.current) {
					gsap.to(textareaRef.current, { scale: 1, duration: 0.2, ease: 'power1.out' })
				}
				rest.onBlur?.(e)
			},
			[rest.onBlur]
		)

		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLTextAreaElement>) => {
				const newValue = e.target.value
				setCharCount(newValue.length)

				if (autoResize) {
					adjustHeight()
				}

				rest.onChange?.(e)
			},
			[rest.onChange, autoResize, adjustHeight]
		)

		// Initialize character count
		useEffect(() => {
			const initialValue = value?.toString() || ''
			setCharCount(initialValue.length)
		}, [value])

		// Auto-resize on mount if needed
		useEffect(() => {
			if (autoResize) {
				adjustHeight()
			}
		}, [autoResize, adjustHeight])

		const isOverLimit = maxLength ? charCount > maxLength : false
		const isNearLimit = maxLength ? charCount > maxLength * 0.8 : false

		return (
			<div className="w-full">
				{label && (
					<label htmlFor={fieldId} className={labelClasses}>
						{label}
						{required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
					</label>
				)}

				<div className="relative group">
					{/* Textarea Field */}
					<textarea
						ref={textareaRef}
						id={fieldId}
						className={textareaClasses}
						required={required}
						disabled={loading}
						maxLength={maxLength}
						value={value}
						aria-invalid={!!error}
						aria-describedby={
							error
								? `${fieldId}-error`
								: helperText
									? `${fieldId}-helper`
									: success
										? `${fieldId}-success`
										: undefined
						}
						onFocus={handleFocus}
						onBlur={handleBlur}
						onChange={handleChange}
						{...rest}
					/>

					{/* Status Icon */}
					{(loading || error || success) && (
						<div className="absolute top-3 right-3 z-10">
							{loading ? (
								<div className="animate-spin">
									<i className="i-material-symbols-progress-activity w-5! h-5! bg-blue-500! dark:bg-blue-400!" />
								</div>
							) : error ? (
								<i
									className="i-material-symbols-error w-5! h-5! bg-red-500! dark:bg-red-400!"
									title={error}
								/>
							) : success ? (
								<i className="i-material-symbols-check-circle w-5! h-5! bg-green-500! dark:bg-green-400!" />
							) : null}
						</div>
					)}

					{/* Error Tooltip */}
					{error && (
						<div
							id={`${fieldId}-error`}
							className="absolute top-full left-0 mt-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg shadow-lg dark:shadow-red-900/20 z-30 max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 ease-in-out backdrop-blur-sm"
							role="tooltip"
							aria-live="polite"
						>
							<div className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</div>
							<div className="absolute -top-2 left-4 w-4 h-4 bg-red-50 dark:bg-red-900/30 border-l border-t border-red-200 dark:border-red-700 transform rotate-45" />
						</div>
					)}

					{/* Loading Overlay */}
					{loading && (
						<div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center backdrop-blur-sm">
							<div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
								<div className="animate-spin">
									<i className="i-material-symbols-progress-activity w-5! h-5! bg-current!" />
								</div>
								<span className="text-sm font-medium">Loading...</span>
							</div>
						</div>
					)}
				</div>

				{/* Footer with character count and helper text */}
				<div className="flex justify-between items-start mt-2 gap-2">
					<div className="flex-1 min-w-0">
						{/* Helper Text */}
						{helperText && !error && (
							<div id={`${fieldId}-helper`} className="text-sm text-gray-600 dark:text-gray-400">
								{helperText}
							</div>
						)}

						{/* Success Message */}
						{success && successMessage && (
							<div
								id={`${fieldId}-success`}
								className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"
							>
								<i className="i-material-symbols-check-circle w-4! h-4! bg-green-500! dark:bg-green-400!" />
								<span>{successMessage}</span>
							</div>
						)}
					</div>

					{/* Character Count */}
					{(showCharCount || maxLength) && (
						<div className="flex-shrink-0">
							<div
								className={`text-xs font-medium px-2 py-1 rounded-full transition-colors duration-200 ${
									isOverLimit
										? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
										: isNearLimit
											? 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
											: 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50'
								}`}
							>
								{maxLength ? `${charCount}/${maxLength}` : charCount}
								{maxLength && (
									<span className="ml-1 text-xs opacity-70">
										{isOverLimit ? '⚠️' : isNearLimit ? '⚡' : '✓'}
									</span>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Character limit warning */}
				{maxLength && isOverLimit && (
					<div className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
						<i className="i-material-symbols-warning w-3! h-3! bg-red-500! dark:bg-red-400!" />
						<span>Character limit exceeded by {charCount - maxLength}</span>
					</div>
				)}
			</div>
		)
	}
)
