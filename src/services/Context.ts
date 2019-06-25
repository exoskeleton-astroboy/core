import Koa from "koa";
import { IContext } from "../typings/IContext";

// tslint:disable-next-line: no-namespace
export namespace Context {
  // tslint:disable-next-line: interface-name
  export interface Contract<T = IContext> {
    ctx: T;
  }
}

/**
 * ## 基础上下文服务
 * @description
 * @author Big Mogician
 * @export
 * @class Context
 * @template T typeof `ctx` 类型
 */
export class Context<T = IContext> implements Context.Contract<T> {
  /**
   * ### Koa上下文对象
   * * 有可能被astroboy和后续框架扩展
   * @description
   * @readonly
   * @type {T} 聚合类型
   * @memberof Context
   */
  public get ctx(): T {
    return <any>this._ctx;
  }
  // tslint:disable-next-line: variable-name
  constructor(private _ctx: Koa.Context) {}
}
