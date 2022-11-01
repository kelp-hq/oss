import { IHostingRequestContext } from '../../plugins/hosting';
import { ISubstratePayload } from '@kelp_digital/web3-api-auth-token';

declare global {
  namespace Express {
    interface Request {
      /**
       * Context for the website hosting
       */
      hostingCtx: IHostingRequestContext;
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
