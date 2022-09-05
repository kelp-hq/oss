import { forwardedHostAllowed } from './utils';

describe('Utils test suite', () => {
  it('should allow xForwardedHost', () => {
    process.env.ALLOWED_REFERRERS = '["on.anagolay.network"]';
    expect(
      forwardedHostAllowed('bafybeifaituwqmksvpolc4nisqs62d5malr7z5wygkqae3ajezyzpyi6jq.on.anagolay.network')
    ).toBe(true);
  });
});
