import { makeUniqueFileNameBasedOnURLAndSearchParams } from './identifiers';

describe('Identifiers test suite', () => {
  it('should calculate filename based on the path and search params', () => {
    expect(
      makeUniqueFileNameBasedOnURLAndSearchParams(
        new URL(
          'http://localhost/ipfs/bafybeiamyhpnopwatfvwdgj2mhnkgztj5ioipnubimdk44xmshzhz4x7yy?w=200&pin=1'
        )
      )
    ).toEqual('bafybeiamyhpnopwatfvwdgj2mhnkgztj5ioipnubimdk44xmshzhz4x7yy__w-200');
    expect(
      makeUniqueFileNameBasedOnURLAndSearchParams(
        new URL(
          'http://localhost/ipfs/bafybeiamyhpnopwatfvwdgj2mhnkgztj5ioipnubimdk44xmshzhz4x7yy/image.png?w=200&h=300&pin=1&f=png'
        )
      )
    ).toEqual('bafybeiamyhpnopwatfvwdgj2mhnkgztj5ioipnubimdk44xmshzhz4x7yy/image.png__w-200__h-300__f-png');
  });
});
