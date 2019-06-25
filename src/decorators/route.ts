import { Constructor } from "@bonbons/di";
import * as RT from "astroboy-router";
import * as MT from "astroboy-router/metadata";
import { IStaticTypedResolver } from "../typings/IStaticTypeResolver";
import { PartReset } from "../utils";

/** 参数注入装饰器工厂类型 */
export type IRouteArgsFactory<T = any> = (
  target: T,
  propertyKey: string,
  index: number
) => void;

/**
 * 基础参数装饰器配置
 *
 * @author Big Mogician
 * @interface IBaseArgsOptions
 */
interface IBaseArgsOptions {
  /** 使用内置静态类型处理，默认：`false` */
  useStatic: boolean;
  /** 参数注入的最后一个钩子函数，默认：`undefined` */
  finally(data: any, types?: Constructor<any>[]): any;
}

/**
 * ## Params参数注入装饰器工厂配置
 *
 * @author Big Mogician
 * @export
 * @interface IParamsArgsOptions
 * @extends {PartReset<MT.IParamsArgsOptions, { useStatic: any }>}
 * @extends {IBaseArgsOptions}
 */
export interface IParamsArgsOptions
  extends PartReset<MT.IParamsArgsOptions, { useStatic: any }>,
    IBaseArgsOptions {}

/**
 * ## Body参数注入装饰器工厂配置
 *
 * @author Big Mogician
 * @export
 * @interface IBodyArgsOptions
 * @extends {PartReset<MT.IBodyArgsOptions, { useStatic: any }>}
 * @extends {IBaseArgsOptions}
 */
export interface IBodyArgsOptions
  extends PartReset<MT.IBodyArgsOptions, { useStatic: any }>,
    IBaseArgsOptions {}

/**
 * ## Query参数注入装饰器工厂配置
 *
 * @author Big Mogician
 * @export
 * @interface IQueryArgsOptions
 * @extends {PartReset<MT.IQueryArgsOptions, { useStatic: any }>}
 * @extends {IBaseArgsOptions}
 */
export interface IQueryArgsOptions
  extends PartReset<MT.IQueryArgsOptions, { useStatic: any }>,
    IBaseArgsOptions {}

/**
 * ## Request参数注入装饰器工厂配置
 * * 基础装饰器工厂，用于扩展
 *
 * @author Big Mogician
 * @export
 * @interface IRequestArgsOptions
 * @extends {PartReset<MT.IRequestArgsOptions, { useStatic: any }>}
 * @extends {IBaseArgsOptions}
 */
export interface IRequestArgsOptions
  extends PartReset<MT.IRequestArgsOptions, { useStatic: any }>,
    IBaseArgsOptions {}

interface IStaticContext {
  resolver: IStaticTypedResolver;
  type: any[];
}

/**
 * 静态类型处理，使用框架实现
 * * `resolver` 由框架提供
 *
 * @author Big Mogician
 * @param {*} data
 * @param {IStaticContext} { resolver, type = [] }
 */
function staticResolve(data: any, { resolver, type = [] }: IStaticContext) {
  return resolver.FromObject(data, type[0]);
}

/**
 * 决定静态类型处理的逻辑
 * * `useStatic && finalStep` ：启动静态类型转换，植入finally逻辑
 * * `useStatic && !finalStep` ：启动静态类型转换，无finally处理
 * * `!useStatic && finalStep` ：关闭静态类型转换，植入finally逻辑
 * * `!useStatic && !finalStep` ：空逻辑，退出
 *
 * @author Big Mogician
 * @param {Partial<IRequestArgsOptions>} options
 * @returns {(data: any, options: IStaticContext) => any}
 */
function decideStaticFn(
  options: Partial<IRequestArgsOptions>
): (data: any, options: IStaticContext) => any {
  const { useStatic, finally: finalStep } = options;
  if (!finalStep && !useStatic) {
    return undefined!;
  }
  if (!useStatic) return (data, opts) => finalStep!(data, opts.type);
  if (!finalStep) return staticResolve;
  return (data, opts) => finalStep(staticResolve(data, opts), opts.type);
}

/**
 * ## 从request中获取params
 * @description
 * @author Big Mogician
 * @export
 * @returns {IRouteArgsFactory}
 */
