import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';
import { type UserConfig, defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
const config: UserConfig = {
  logLevel: 'info',
  plugins: [topLevelAwait(), sveltekit()],
  resolve: {
    alias: {
      src: resolve('./src'),
      '@kelp_digital/svelte-ui-components': resolve(__dirname, './src/components/'),
      '@kelp_digital/svelte-ui-components/*': resolve(__dirname, './src/components/*')
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
    chunkSizeWarningLimit: 1024
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
          host: process.env.GITPOD_WORKSPACE_URL.replace('https://', '7778-'),
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
