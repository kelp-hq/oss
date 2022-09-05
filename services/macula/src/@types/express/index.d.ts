import { IHostingRequestContext } from '../../plugins/hosting';
import { IBaseStrategy } from '../../web3-auth-handler/authMiddleware';
import { IApiKeyPayload, IApiKeyStructure } from '../../web3-auth-handler/strategies/apiKey';

declare global {
  namespace Express {
    interface Request {
      hostingCtx: IHostingRequestContext;
      user: ISubstratePayload | IApiKeyPayload;
    }
  }
}
