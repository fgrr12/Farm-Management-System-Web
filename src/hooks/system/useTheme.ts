import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export const useTheme = () => {
	const [theme, setTheme] = useState<Theme>(() => {
		const stored = localStorage.getItem('theme') as Theme
		return stored || 'system'
	})

	const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

	useEffect(() => {
		const root = document.documentElement
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

		const updateTheme = () => {
			let newResolvedTheme: 'light' | 'dark'

			if (theme === 'system') {
				newResolvedTheme = mediaQuery.matches ? 'dark' : 'light'
			} else {
				newResolvedTheme = theme
			}

			setResolvedTheme(newResolvedTheme)

			root.setAttribute('data-theme', newResolvedTheme)

			localStorage.setItem('theme', theme)
		}

		updateTheme()

		const handleChange = () => {
			if (theme === 'system') {
				updateTheme()
			}
		}

		mediaQuery.addEventListener('change', handleChange)
		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [theme])

	const toggleTheme = () => {
		setTheme((current) => {
			if (current === 'light') return 'dark'
			if (current === 'dark') return 'system'
			return 'light'
		})
	}

	const setSpecificTheme = (newTheme: Theme) => {
		setTheme(newTheme)
	}

	return {
		theme,
		resolvedTheme,
		toggleTheme,
		setTheme: setSpecificTheme,
		isDark: resolvedTheme === 'dark',
	}
}
