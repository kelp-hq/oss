import { map } from 'ramda';

import { toKebabCase } from './toKebabCase';

describe('toKebabCase suite', () => {
  it('should transform to toKebabCase', () => {
    const words = [
      'StackOverflow',
      'JSONResponseData',
      'camelCase',
      'alllowercase',
      'ALLCAPITALLETTERS',
      'CustomXMLParser',
      'APIFinder',
      'JSONResponseData',
      'Person20Address',
      'UserAPI20Endpoint'
    ];
    const transformed = map(toKebabCase)(words);
    const res = [
      'stack-overflow',
      'jsonresponse-data',
      'camel-case',
      'alllowercase',
      'allcapitalletters',
      'custom-xmlparser',
      'apifinder',
      'jsonresponse-data',
      'person20address',
      'user-api20endpoint'
    ];

    expect(transformed).toEqual(res);
  });
});
