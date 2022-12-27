/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Adapter, Builder } from '@sveltejs/kit';
import { BuildOptions } from 'esbuild';
import { readFileSync } from 'fs';
import { stat } from 'fs/promises';
import { isEmpty, isNil, startsWith } from 'ramda';

import { ManifestV3 } from './manifest-v3.js';
import {
  adaptInlineScript,
  adaptLinksInHtmlFiles,
  adaptManifestFile,
  compileContentScripts,
  compileServiceWorker,
  compileWebAccessibleResources,
  IManifestCompilation
} from './utils.js';

// we are compiling to ESM only, so this is OK

/**
 * Adapter options
 * @internal
 */
interface IAdapterOptions {
  manifest: string;
  precompress?: boolean;
  baseDirectory: string;
  outDirectory?: string;
  esbuildOptions?: BuildOptions;
  trailingSlash: 'never' | 'always';
}

/**
 * Macula adapter
 * @param incomingOption -
 * @public
 * @returns
 */
export default function (incomingOption: IAdapterOptions): Adapter {
  const adapter: Adapter = {
    name: 'sveltekit-adapter-chrome-extension',
    async adapt(builder: Builder) {
      const {
        log,
        config: { kit }
      } = builder;

      const {
        manifest,
        precompress = true,
        outDirectory = 'dist',
        baseDirectory,
        esbuildOptions = {},
        trailingSlash = 'never'
      } = incomingOption;

      if (isNil(manifest) || isEmpty(manifest)) {
        log.error('Manifest must not be undefined or empty');
        return;
      } else {
        try {
          await stat(manifest);
        } catch (error) {
          log.error(error);
          return;
        }
      }

      /**
       * chrome is complaining about the directory called _app
       * so usually this would be app, but better to notify people not to use underscore at all
       */
      if (startsWith('_', kit.appDir)) {
        log.error(`kit.appDir must not start with _ please change it to a string that doesn't start with _`);
        return;
      }

      ///// svelte kit normal stuff

      builder.rimraf(outDirectory);

      builder.writeClient(outDirectory);
      builder.writePrerendered(outDirectory);

      // console.log('builder.config.kit.files', builder.config.kit.files);

      // builder.generateFallback('index.html');

      if (precompress) {
        log.minor('Compressing assets and pages');
        await builder.compress(outDirectory);
      }

      log(`Wrote site to "${outDirectory}"`);

      ///// END svelte kit normal stuff

      ///// START chrome extension specific processing
      log('Starting with the compilation of manifest assets ...');

      const manifestImport = JSON.parse(readFileSync(manifest).toString()) as ManifestV3;

      const commonCompileOptions: IManifestCompilation = {
        baseDirectory,
        outDirectory,
        manifest: manifestImport,
        builder,
        esbuildOptions
      };

      const sw = await compileServiceWorker(commonCompileOptions);
      const cs = await compileContentScripts(commonCompileOptions);
      const war = await compileWebAccessibleResources(commonCompileOptions);

      const manifestOverrides = manifestImport;

      if (!isNil(sw) && !isEmpty(sw)) {
        manifestOverrides.background = sw;
      }

      if (!isNil(cs) && !isEmpty(cs)) {
        manifestOverrides.content_scripts = cs;
      }

      if (!isNil(war) && !isEmpty(war)) {
        manifestOverrides.web_accessible_resources = war;
      }

      await adaptManifestFile(outDirectory, manifestImport, manifestOverrides);

      await adaptLinksInHtmlFiles(outDirectory, trailingSlash, log);

      await adaptInlineScript(outDirectory, log);

      ///// chrome extension specific processing
    }
  };

  return adapter;
}
