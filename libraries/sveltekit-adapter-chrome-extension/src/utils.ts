/* eslint-disable @typescript-eslint/naming-convention */
import { Builder } from '@sveltejs/kit';
import { Logger } from '@sveltejs/kit/types/private';
import { load } from 'cheerio';
import { createHash } from 'crypto';
import esbuild, { BuildOptions } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname, resolve } from 'path';
import {
  compose,
  equals,
  flatten,
  isEmpty,
  isNil,
  join,
  last,
  mergeDeepRight,
  replace,
  split,
  startsWith
} from 'ramda';
import glob from 'tiny-glob';
import { fileURLToPath } from 'url';

import { IBackground, IContentScript, IWebAccessibleResource, ManifestV3 } from './manifest-v3';

// eslint-disable-next-line @rushstack/typedef-var, @typescript-eslint/naming-convention
export const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @rushstack/typedef-var, @typescript-eslint/naming-convention
export const __dirname = dirname(__filename);

const defaultEsbuildOptions: BuildOptions = {
  bundle: true,
  minify: true,
  platform: 'browser',
  sourcemap: 'linked',
  target: 'esnext',
  format: 'esm',
  splitting: false,
  plugins: []
};

/**
 * Create missing dirs and then write a file
 * @param file -
 * @param data -
 */
export async function write(file: string, data: string): Promise<void> {
  try {
    await mkdir(dirname(file), { recursive: true });
  } catch {
    // do nothing
  }

  writeFileSync(file, data);
}

/**
 * Adapt the a.href links and turn them into the actual links with .html if you are not building the SPA ( setting the `export const csr = true;` )
 *
 * This manipulates cheerio object and stores the html.
 *
 * @param directory - where wo look for the html files
 * @param trailingSlash - 'never' or 'always'
 * @param log - svelte kit builder logger
 */
export async function adaptLinksInHtmlFiles(
  directory: string,
  trailingSlash: 'never' | 'always',
  log: Logger
): Promise<void> {
  log.minor(' Adapting Links in HTML files');
  const files = await glob('**/*.{html}', {
    cwd: directory,
    dot: true,
    filesOnly: true,
    absolute: true
  });

  await Promise.all(
    files.map(async (file) => {
      const fileName = last(split('/')(file)) as string;
      const f = readFileSync(file);

      const $ = load(f.toString());
      const $nodes = $('a[href]:not(a[href^="#"])');

      $nodes.map((i, e) => {
        if (!startsWith('http', e.attribs.href)) {
          if (equals(trailingSlash, 'never')) {
            // home route
            if (equals(e.attribs.href, '/')) {
              e.attribs.href = `/index.html`;
            } else {
              e.attribs.href = `${e.attribs.href}.html`;
            }
          } else if (equals(trailingSlash, 'always')) {
            e.attribs.href = `${e.attribs.href}index.html`;
          }
        }
      });

      await write(file, $.html());
      log.minor(`   Rewrote ${fileName}`);
    })
  );
}

/**
 * Adapt inline script to be an external script
 * @param directory - where wo look for the html files
 * @param log - svelte kit builder logger
 */
