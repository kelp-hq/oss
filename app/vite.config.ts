import { sveltekit } from '@sveltejs/kit/vite';

import type { UserConfig } from 'vite';
import { isoImport } from 'vite-plugin-iso-import';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

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
			},
			plugins: []
		}
		// exclude: ['electron-fetch']
		// exclude: ['ipfs-http-client', 'electron-fetch']
	},
	build: {
		// warn on chunks above 1MB
		chunkSizeWarningLimit: 1024,
		rollupOptions: {
			plugins: []
		}
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

export default config;
