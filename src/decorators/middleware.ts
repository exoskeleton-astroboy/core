import { ReadonlyDIContainer } from "@bonbons/di";
import { CustomPipe, IPipeProcess } from "astroboy-router";
import { PipeErrorHandler } from "astroboy-router/metadata";
import { tryGetRoute, tryGetRouter } from "astroboy-router/utils";
import { INTERNAL_INJECTOR } from "../core";

export type IMiddleware<T = any> = (
  injector: ReadonlyDIContainer
) => Promise<T> | T;

export type IMiddlewareHandler = (
  injector: ReadonlyDIContainer,
  error: Error
) => void;

export interface IMiddlewareMeta {
  override: boolean;
  closeOnThrows: boolean;
  onError: IMiddlewareHandler;
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
  rules: IMiddleware<void>[],
  meta: Partial<IMiddlewareMeta> = {}
) {
  return function middlewares(
    target: any,
    propertyKey?: string,
    descriptor?: any
  ) {
    if (!propertyKey) {
      const { pipes, extensions: ext } = tryGetRouter(target.prototype);
      pipes.rules = [...pipes.rules, ...(rules || []).map(i => wrapPipeFn(i))];
      pipes.handler = wrapOnError(<any>meta.onError) || pipes.handler;
      ext.pipeCloseOnThrows = meta.closeOnThrows;
    } else {
      const router = tryGetRouter(target);
      const { extensions: ext, pipes } = tryGetRoute(
        router.routes,
        propertyKey
      );
      const { override = false, onError, closeOnThrows } = meta;
      return CustomPipe({
        rules: <any>rules.map(i => wrapPipeFn(i)),
        override,
        zIndex: "push",
        handler: wrapOnError(<any>onError) || pipes.handler,
        extensions: {
          ...ext,
          pipeCloseOnThrows: closeOnThrows || ext.pipeCloseOnThrows
        }
      })(target, propertyKey, descriptor);
    }
  };
}

function wrapOnError(
  handler?: IMiddlewareHandler
): PipeErrorHandler | undefined {
  if (!handler) return undefined;
  return (ctor: any, error: any) => handler(ctor[INTERNAL_INJECTOR], error);
}

function wrapPipeFn(handler: IMiddleware<any>): IPipeProcess<any> {
  return (ctor: any) => handler(ctor[INTERNAL_INJECTOR]);
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
