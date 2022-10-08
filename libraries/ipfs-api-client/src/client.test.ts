import { randomBytes } from 'crypto';

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

    // const f = c.addAll([{ content: data, path: 'ipfs-api-client.api.md' }], { cidVersion: 1 });
    // for await (const result of f) {
    //   console.log(result);
    // }
    const largeData = randomBytes(oneGb / 5);
    console.log('largeData length', convertBytes(largeData.byteLength));

    let totalTrf = 0;
    const f = c.addAll([{ content: largeData, path: '/my/path/ipfs-api-client.api.md' }], {
      cidVersion: 1,
      progress: (bytes, _path) => {
        // it's already cumulative, this is the way to get the TOTAL
        totalTrf = bytes;
      }
    });
    for await (const result of f) {
      console.log('result in test', result);
    }

    console.log('DONE');
    expect(largeData.byteLength).toEqual(totalTrf);
  });
});
