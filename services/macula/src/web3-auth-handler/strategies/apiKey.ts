import { isTrue } from '@anagolay/utils';
import { includes, isEmpty, isNil } from 'ramda';

import { getEnv } from '../../utils/env';
import { IAuthStrategy, IBaseStrategy } from '../authMiddleware';
import { StrategyValidationError } from '../errors';

export interface IApiKeyPayload {
  key: string;
}
export interface IApiKeyStructure extends IBaseStrategy<IApiKeyPayload> {
  strategy: IAuthStrategy.apiKey;
}

export function validate(token: IApiKeyStructure): void {
  const ENABLE_API_KEY_SUPPORT = getEnv('ENABLE_API_KEY_SUPPORT', false);

  if (!isNil(ENABLE_API_KEY_SUPPORT) && !isEmpty(ENABLE_API_KEY_SUPPORT) && isTrue(ENABLE_API_KEY_SUPPORT)) {
    const allowedApiKeys = getEnv('ALLOWED_API_KEYS', '[]');

    const apiKeyFromHeader = token.payload.key;

    if (isNil(apiKeyFromHeader) || isEmpty(apiKeyFromHeader)) {
      throw new Error('Did you forget the API key? Set the `x-api-key` header with the correct value.');
    }

    if (!includes(apiKeyFromHeader, allowedApiKeys)) {
      throw new StrategyValidationError('Api key is not allowed', 401);
    }
  } else {
    console.warn('API SUPPORT IS DISABLED, BE CAREFUL NOT TO EXPOSE THIS TO THE PUBLIC!');
  }
}
