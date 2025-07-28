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
			const baseClasses = 'w-full min-h-24 transition-all duration-200 focus:outline-none'

			const variantClasses = {
				default:
					'textarea bg-white border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
				filled:
					'bg-gray-100 border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:bg-white rounded-t-lg rounded-b-none px-4 py-3',
				outlined:
					'bg-transparent border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3',
			}

			const resizeClasses = {
				none: 'resize-none',
				vertical: 'resize-y',
				horizontal: 'resize-x',
				both: 'resize',
			}

			const stateClasses = error
				? 'border-red-500 focus:border-red-500 focus:ring-red-200'
				: success
					? 'border-green-500 focus:border-green-500 focus:ring-green-200'
					: ''

			return `${baseClasses} ${variantClasses[variant]} ${resizeClasses[resize]} ${stateClasses} ${className || ''}`
		}, [variant, resize, error, success, className])

		const labelClasses = useMemo(() => {
			const baseClasses = 'block text-sm font-medium mb-2 transition-colors duration-200'
			const stateClasses = error
				? 'text-red-700'
				: success
					? 'text-green-700'
					: isFocused
						? 'text-blue-700'
						: 'text-gray-700'

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

		return (
			<div className="w-full">
				{label && (
					<label htmlFor={fieldId} className={labelClasses}>
						{label}
						{required && <span className="text-red-500 ml-1">*</span>}
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
						<div className="absolute top-3 right-3">
							{loading ? (
								<div className="animate-spin">
									<i className="i-material-symbols-progress-activity w-5! h-5! bg-blue-500!" />
								</div>
							) : error ? (
								<i className="i-material-symbols-error w-5! h-5! bg-red-500!" title={error} />
							) : success ? (
								<i className="i-material-symbols-check-circle w-5! h-5! bg-green-500!" />
							) : null}
						</div>
					)}

					{/* Error Tooltip */}
					{error && (
						<div
							id={`${fieldId}-error`}
							className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-30 max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 ease-in-out"
							role="tooltip"
							aria-live="polite"
						>
							<div className="text-sm text-red-700 font-medium">{error}</div>
							<div className="absolute -top-2 left-4 w-4 h-4 bg-red-50 border-l border-t border-red-200 transform rotate-45" />
						</div>
					)}
				</div>

				{/* Footer with character count and helper text */}
				<div className="flex justify-between items-start mt-1">
					<div className="flex-1">
						{/* Helper Text */}
						{helperText && !error && (
							<div id={`${fieldId}-helper`} className="text-sm text-gray-600">
								{helperText}
							</div>
						)}

						{/* Success Message */}
						{success && successMessage && (
							<div
								id={`${fieldId}-success`}
								className="text-sm text-green-600 flex items-center gap-1"
							>
								<i className="i-material-symbols-check-circle w-4! h-4! bg-green-500!" />
								<span>{successMessage}</span>
							</div>
						)}
					</div>

					{/* Character Count */}
					{(showCharCount || maxLength) && (
						<div
							className={`text-xs font-medium ml-2 ${
								isOverLimit
									? 'text-red-600'
									: maxLength && charCount > maxLength * 0.8
										? 'text-yellow-600'
										: 'text-gray-500'
							}`}
						>
							{maxLength ? `${charCount}/${maxLength}` : charCount}
						</div>
					)}
				</div>
			</div>
		)
	}
)
