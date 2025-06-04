module.exports = {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	safelist: ['alert-info', 'alert-success', 'alert-error', 'alert-warning'],
	plugins: [require('daisyui')],
}
