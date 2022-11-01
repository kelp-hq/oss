// import adapter from '@sveltejs/adapter-static';
import adapter from '@kelp_digital/sveltekit-adapter-macula';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true,
			preserve: ['ld+json']
		})
	],

	kit: {
		adapter: adapter({
			appType: 'static',
			account: '5EJA1oSrTx7xYMBerrUHLNktA3P89YHJBeTrevotTQab6gEY',
			precompress: true,
			subdomain: 'macula'
		}),
		// prerender: {
		// 	default: true
		// },
		trailingSlash: 'always',
		files: {
			lib: 'src/components'
		}
	}
};

export default config;
