# Some dev needed stuff

## ipfs cid `bafybeihonkvcaf5riqp6figuoe7l2nxrc6w3spnrqlioviabkda46k4ffe`

Link is https://bafybeihonkvcaf5riqp6figuoe7l2nxrc6w3spnrqlioviabkda46k4ffe.on.localhost

```js
//svelte.config.js
import macualaAdapter from '@kelp_digital/sveltekit-adapter-macula';
import preprocess from 'svelte-preprocess';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		postcss: true
	}),

	kit: {
		adapter: macualaAdapter({
			appType: 'static',
			account: '5EDGDLw5xDmgWVTkucjdnN7u3mtAk2DiQGmfGDEHFeDjdBqE',
			precompress: true,
			subdomain: 'test-website',
		}),

		prerender: {
			default: true
		},
		trailingSlash: 'always'
	}
};
export default config;

```
## ipfs cid `bafybeicsm7wto3np6uj3n4rurr77jyav6xlw3lenohzca2akvkk75vm7iu`

Link is https://bafybeicsm7wto3np6uj3n4rurr77jyav6xlw3lenohzca2akvkk75vm7iu.on.localhost

```js
//svelte.config.js
import macualaAdapter from '@kelp_digital/sveltekit-adapter-macula';
import preprocess from 'svelte-preprocess';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		postcss: true
	}),

	kit: {
		adapter: macualaAdapter({
			appType: 'spa',
			account: '5EDGDLw5xDmgWVTkucjdnN7u3mtAk2DiQGmfGDEHFeDjdBqE',
			precompress: true,
			subdomain: 'test-website',
		}),

		prerender: {
			default: true
		},
		trailingSlash: 'always'
	}
};
export default config;

```
## ipfs cid `bafybeidkljx3ryl7rauggkevsoadog4znrsui75xhjvqjdzs3ec6snvbgy`

Link is https://bafybeidkljx3ryl7rauggkevsoadog4znrsui75xhjvqjdzs3ec6snvbgy.on.localhost

```js
//svelte.config.js
import macualaAdapter from '@kelp_digital/sveltekit-adapter-macula';
import preprocess from 'svelte-preprocess';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		postcss: true
	}),

	kit: {
		adapter: macualaAdapter({
			appType: 'spa',
			account: '5EDGDLw5xDmgWVTkucjdnN7u3mtAk2DiQGmfGDEHFeDjdBqE',
			precompress: true,
			subdomain: 'test-website',
		}),

		prerender: {
			default: false
		},
		trailingSlash: 'always'
	}
};
export default config;

```
## ipfs cid `bafybeifsnbh5sr2oim72rvnorwk6pzg6a6uce3gcm6nec363qqrmhd7hiu`

Link is https://bafybeifsnbh5sr2oim72rvnorwk6pzg6a6uce3gcm6nec363qqrmhd7hiu.on.localhost

```js
//svelte.config.js
import macualaAdapter from '@kelp_digital/sveltekit-adapter-macula';
import preprocess from 'svelte-preprocess';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		postcss: true
	}),

	kit: {
		adapter: macualaAdapter({
			appType: 'spa',
			account: '5EDGDLw5xDmgWVTkucjdnN7u3mtAk2DiQGmfGDEHFeDjdBqE',
			precompress: false,
		}),

		prerender: {
			default: false
		},
		trailingSlash: 'always'
	}
};
export default config;

```