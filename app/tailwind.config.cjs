/** @type {import('tailwindcss').Config} */ module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: { container: { center: true } },
	plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms'), require('daisyui')],
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
					primary: '#6366F1',
					secondary: '#FF7287',
					accent: '#5CA4AA',
					neutral: '#2B2D42',
					'base-100': '#24252B',
					info: '#F07887',
					success: '#5BC884',
					warning: '#E7A532',
					error: '#B93832'
				}
			}
		]
	}
};
