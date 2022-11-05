// import 'vite/modulepreload-polyfill';

import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';
import type { UserConfig } from 'vite';
import { isoImport } from 'vite-plugin-iso-import';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

const config: UserConfig = {
  logLevel: 'silent',
  plugins: [isoImport(), wasm(), topLevelAwait(), sveltekit()],
  resolve: {
    alias: {
      src: resolve('./src'),
      '@kelp_digital/svelte-ui-components': resolve(__dirname, '../ui-packages/svelte-ui-components/lib'),
      '@kelp_digital/svelte-ui-components/*': resolve(__dirname, '../ui-packages/svelte-ui-components/lib/*')
    }
  },

  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    // warn on chunks above 1MB
    chunkSizeWarningLimit: 1024,
    modulePreload: {
      polyfill: true
    }
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

export default config;

// export default defineConfig((opts) => {
//   // const { command, mode, ssrBuild } = opts;
//   // if (command === 'serve') {
//   // 	return {
//   // 		// dev specific config
//   // 	};
//   // } else {
//   // 	// command === 'build'
//   // 	// return {
//   // 	//   // build specific config
//   // 	// }
//   // }
//   return config;
// });
