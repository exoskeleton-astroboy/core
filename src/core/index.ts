import {
  createBuildHelper,
  createLifeHooks
} from "astroboy-router/entrance/build";
import {
  IArgSolutionsContext,
  IParseArgsOptions,
  IPipeResolveContext,
  IRouteBuildContext,
  IRouteDescriptor
} from "astroboy-router/metadata";
import { STATIC_RESOLVER } from "../options/typed-serialize.options";
import { Configs } from "../services/Configs";
import { Context } from "../services/Context";
import { InjectService } from "../services/Injector";
import { IContext } from "../typings/IContext";
import { ICommonResultType, IResult } from "../typings/IResult";

declare module "koa" {
  // tslint:disable-next-line: interface-name
  interface Request {
    body: any;
  }
}

export const INTERNAL_INJECTOR = Symbol.for("DI_CONTROLLER::INTERNAL_INJECTOR");
export const FORK_TARGET = Symbol.for("DI_CONTROLLER::FORK_TARGET");
export const InjectorGetter = Symbol.for("DI_CONTROLLER::injector");

/**
 * ### 重新定义args的获取方式
 *
 * @author Big Mogician
 * @param {any} delegator 控制器instance
 * @returns {IArgSolutionsContext}
 */
function fetchArgs(delegator: any): IArgSolutionsContext {
  const injector: InjectService = (<any>delegator)[InjectorGetter];
  const context = injector.get<Context>(Context);
  return {
    query: context.ctx.query || {},
    params: context.ctx.params || {},
    body: context.ctx.request.body || {}
  };
}

/**
 * ### 重新定义Route构建逻辑
 *
 * @author Big Mogician
 * @param {IRouteBuildContext} context
 * @param {IRouteDescriptor} descriptor
 */
export function onBuild(
  context: IRouteBuildContext,
  descriptor: IRouteDescriptor
) {
  const { lifeCycle, extensions } = context.router;
  const { pipes, extensions: routeExt } = context.route;
  const closeOnThrows =
    routeExt.pipeCloseOnThrows || extensions.pipeCloseOnThrows || false;
  const needPipe = pipes.rules.length > 0;
  const needOnPipe = (lifeCycle.onPipes || []).length > 0;
  const needOnEnter = (lifeCycle.onEnter || []).length > 0;
  const needOnQuit = (lifeCycle.onQuit || []).length > 0;
  const pipeContext: IBindContext = { pipes, closeOnThrows };
  const hooks = createLifeHooks(context);
  const routeLogic = createRouteMethodInvoke(context, descriptor.value);
  descriptor.value = async function() {
    if (needOnPipe) await hooks.runOnPipes.call(this);
    if (needPipe) {
      const shouNext = await pipeOverrideInvokes.call(this, pipeContext);
      if (!shouNext) return;
    }
    if (needOnEnter) await hooks.runOnEnters.call(this);
    await routeLogic.call(this);
    if (needOnQuit) await hooks.runOnQuits.call(this);
  };
  return descriptor;
}

export function createRouteMethodInvoke(
  context: IRouteBuildContext<void>,
  source: any
) {
  const helpers = createBuildHelper(context);
  return async function(this: any) {
    const injector: InjectService = (<any>this)[InjectorGetter];
    const ctx = injector.get<Context>(Context);
    const staticResolver = injector.get(Configs).get(STATIC_RESOLVER);
    const args = helpers.parseArgs.call(this, {
      fetchArgs,
      // 重新定义静态类型处理器
      resolver: staticResolver
    } as Partial<IParseArgsOptions>);
    const result: ICommonResultType = await source.call(this, ...args);
    if (result) resolveMethodResult(result, ctx.ctx, injector);
  };
}

interface IBindContext {
  pipes: IPipeResolveContext<void>;
  closeOnThrows: any;
}

async function pipeOverrideInvokes(
  this: any,
  { pipes, closeOnThrows }: IBindContext
) {
  try {
    for (const eachPipe of pipes.rules || []) {
      await eachPipe(this);
    }
    return true;
  } catch (error) {
    if (!pipes.handler) {
      throw error;
    }
    pipes.handler(this, error);
    return !closeOnThrows;
  }
}

async function resolveMethodResult(
  result: string | IResult,
  ctx: IContext,
  injector: InjectService
) {
  if ((<IResult>result).toResult) {
    ctx.body = await (<IResult>result).toResult({
      injector,
      configs: injector.get(Configs)
    });
  } else {
    ctx.body = <string>result;
  }
}
