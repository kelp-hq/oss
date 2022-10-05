import { create } from './client';

describe('Client ', () => {
  // skipping the test because we cannot make it work on the CI
  it.skip('client test', async () => {
    const ipfs = await create({
      url: 'http://localhost:5001'
    });
    ipfs.add({ silent: true });
  });
});
