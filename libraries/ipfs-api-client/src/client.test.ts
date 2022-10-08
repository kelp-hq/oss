import { readFile } from 'fs/promises';
import { resolve } from 'path';

import { createHttpClient } from './client';

describe('Client ', () => {
  // skipping the test because we cannot make it work on the CI
  it('should have methods defined', async () => {
    expect(createHttpClient).toBeDefined();
    const c = await createHttpClient();
    expect(c.add).toBeDefined();
  });
  it('Should test addAll endpoint', async () => {
    // this data should always be there
    const data = await readFile(resolve(__dirname, '../../../docs/md/ipfs-api-client.api.md'));
    const c = await createHttpClient();

    const f = c.addAll(data, {});
    for await (const result of f) {
      console.log(result);
    }
  });
});
