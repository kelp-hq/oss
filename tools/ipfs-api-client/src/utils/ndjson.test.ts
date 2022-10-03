import { toArray } from './ndjson';

describe('ndjson suite', () => {
  it('should stringify the ndjson to normal json', () => {
    const ndj = `{"a":2}\n{"d":1}`;
    expect(toArray(ndj)).toEqual('["{\\"a\\":2}","{\\"d\\":1}"]');
  });
});
