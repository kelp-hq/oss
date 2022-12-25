/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Adapter, Builder } from '@sveltejs/kit';
import { equals, isEmpty, isNil } from 'ramda';

import { write } from './utils.js'; // we are compiling to ESM only, so this is OK

/**
 * Adapter options
 * @internal
 */
interface IAdapterOptions {
	fallback?: string;
	appType: 'spa' | 'static';
	subdomain?: string;
	precompress?: boolean;
	account: string;
}

/**
 * An interface for the routes
 * @internal
 */
// interface IRoute {
// 	src: string;
// 	headers?: Record<string, any>;
// 	status?: 307 | 308;
// }
/**
 * The keys correspond to the `trailingSlash` sveltekit config
 * @internal
 */
// interface IRoutes {
// 	always: IRoute[];
// 	never: IRoute[];
// 	ignore: IRoute[];
// }

/**
 * Shamelessly taken from sveltekit vercel adapter. It makes a lot of sense and why re-invent the wheel
 */
// rules for clean URLs and trailing slash handling,
// generated with @vercel/routing-utils
// const redirects: IRoutes = {
// 	always: [
// 		{
// 			/**
// 			 * redir only
// 			 * ```
// 			 * /dir/index -> /dir/
// 			 * /dir/index/ -> /dir/
// 			 * ```
// 			 */
// 			src: '^/(?:(.+)/)?index(?:\\.html)?/?$', // https://regex101.com/r/OgOahm/1
// 			headers: {
// 				Location: '/$1/'
// 			},
// 			status: 308
// 		},
// 		{
// 			src: '^/(.*)\\.html/?$', // https://regex101.com/r/OUMx3x/1
// 			headers: {
// 				Location: '/$1/'
// 			},
// 			status: 308
// 		},
// 		{
// 			src: '^/\\.well-known(?:/.*)?$' // matches `/\.well-known`
// 		},
// 		{
// 			src: '^/((?:[^/]+/)*[^/\\.]+)$', // match `/features/feature-a` will redirect to `/features/feature-a/`
// 			headers: {
// 				Location: '/$1/'
// 			},
// 			status: 308
// 		},
// 		{
// 			// '^/((?:[^/]+/)*[^/\\.]+)$'
// 			// '^/((?:[^/]+/)*[^/]+\\.\\w+)/$'
// 			src: '^/((?:[^/]+/)*[^/]+\\.\\w+)/$',
// 			headers: {
// 				Location: '/$1'
// 			},
// 			status: 308
// 		}
// 	],
// 	never: [
// 		{
// 			src: '^/(?:(.+)/)?index(?:\\.html)?/?$',
// 			headers: {
// 				Location: '/$1'
// 			},
// 			status: 308
// 		},
// 		{
// 			src: '^/(.*)\\.html/?$',
// 			headers: {
// 				Location: '/$1'
// 			},
// 			status: 308
// 		},
// 		{
// 			src: '^/(.*)/$', // match `/dir/dir/`
// 			headers: {
// 				Location: '/$1'
// 			},
// 			status: 308
// 		}
// 	],
// 	ignore: [
// 		{
// 			src: '^/(?:(.+)/)?index(?:\\.html)?/?$',
// 			headers: {
// 				Location: '/$1'
// 			},
// 			status: 308
// 		},
// 		{
// 			src: '^/(.*)\\.html/?$',
// 			headers: {
// 				Location: '/$1'
// 			},
// 			status: 308
// 		}
// 	]
// };

/**
 * Macula adapter
 * @param incomingOption -
 * @public
 * @returns
 */
