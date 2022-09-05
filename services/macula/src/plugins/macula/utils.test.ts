import { removeSearchParamsFromUrl, urlHasSupportedExtension } from './utils';

describe('Utils test suite', () => {
  it('should work urlHasSupportedExtension', () => {
    expect(
      urlHasSupportedExtension(
        new URL(
          'http://localhost/ipfs/bafybeifz4vnqlhjzswj36jqnnohl5jmtyuzdb3pmzlypajqtvvf57q2zae/DSC02817.jpg?w=400'
        )
      )
    ).toBe(true);
    expect(
      urlHasSupportedExtension(
        new URL('http://localhost/ipfs/bafybeidwq4hmquba3vlbkg34g67wid3dmufohq3ycesxulgywyv5ocia3a?w=400')
      )
    ).toBe(false);
  });
  it('should clean query params from url', () => {
    const url1 = new URL('http://localhost/woss?w=25&t=42');
    const cleanUrl1 = removeSearchParamsFromUrl(url1);
    expect(cleanUrl1).toEqual('http://localhost/woss');

    const url2 = new URL('http://localhost:3000/woss?w=25&t=42');
    const cleanUrl2 = removeSearchParamsFromUrl(url2);
    expect(cleanUrl2).toEqual('http://localhost:3000/woss');
  });
});
