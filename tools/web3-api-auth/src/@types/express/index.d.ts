import { IBaseStrategy } from '../../express/authMiddleware';
import { apiKeyStrategy, substrateStrategy } from '../../strategies';

declare global {
  namespace Express {
    interface Request {
      user: apiKeyStrategy.IApiKeyPayload | substrateStrategy.ISubstratePayload;
    }
  }
}
