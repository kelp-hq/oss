import { sveltekit } from '@sveltejs/kit/vite';

import { defineConfig, type UserConfig } from 'vite';
import { isoImport } from 'vite-plugin-iso-import';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import { viteExternalsPlugin } from 'vite-plugin-externals';

import { resolve } from 'path';

const config: UserConfig = {
	logLevel: 'info',
	plugins: [isoImport(), sveltekit(), wasm(), topLevelAwait()],
	resolve: {
		alias: {
			$src: resolve('./src')
		}
	},
	optimizeDeps: {
		esbuildOptions: {
			target: 'es2020',
			define: {
				global: 'globalThis'
			}
			// plugins: []
		}
		// include: ['@anagolay/utils']
		// exclude: ['@polkadot/wasm-crypto-wasm', '@polkadot/*']
		// exclude: ['ipfs-http-client', 'electron-fetch']
	},
	build: {
		// warn on chunks above 1MB
		chunkSizeWarningLimit: 1024
		// rollupOptions: {
		// 	plugins: []
		// }
	},
	server: {
		fs: {
			allow: [resolve('../../../src')],
			strict: false
		},
		// configure vite for HMR with Gitpod
		hmr: process.env.GITPOD_WORKSPACE_URL
			? {
					// removes the protocol and replaces it with the port we're connecting to
					host: process.env.GITPOD_WORKSPACE_URL.replace('https://', '7777-'),
					protocol: 'wss',
					clientPort: 443
			  }
			: true
	}
	// // this is only for prod build
	// ssr: {
	//   noExternal: true,
	// },
};

export default defineConfig((opts) => {
	const { command, mode, ssrBuild } = opts;
	// if (command === 'serve') {
	// 	return {
	// 		// dev specific config
	// 	};
	// } else {
	// 	// command === 'build'
	// 	// return {
	// 	//   // build specific config
	// 	// }
	// }
	return config;
});
