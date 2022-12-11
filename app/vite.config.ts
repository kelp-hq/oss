// import 'vite/modulepreload-polyfill';

import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';
import { type UserConfig, createLogger, defineConfig } from 'vite';
import { isoImport } from 'vite-plugin-iso-import';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

const logger = createLogger('warn');

const originalWarning = logger.warn;
logger.warn = (msg, options) => {
  //https://github.com/vitejs/vite/pull/10108
  console.log('msg', msg);

  // if (msg.includes('vite:css') && msg.includes(' is empty')) return;
  // originalWarning(msg, options);
};

const config: UserConfig = {
  customLogger: logger,
  logLevel: 'info',
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
    },
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
  // // https://vitejs.dev/guide/build.html#public-base-path
  // experimental: {
  //   renderBuiltUrl: (filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) => {
  //     console.log({ filename, hostType });
  //     if (hostType === 'js') {
  //       return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` };
  //     } else {
  //       return { relative: true };
  //     }
  //   }
  // }
  // // this is only for prod build
  // ssr: {
  //   noExternal: true
  // }
};

export default defineConfig(({ mode }) => {
  let conf = config;
  // const { command, mode, ssrBuild } = opts;
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

  if (mode === 'production') {
    conf.logLevel = 'error';
  }
  return conf;
});
