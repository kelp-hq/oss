import { join } from 'ramda';

/**
 * Make unique name based on the file path and query string
 * @param url -
 * @public
 */
export function makeUniqueFileNameBasedOnURLAndSearchParams(url: URL): string {
  const clonedUrl = new URL(url.toString());
  const path = clonedUrl.pathname.replace('/ipfs/', '');

  // add more stuff to delete
  clonedUrl.searchParams.delete('pin');
  clonedUrl.searchParams.delete('replicas');
  clonedUrl.searchParams.delete('account');

  const nameChunksJoined = join('__', [
    path,
    clonedUrl.searchParams.toString().replace(/&/g, '__').replace(/=/g, '-')
  ]);

  return nameChunksJoined;
}
