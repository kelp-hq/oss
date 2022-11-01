import { IBaseStrategy } from '../../express/authMiddleware';
import { apiKeyStrategy, substrateStrategy } from '../../strategies';

declare global {
  namespace Express {
    interface Request {
      /**
       * User object on the request. this is payload from the Strategy
       */
      user: {
        address: string;
      };
      /**
       * Skip auth. Sometimes there are few auth methods and first one that runs and passes should set this to true
       */
      shouldSkipAuth: boolean;
    }
  }
}
