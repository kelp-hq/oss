/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Adapter, Builder } from '@sveltejs/kit';

// we are compiling to ESM only, so this is OK

/**
 * Adapter options
 * @internal
 */
interface IAdapterOptions {
  manifest: string;
  precompress?: boolean;
}

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
      const { manifest, precompress } = incomingOption;
    }
  };

  return adapter;
}
