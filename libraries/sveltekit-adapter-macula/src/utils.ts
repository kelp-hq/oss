/* eslint-disable @rushstack/security/no-unsafe-regexp */
/* eslint-disable @rushstack/typedef-var */
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { equals, join, repeat } from 'ramda';
/**
 * Create missing dirs and then write a file
 * @param file -
 * @param data -
 */
export function write(file: string, data: string): void {
	try {
		mkdirSync(dirname(file), { recursive: true });
	} catch {
		// do nothing
	}

	writeFileSync(file, data);
}

const findSrc = 'src="/';
const reSrc = new RegExp(findSrc, 'g');
const findHref = 'href="/';
const reHref = new RegExp(findHref, 'g');
const findContent = 'content="/';
const reContent = new RegExp(findContent, 'g');
const findFromImport = 'from "/';
const reFromImport = new RegExp(findFromImport, 'g');

// TODO dynamic window.basepath ?
const findDynamicImport = 'import\\("/';
const reDynamicImport = new RegExp(findDynamicImport, 'g');

// const findRelpath = 'window.relpath="/';
// const reRelpath = new RegExp(findRelpath, 'g');

/**
 * This will be repeated as many times as needed to get to the top
 */
export const baseDepthDoubleDots: string = '../';

/**
 *
 */
export const baseDepthSingleDot: string = './';

export function fixHtmlDocument(content: string, relativeDepthToRoot: number): string {
	let href = './';
	if (!equals(relativeDepthToRoot, 0)) {
		href = join('', repeat(baseDepthDoubleDots, relativeDepthToRoot));
	}
	const findBase = `{"base":""`;
	const reBase = new RegExp(findBase, 'g');
	const windowBaseScript = `
  <script>
    window.BASE = (() => {
      const normalised = (location.pathname.endsWith("/") ? location.pathname.substr(0, location.pathname.length -1) : location.pathname).substr(1);
      const split = normalised.split('/');
      const sliced = ${relativeDepthToRoot} ? split.slice(0, ${-relativeDepthToRoot}) : split;
      const str = (sliced.length > 0 && sliced[0] !== "") ? "/" + sliced.join('/') : "";
      return str;
    })();
  </script>
`;
	const newIndexContent = content
		.replaceAll(reSrc, `src="${href}`)
		.replaceAll(reHref, `href="${href}`)
		.replaceAll(reContent, `content="${href}`)
		.replaceAll(reFromImport, `from "${href}`)
		.replaceAll(reDynamicImport, `import("${href}`)
		.replace('%sveltekit.head-from-build%', windowBaseScript)
		.replace(reBase, `{"base": window.BASE`);

	return newIndexContent;
}