export function FromParams(): IRouteArgsFactory;
export function FromParams(
  options: Partial<IParamsArgsOptions>
): IRouteArgsFactory;
export function FromParams(options: Partial<IParamsArgsOptions> = {}) {
  return RT.FromParams({ ...options, useStatic: <any>decideStaticFn(options) });
}

/**
 * ## 从request中获取query
 * @description
 * @author Big Mogician
 * @export
 * @returns {IRouteArgsFactory}
 */
export function FromQuery(): IRouteArgsFactory;
export function FromQuery(
  options: Partial<IQueryArgsOptions>
): IRouteArgsFactory;
export function FromQuery(options: Partial<IQueryArgsOptions> = {}) {
  return RT.FromQuery({ ...options, useStatic: <any>decideStaticFn(options) });
}

/**
 * ## 从request中获取body
 * @description
 * @author Big Mogician
 * @export
 * @returns {IRouteArgsFactory}
 */
export function FromBody(): IRouteArgsFactory;
export function FromBody(options: Partial<IBodyArgsOptions>): IRouteArgsFactory;
export function FromBody(options: Partial<IBodyArgsOptions> = {}) {
  return RT.FromBody({ ...options, useStatic: <any>decideStaticFn(options) });
}

/**
 * ## 从request中获取内容
 * * 顶级装饰器，用于定制
 * @description
 * @author Big Mogician
 * @export
 * @returns {IRouteArgsFactory}
 */
export function FromRequest(): IRouteArgsFactory;
export function FromRequest(
  options: Partial<IRequestArgsOptions>
): IRouteArgsFactory;
export function FromRequest(options: Partial<IRequestArgsOptions> = {}) {
  return RT.FromRequest({
    ...options,
    useStatic: <any>decideStaticFn(options)
  });
}

export type HttpMethod = MT.METHOD | "PATCH" | "OPTION";

/**
 * ## 最高扩展性的路由声明
 * * 使用这个扩展工厂构造Route声明
 * @description
 * @author Big Mogician
 * @export
 * @param {{
 *   method: HttpMethod;
 *   tpls: string[];
 *   name?: string;
 * }} configs
 * @returns
 */
export function BASE_ROUTE_DECO_FACTORY(configs: {
  method: HttpMethod;
  patterns: (string | MT.IRouteUrlPattern)[];
  name?: string;
  force?: boolean;
}) {
  return RT.CustomRoute({
    method: <MT.METHOD>configs.method,
    name: configs.name,
    forceRouter: configs.force,
    patterns: configs.patterns
  });
}

/**
 * ## 定义一次Http请求路由
 *
 * @author Big Mogician
 * @export
 * @param {HttpMethod} method
 * @param {string} path
 * @returns {IRouteFactory}
 */
export function HTTP(method: HttpMethod, path: string): MT.IRouteFactory;
export function HTTP(method: HttpMethod, paths: string[]): MT.IRouteFactory;
export function HTTP(method: HttpMethod, paths: string | string[]) {
  const pathSections = Array.isArray(paths) ? paths : [paths];
  return RT.CustomRoute({
    method: <MT.METHOD>method,
    forceRouter: false,
    path: pathSections,
    patterns: pathSections.map(path => ({
      pattern: "{{@group}}/{{@path}}",
      sections: { path }
    }))
  });
}

/**
 * ## 定义GET请求
 * @description
 * @author Big Mogician
 * @export
 * @param {string} path
 * @returns {IRouteFactory}
 */
export function GET(path: string): MT.IRouteFactory {
  return HTTP("GET", path);
}

/**
 * ## 定义PUT请求
 * @description
 * @author Big Mogician
 * @export
 * @param {string} path
 * @returns {IRouteFactory}
 */
export function PUT(path: string): MT.IRouteFactory {
  return HTTP("PUT", path);
}

/**
 * ## 定义POST请求
 * @description
 * @author Big Mogician
 * @export
 * @param {string} path
 * @returns {IRouteFactory}
 */
export function POST(path: string): MT.IRouteFactory {
  return HTTP("POST", path);
}

/**
 * ## 定义DELETE请求
 * @description
 * @author Big Mogician
 * @export
 * @param {string} path
 * @returns {IRouteFactory}
 */
export function DELETE(path: string): MT.IRouteFactory {
  return HTTP("DELETE", path);
}
