import { GLOBAL_ERROR } from "../options/errors.options";
import { SimpleLogger } from "../plugins/simple-logger";
import { Configs } from "../services/Configs";
import { InjectService } from "../services/Injector";
import { Scope } from "../services/Scope";
import { IContext } from "../typings/IContext";
import { getShortScopeId, GlobalDI, setColor, setScopeId } from "../utils";

/**
 * ## astroboy.ts初始化中间件
 * * 请确保此中间件的优先级足够高
 * * 建议优先级<1
 * @param ctx IContext
 * @param next 下一个中间件
 */
export const serverInit = async (ctx: IContext, next: () => Promise<void>) => {
  const { injector, scope, logger } = initRequestScope(ctx);
  try {
    await next();
  } catch (error) {
    console.error("DI Unhandled Exception : ");
    console.error(error);
    await tryCatchGlobalError(injector, error);
  } finally {
    disposeRequestScope(scope, logger, injector);
  }
};

function initRequestScope(ctx: IContext) {
  const scopeId = setScopeId(ctx);
  GlobalDI.createScope(scopeId, { ctx });
  const injector = GlobalDI.get(InjectService, scopeId);
  const logger = injector.get(SimpleLogger);
  const scope = injector.get(Scope);
  scope["init"](scopeId)["begin"]();
  logger.trace(`scope ${setColor("cyan", getShortScopeId(scopeId))} is init.`);
  return { injector, scope, logger };
}

async function tryCatchGlobalError(injector: InjectService, error: any) {
  const configs = injector.get(Configs);
  const { handler } = configs.get(GLOBAL_ERROR);
  if (handler) {
    await handler(error, injector, configs);
  }
}

function disposeRequestScope(
  scope: Scope,
  logger: SimpleLogger,
  injector: InjectService
) {
  scope["end"]();
  const duration = scope.duration();
  logger.trace(
    `scope ${setColor(
      "cyan",
      getShortScopeId(injector.scopeId)
    )} is [${setColor(
      duration > 500 ? "red" : duration > 200 ? "yellow" : "green",
      duration
    )} ms] disposed.`
  );
  injector["INTERNAL_dispose"] && injector["INTERNAL_dispose"]();
}

export { createMiddleware as injectScope, IMiddlewaresScope } from "./core";
