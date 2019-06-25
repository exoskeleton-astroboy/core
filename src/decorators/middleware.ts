import { CustomPipe, IPipeProcess } from "astroboy-router";
import { tryGetRoute, tryGetRouter } from "astroboy-router/utils";

export type IMiddleware = IPipeProcess<void>;

export interface IMiddlewareMeta {
  override: boolean;
  closeOnThrows: boolean;
  onError(context: any, error: Error): void;
}

/**
 * ## Middlewares 中间件
 *
 * @author Big Mogician
 * @export
 * @param {(IPipeProcess<void>[])} rules
 * @param {Partial<IMiddlewareContext>} [meta={}]
 */
export function Middlewares(
  rules: IPipeProcess<void>[],
  meta: Partial<IMiddlewareMeta> = {}
) {
  return function middlewares(
    target: any,
    propertyKey?: string,
    descriptor?: any
  ) {
    if (!propertyKey) {
      const { pipes, extensions: ext } = tryGetRouter(target.prototype);
      pipes.rules = [...pipes.rules, ...(rules || [])];
      pipes.handler = <any>meta.onError || pipes.handler;
      ext.pipeCloseOnThrows = meta.closeOnThrows;
    } else {
      const router = tryGetRouter(target);
      const { extensions: ext, pipes } = tryGetRoute(
        router.routes,
        propertyKey
      );
      const { override = false, onError, closeOnThrows } = meta;
      return CustomPipe({
        rules: <any>rules,
        override,
        zIndex: "push",
        handler: <any>onError || pipes.handler,
        extensions: {
          ...ext,
          pipeCloseOnThrows: closeOnThrows || ext.pipeCloseOnThrows
        }
      })(target, propertyKey, descriptor);
    }
  };
}

// tslint:disable-next-line: no-namespace
export namespace Middlewares {
  export function Crear() {
    return CustomPipe({
      rules: [],
      override: true
    });
  }
}
