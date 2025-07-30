export default {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	darkMode: ['class', '[data-theme="dark"]'],
	safelist: ['alert-info', 'alert-success', 'alert-error', 'alert-warning'],
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			{
				light: {
					primary: '#3b82f6',
					secondary: '#10b981',
					accent: '#f59e0b',
					neutral: '#374151',
					'base-100': '#ffffff',
					'base-200': '#f9fafb',
					'base-300': '#f3f4f6',
					info: '#0ea5e9',
					success: '#10b981',
					warning: '#f59e0b',
					error: '#ef4444',
				},
			},
			{
				dark: {
					primary: '#60a5fa',
					secondary: '#34d399',
					accent: '#fbbf24',
					neutral: '#1f2937',
					'base-100': '#111827',
					'base-200': '#1f2937',
					'base-300': '#374151',
					info: '#38bdf8',
					success: '#34d399',
					warning: '#fbbf24',
					error: '#f87171',
				},
			},
		],
	},
}
