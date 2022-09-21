import fetch from 'cross-fetch';

export function createHttp(options: Record<string, string>): void {
  console.log('fetch', fetch, options);
}
