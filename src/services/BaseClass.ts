import { BaseClass as C } from "astroboy";
import Koa from "koa";

/**
 * ## 基础astroboy类
 * * 不建议在astroboy.ts的体系中使用
 * * 完整功能替代：AstroboyContext服务
 * @description
 * @author Big Mogician
 * @export
 * @class BaseClass
 */
declare class BaseClass {
  public ctx: Koa.Context;
  public app: Koa;
  public config: any;
  constructor(ctx: Koa.Context);
  public getConfig(...args: any[]): any;
  public getServiceClass(...args: any[]): any;
  public getService(...args: any[]): any;
  public callService(...args: any[]): any;
  public invokeServiceMethod(...args: any[]): any;
  public getLib(...args: any[]): any;
}

const BC: typeof BaseClass = <any>C;

export { BC as BaseClass };
