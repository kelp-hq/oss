import { decode, encode } from './base64url';

describe('base64url', () => {
  it('should pass enc and dec', () => {
    const input = 'input';
    const encoded = encode(input);
    const decoded = decode(encoded);
    expect(decoded).toBe(input);
  });
});
