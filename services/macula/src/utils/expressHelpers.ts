import { IRoute, Router } from 'express';

import { log } from './logger';

/**
 * Log the routes to the logger
 * @param router - Express router
 */
export function logRouterRoutes(router: Router): void {
  router.stack.forEach((layer: { route: IRoute }) => {
    log.trace(`\t Enabling route %s`, layer.route.path);
  });
}
