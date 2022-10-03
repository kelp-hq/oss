import { decode, encode } from './base64url';

describe('base64url', () => {
  it('should encode and decode', () => {
    const input = 'input,input,input';

    const encoded = encode(input);
    expect(encoded).toBe('aW5wdXQsaW5wdXQsaW5wdXQ=');

    const decoded = decode(encoded);
    expect(decoded).toBe(input);
  });
});
