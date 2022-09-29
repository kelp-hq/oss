import { BaseStrategy } from './BaseStrategy';
import { IAuthStrategy } from './strategies';
describe('[BaseStrategy] Test case', () => {
  beforeEach(() => {});

  it('Should be exported', () => {
    expect(BaseStrategy).toBeDefined();
  });
  it('Should be defined', async () => {
    class ImplClass extends BaseStrategy<{ name: string; age: number }> {
      public constructor(payload?: { name: string; age: number }) {
        super(payload);
        this.strategy = IAuthStrategy.apiKey;
      }
      public async validate(): Promise<{ name: string; age: number }> {
        return { name: 'string', age: 2 };
      }
    }

    const t = new ImplClass();

    expect(t.encode).toBeDefined();
    expect(t.makeWithHeader).toBeDefined();
    expect(t.payload).not.toBeDefined();
    t.payload = {
      age: 43,
      name: 'woss'
    };
    expect(t.payload).toBeDefined();

    const token = 'YXBpS2V5.eyJhZ2UiOjQzLCJuYW1lIjoid29zcyJ9.c2ln';
    expect(await t.make('sig')).toBe(token);
  });
});
