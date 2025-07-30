export default {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	darkMode: ['class', '[data-theme="dark"]'],
	safelist: ['alert-info', 'alert-success', 'alert-error', 'alert-warning'],
	plugins: [require('daisyui')],
}