export default function (incomingOption: IAdapterOptions): Adapter {
	const adapter: Adapter = {
		name: 'sveltekit-adapter-macula',
		async adapt(builder: Builder) {
			const { account, appType, fallback = 'index.html', subdomain, precompress } = incomingOption;

			if (isNil(account) || isEmpty(account)) {
				builder.log.error('account must be set to any substrate based account');
				return;
			}
			const dir = `.macula`;

			const tmp = builder.getBuildDirectory('macula-tmp');

			builder.rimraf(dir);
			builder.rimraf(tmp);

			const pages = `${dir}`;
			const assets = `${dir}`;

			builder.log(`Processing ${appType}`);

			if (equals(appType, 'static')) {
				builder.log.warn(
					'You are building static app, please ensure that the trailingSlash is set to true in the +layout.ts'
				);
			} else {
				throw new Error(`This appType is not supported: ${appType}`);
			}

			builder.writeClient(assets);
			builder.writePrerendered(pages);
			builder.generateFallback(fallback);

			const prerenderedRedirects = Array.from(builder.prerendered.redirects, ([src, redirect]) => ({
				src,
				headers: {
					Location: redirect.location
				},
				status: redirect.status
			}));

			const routes = [
				// ...redirects[builder.config.kit.trailingSlash], // << not using this for the time being. brings complexity
				...prerenderedRedirects,
				{
					src: `/${builder.config.kit.appDir}/immutable/.+`,
					headers: {
						'cache-control': 'public, immutable, max-age=31536000'
					}
				}
			];

			const prerenderedPages: Record<string, { file: string }> = {};

			/**
			 * We are doing follwing here:
			 * 1. setting proper routes
			 * 2. setting prerenderedPages
			 * 3. making the links relative to the /
			 */
			// if (!equals(builder.config.kit.trailingSlash, 'always')) {
			for (const [src, page] of builder.prerendered.pages) {
				// routes.push({
				// 	src: src,
				// 	headers: {
				// 		Location: src
				// 	},
				// 	status: 308
				// });

				// implicit redirects (trailing slashes)
				// if (src !== '/') {
				// 	routes.push({
				// 		src: src,
				// 		headers: {
				// 			Location: src
				// 		},
				// 		status: 308
				// 	});
				// } else {

				// explicit prerenderedPages, maybe not needed ???
				// prerenderedPages[page.file] = { path: src };
				prerenderedPages[src] = { file: '/' + page.file };
				// }

				/**
				 * this part gets overwritten for static pages
				 */
				// // building the relative paths
				// const indexPath = join(pages, page.file);
				// const indexContent = readFileSync(indexPath).toString();
				// // return all but first and lst element which will always be '' if matched and string starts with /. the routes come in as /route1/
				// const fileDepthParts = init(tail(split('/')(src)));

				// // actually fix the html document
				// const newContent = fixHtmlDocument(indexContent, length(fileDepthParts));
				// write(indexPath, newContent);
			}
			// }

			// if (!isNil(fallback)) {
			// 	const indexPath = join(pages, fallback);
			// 	const indexContent = readFileSync(indexPath).toString();
			// 	const newContent = fixHtmlDocument(indexContent, 0);
			// 	write(indexPath, newContent);
			// }

			if (precompress) {
				builder.log.minor('Compressing assets');
				builder.compress(pages);

				builder.log.minor('Compressing pages');
				builder.compress(pages);
			}

			type AvailableCompressions = 'br' | 'gz';

			interface IMaculaConfig {
				version: 1;
				source: 'sveltekit';
				account: string;
				preredered: boolean;
				appType: 'spa' | 'static';
				fallback?: {
					file?: string;
					route?: string;
				};
				compressedFor: AvailableCompressions[];
				routes: any[];
				pages: Record<string, { file: string }>;
				subdomain?: string;
			}

			const maculaJson: IMaculaConfig = {
				version: 1,
				account: `urn:anagolay:${account}`,
				fallback: {
					file: fallback,
					route: '/'
				},
				appType,
				preredered: true,
				source: 'sveltekit',
				// eslint-disable-next-line no-constant-condition
				compressedFor: true ? ['gz', 'br'] : [],
				routes,
				pages: prerenderedPages,
				subdomain
			};
			write(`${dir}/macula.json`, JSON.stringify(maculaJson));

			console.log(builder);
		}
	};

	return adapter;
}
