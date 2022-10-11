import { randomBytes } from 'crypto';
import { isNil, last } from 'ramda';

import { createHttpClient } from './client';

jest.setTimeout(100000);

const oneGb = 1073741824;

describe('Client class ', () => {
  // skipping the test because we cannot make it work on the CI
  it('should have methods defined', async () => {
    expect(createHttpClient).toBeDefined();
    const c = await createHttpClient();
    expect(c.add).toBeDefined();
  });
});

describe('addAll ', () => {
  it('single file', async () => {
    // this data should always be there
    const c = await createHttpClient();

    const largeData = randomBytes(oneGb / 10);
    // console.log('largeData length', convertBytes(largeData.byteLength));

    let totalTrf = 0;
    const f = c.addAll([{ content: largeData, path: '/my/path/randombytes-file' }], {
      cidVersion: 1,
      progress: (bytes) => {
        // it's already cumulative, this is the way to get the TOTAL
        totalTrf = bytes;
      }
    });

    const fullResult = [];

    for await (const result of f) {
      fullResult.push(result);
    }

    /**
     * This depends on the path. If you have 2 directories and a file that will
     * yield with `3 = (dir + dir) + file` then one more for the LAST cid since we're
     * wrapping it with the directory. This is the default behavior.
     */
    expect(fullResult.length).toEqual(4);

    // console.log(fullResult);
    const lastResult = last(fullResult);
    // expect that everything is transferred
    if (!isNil(lastResult)) {
      // this means that the last path or /
      expect(lastResult.Name).toEqual('');
    }

    // console.log('totalTrf', totalTrf);
    // console.log('largeData.byteLength', largeData.byteLength);
    // console.log('lastResult', lastResult?.Size);

    expect(largeData.byteLength).toEqual(totalTrf);
  });
  it('glob files', async () => {
    // this data should always be there
    const c = await createHttpClient();
  });
});
