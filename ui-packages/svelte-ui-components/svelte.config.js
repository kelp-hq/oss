import adapter from '@kelp_digital/sveltekit-adapter-macula';
import sveltePreprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess({
    postcss: true
  }),
  kit: {
    adapter: adapter({
      appType: 'static',
      account: '5EJA1oSrTx7xYMBerrUHLNktA3P89YHJBeTrevotTQab6gEY',
      precompress: true,
      subdomain: 'svelte-ui-components-kelp'
    }),
    trailingSlash: 'always',
    files: {
      lib: 'src/components'
    },
    alias: {
      src: 'src',
      'src/*': 'src/*',
      $lib: 'src/components',
      '$lib/*': 'src/components/*'
    }
  },
  package: {
    dir: 'lib',
    source: 'src/components'
  }
};
export default config;
