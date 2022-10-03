import { create } from './client';

describe('Client ', () => {
  it('client test', async () => {
    const ipfs = await create({
      url: 'http://localhost:5001'
    });
    ipfs.add({ silent: true });
  });
});
