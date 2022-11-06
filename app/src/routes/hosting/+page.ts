import type { PageLoad } from './$types';

export const load: PageLoad = (p) => {
  console.log('load fetch ', p);
  return {
    domains: []
  };
};