export async function adaptInlineScript(directory: string, log: Logger): Promise<void> {
  log.minor(' Adapting Inline Scripts');
  const files = await glob('**/*.{html}', {
    cwd: directory,
    dot: true,
    filesOnly: true,
    absolute: true
  });

  await Promise.all(
    files.map(async (file) => {
      const fileName = last(split('/')(file)) as string;
      const f = readFileSync(file);

      await write(file.replace('.html', '-orig.html'), f.toString());

      const $ = load(f.toString());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const node = $('script[type="module"]').get()[0];

      if (!node) {
        log.minor(`   Nothing to process, skipping...`);
        return;
      }

      // if there is a src, it's not an inline script
      if (Object.keys(node.attribs).includes('src')) {
        return;
      }

      const originalAttributes = Object.keys(node.attribs).reduce(
        (a, c) => a + `${c}="${node.attribs[c]}" `,
        ''
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const innerScript = (node.children[0] as any).data;

      const fullTag = $('script[type="module"]').toString();

      const inlineScriptHash = createHash('sha256', {}).update(innerScript, 'utf-8').digest('hex');

      //get new filename
      const inlineScriptAsFile = `/script-${replace('.html', '', fileName)}-${inlineScriptHash}.js`;

      //remove from orig html file and replace with new script tag
      const newHtml = f
        .toString()
        .replace(fullTag, `<script ${originalAttributes} src="${inlineScriptAsFile}"></script>`);

      await write(file, newHtml);
      log.minor(`   Rewrote ${fileName}`);

      const htmlFile = `${directory}${inlineScriptAsFile}`;
      await write(htmlFile, innerScript);
      log.minor(`   Inline script extracted and saved at: ${inlineScriptAsFile}`);
    })
  );
}

/**
 * @internal
 */
export interface IManifestCompilation {
  baseDirectory: string;
  outDirectory: string;
  manifest: ManifestV3;
  builder: Builder;
  esbuildOptions: BuildOptions;
}

/**
 * Compile service worker
 * @param opts - {@link IManifestCompilation}
 * @returns the file path where the script is saved
 */
export async function compileServiceWorker(opts: IManifestCompilation): Promise<IBackground | undefined> {
  const { manifest, baseDirectory, esbuildOptions, outDirectory, builder } = opts;

  const { background } = manifest;
  if (isNil(background) || isEmpty(background)) {
    builder.log.minor('  background not defined, skipping ...');
    return;
  }

  const { service_worker, type } = background;

  const swPath = resolve(baseDirectory, service_worker);
  const swFileName = compose(last, split('/'))(service_worker) as string;
  const swFileNameAsJs = swFileName.replace('.ts', '.js');
  const outFilePath = resolve(outDirectory, swFileNameAsJs);

  const buildOptions: BuildOptions = {
    ...defaultEsbuildOptions,
    format: equals(type, 'module') ? 'esm' : 'cjs',
    ...esbuildOptions,
    // so somebody doesn't override this
    entryPoints: [swPath],
    outfile: outFilePath
  };

  await esbuild.build(buildOptions);

  builder.log.minor(`   ✓ Compiled service worker`);
  return {
    ...background,
    service_worker: replace(join('/', [baseDirectory, outDirectory]), '', outFilePath)
  };
}

/**
 * Compile content scripts
 * @param opts - {@link IManifestCompilation}
 * @returns the files path where the script is saved
 */
export async function compileContentScripts(opts: IManifestCompilation): Promise<IContentScript[]> {
  let allScripts: IContentScript[] = [];

  const { manifest, baseDirectory, esbuildOptions, outDirectory, builder } = opts;

  const { content_scripts } = manifest;

  if (isNil(content_scripts) || isEmpty(content_scripts)) {
    builder.log.minor('  content_scripts not defined or empty, skipping ...');
    return allScripts;
  } else {
    allScripts = await Promise.all(
      content_scripts.map(async (cs) => {
        const { js } = cs;

        if (isNil(js) || isEmpty(js)) {
          builder.log.minor('  js key not defined or empty, skipping ...');
          return cs;
        }

        const jsPromises = await Promise.all(
          js.map(async (jsItem) => {
            const filePath = resolve(baseDirectory, jsItem);
            const fileName = compose(last, split('/'))(jsItem) as string;
            const fileNameAsJs = fileName.replace('.ts', '.js');
            const outFilePath = resolve(outDirectory, fileNameAsJs);

            await esbuild.build({
              ...defaultEsbuildOptions,
              ...esbuildOptions,
              // so somebody doesn't override this
              entryPoints: [filePath],
              outfile: outFilePath
            });
            builder.log.minor(`   ✓ Compiled Content script ${fileNameAsJs}`);

            return replace(join('/', [baseDirectory, outDirectory]), '', outFilePath);
          })
        );
        return {
          ...cs,
          js: jsPromises
        };
      })
    );
    return allScripts;
  }
}

/**
 * Compile web_accessible_resources
 * @param opts - {@link IManifestCompilation}
 * @returns the files path where the script is saved
 */
export async function compileWebAccessibleResources(
  opts: IManifestCompilation
): Promise<IWebAccessibleResource> {
  const { manifest, baseDirectory, esbuildOptions, outDirectory, builder } = opts;

  let allScripts: IWebAccessibleResource = [];

  const { web_accessible_resources } = manifest;

  if (isNil(web_accessible_resources) || isEmpty(web_accessible_resources)) {
    builder.log.minor('  web_accessible_resources not defined or empty, skipping ...');
  } else {
    allScripts = await Promise.all(
      web_accessible_resources.map(async (war) => {
        const { resources } = war;

        if (isNil(resources) || isEmpty(resources)) {
          builder.log.minor('  resources key not defined or empty, skipping ...');
          return war;
        }
        const r = await Promise.all(
          resources.map(async (warItem) => {
            const filePath = resolve(baseDirectory, warItem);
            const fileName = compose(last, split('/'))(warItem) as string;
            const fileNameAsJs = fileName.replace('.ts', '.js');
            const outFilePath = resolve(outDirectory, fileNameAsJs);

            await esbuild.build({
              ...defaultEsbuildOptions,
              ...esbuildOptions,
              // so somebody doesn't override this
              entryPoints: [filePath],
              outfile: outFilePath
            });
            builder.log.minor(`   ✓ Compiled web_accessible_resources ${fileNameAsJs}`);

            return replace(join('/', [baseDirectory, outDirectory]), '', outFilePath);
          })
        );
        return {
          ...war,
          resources: r
        };
      })
    );
  }
  return flatten(allScripts);
}

export async function adaptManifestFile(
  outDirectory: string,
  manifest: ManifestV3,
  overrides: Partial<ManifestV3>
): Promise<void> {
  const data = mergeDeepRight(manifest, overrides);
  write(resolve(outDirectory, 'manifest.json'), JSON.stringify(data, null, 2));
}
