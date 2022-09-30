/* eslint-disable @typescript-eslint/naming-convention */
import { BaseStrategy } from './BaseStrategy';
import { IAuthStrategy } from './strategies';
describe('[BaseStrategy] Test case', () => {
  class ImplClass extends BaseStrategy<{ name: string; age: number }> {
    public constructor(payload?: { name: string; age: number }) {
      super(payload);
      this.strategy = IAuthStrategy.substrate;
    }

    public async encodeSignature(rawSig: string): Promise<string> {
      return new Promise((resolve) => resolve(rawSig));
    }

    public async validate(): Promise<{ name: string; age: number }> {
      return { name: 'string', age: 2 };
    }
  }
  class ImplClassWithoutStrategy extends BaseStrategy<{ name: string; age: number }> {
    public constructor(payload?: { name: string; age: number }) {
      super(payload);
    }

    public async encodeSignature(rawSig: string): Promise<string> {
      return new Promise((resolve) => resolve(rawSig));
    }

    public async validate(): Promise<{ name: string; age: number }> {
      return { name: 'string', age: 2 };
    }
  }

  const token = 'c3Vi.eyJhZ2UiOjQzLCJuYW1lIjoid29zcyJ9.InNpZyI=';
  const payload = {
    age: 43,
    name: 'woss'
  };

  const signature: string = 'sig';

  it('Should be exported', () => {
    expect(BaseStrategy).toBeDefined();
  });
  it('Should be defined', async () => {
    const t = new ImplClass();

    expect(t.encode).toBeDefined();
    expect(t.makeWithHeader).toBeDefined();
    expect(t.strategy).toBeDefined();
    expect(ImplClass.parseToken).toBeDefined();
    expect(t.encodeSignature).toBeDefined();

    expect(t.payload).not.toBeDefined();

    t.payload = payload;

    expect(t.payload).toBeDefined();
  });
  it('Should pass basic checks', async () => {
    const t = new ImplClass(payload);
    expect(await t.make(signature)).toEqual(token);
    expect(await t.makeWithHeader(signature)).toEqual({
      authorization: 'Bearer c3Vi.eyJhZ2UiOjQzLCJuYW1lIjoid29zcyJ9.InNpZyI='
    });

    // no strategy
    const tt = new ImplClassWithoutStrategy(payload);
    expect(tt.strategy).not.toBeDefined();

    try {
      await tt.make(signature);
    } catch (error) {
      expect(error.message).toEqual('Did you forget to set the strategy?');
    }
    const ttt = new ImplClass();
    try {
      await ttt.make(signature);
    } catch (error) {
      expect(error.message).toEqual('Did you forget to set the payload?');
    }
  });
  it('Should parse the token properly', async () => {
    const { parsed, original } = await ImplClass.parseToken(token);

    expect(parsed.payload).toEqual(payload);
    expect(parsed.sig).toEqual(signature);
    expect(parsed.strategy).toEqual(IAuthStrategy.substrate);

    const tokenChunks = token.split('.');
    expect(original.strategy).toEqual(tokenChunks[0]);
    expect(original.payload).toEqual(tokenChunks[1]);
    expect(original.sig).toEqual(tokenChunks[2]);
  });
  it('Should fail on malformed token', async () => {
    const token = 'c3Vi.eyJhZ2UiOjQzLCJuYW1lIjoid29zcyJ9.InNpZyI=';
    const [first, second] = token.split('.');
    try {
      await ImplClass.parseToken([first, second].join('.'));
    } catch (error) {
      expect(error.message).toContain('Malformed token');
    }
  });
});
