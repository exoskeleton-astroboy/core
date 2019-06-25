import { Configs } from "../services/Configs";
import { InjectService } from "../services/Injector";
import { IContext } from "../typings/IContext";
import { getScopeId, GlobalDI } from "../utils";

export interface IMiddlewaresScope<T = IContext> {
  injector: InjectService;
  configs: Configs;
  ctx: T;
  next: () => Promise<void>;
}

type ProvideInvoker<T extends IContext = IContext> = (
  bunddle: IMiddlewaresScope<T>
) => void | Promise<void>;

/**
 * 创建具有依赖注入能力的中间件
 *
 * @author Big Mogician
 * @export
 * @template T extends IContext
 * @param {((bunddle: IMiddlewaresScope, ctx: T, next: () => Promise<void>) => void | Promise<void>)} middleware
 * @returns
 */
export function createMiddleware<T extends IContext = IContext>(
  middleware: ProvideInvoker<T>
) {
  return async (ctx: T, next: () => Promise<void>) => {
    const scopeId = getScopeId(ctx);
    const configs = GlobalDI.get(Configs, scopeId);
    const injector = GlobalDI.get(InjectService, scopeId);
    await middleware({ injector, configs, ctx, next });
  };
}
