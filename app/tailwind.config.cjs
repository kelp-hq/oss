/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		container: {
			center: true
		}
	},
	plugins: [require('@tailwindcss/typography'), require('daisyui')],
	daisyui: {
		styled: true,
		themes: true,
		base: true,
		utils: true,
		logs: true,
		rtl: false,
		prefix: '',
		darkTheme: 'dark',
		// darkTheme: 'macula',
		// themes: ['dark']
		themes: [
			'light',
			'dark',
			'cupcake',
			'bumblebee',
			'emerald',
			'corporate',
			'synthwave',
			'retro',
			'cyberpunk',
			'valentine',
			'halloween',
			'garden',
			'forest',
			'aqua',
			'lofi',
			'pastel',
			'fantasy',
			'wireframe',
			'black',
			'luxury',
			'dracula',
			'cmyk',
			'autumn',
			'business',
			'acid',
			'lemonade',
			'night',
			'coffee',
			'winter',
			{
				macula: {
					primary: '#2B2D42',
					secondary: '#6366f1',
					accent: '#FF7287',
					neutral: '#8D99AE',
					'base-100': '#111827',
					info: '#EDF2F4',
					success: '#4ade80',
					warning: '#f59e0b',
					error: '#b91c1c'
				}
			}
		]
	}
};
