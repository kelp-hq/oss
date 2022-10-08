import { randomBytes } from 'crypto';
import { last } from 'ramda';

import { createHttpClient } from './client';
import { convertBytes } from './utils/convertBytes';

jest.setTimeout(100000);

const oneGb = 1073741824;

describe('Client ', () => {
  // skipping the test because we cannot make it work on the CI
  it('should have methods defined', async () => {
    expect(createHttpClient).toBeDefined();
    const c = await createHttpClient();
    expect(c.add).toBeDefined();
  });

  it('Should test addAll endpoint', async () => {
    // this data should always be there
    // const data = await readFile(resolve(__dirname, '../../../docs/md/ipfs-api-client.api.md'));
    const c = await createHttpClient();

    const largeData = randomBytes(oneGb / 5);
    console.log('largeData length', convertBytes(largeData.byteLength));

    let totalTrf = 0;
    const f = c.addAll([{ content: largeData, path: '/my/path/ipfs-api-client.api.md' }], {
      cidVersion: 1,
      progress: (bytes) => {
        // it's already cumulative, this is the way to get the TOTAL
        console.log('tranfsrrd', bytes);
        totalTrf = bytes;
      }
    });

    const fullResult = [];
    for await (const result of f) {
      console.log('result in test', result);
      fullResult.push(result);
    }
    // console.log(fullResult);

    /**
     * This depends on the path. If you have 2 directories and a file that will
     * yield with `3 = (dir + dir) + file` then one more for the LAST cid since we're
     * wrapping it with the directory. This is the default behavior.
     */
    expect(fullResult.length).toEqual(4);

    // expect that everything is transferred
    expect(largeData.byteLength).toEqual(last(fullResult).Size);
    expect(largeData.byteLength).toEqual(totalTrf);
  });
});
