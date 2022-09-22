import { IHostingRequestContext } from '../../plugins/hosting';
import { IBaseStrategy } from '../../web3-api-auth/authMiddleware';
import { IApiKeyPayload, IApiKeyStructure } from '../../web3-api-auth/strategies/apiKey';

declare global {
  namespace Express {
    interface Request {
      hostingCtx: IHostingRequestContext;
      user: ISubstratePayload | IApiKeyPayload;
    }
  }
}
