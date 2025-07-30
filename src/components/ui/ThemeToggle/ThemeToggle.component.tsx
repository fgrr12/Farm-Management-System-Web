import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '@/hooks/useTheme'

const ThemeToggle = () => {
	const { theme, resolvedTheme, toggleTheme } = useTheme()
	const { t } = useTranslation(['common'])

	const getIcon = () => {
		if (theme === 'system') {
			return 'i-material-symbols-computer'
		}
		return resolvedTheme === 'dark'
			? 'i-material-symbols-dark-mode'
			: 'i-material-symbols-light-mode'
	}

	const getLabel = () => {
		if (theme === 'system') return t('theme.system')
		return resolvedTheme === 'dark' ? t('theme.dark') : t('theme.light')
	}

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
			aria-label={`${t('theme.current')}: ${getLabel()}. ${t('theme.clickToChange')}`}
			title={getLabel()}
		>
			<i className={`${getIcon()} w-5! h-5! bg-gray-600 dark:bg-gray-300!`} aria-hidden="true" />
			<span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
				{getLabel()}
			</span>
		</button>
	)
}

export default memo(ThemeToggle)
