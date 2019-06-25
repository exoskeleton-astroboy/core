import {
  ConfigsCollection as ReadonlyConfigs,
  ReadonlyDIContainer as ReadonlyDI
} from "@bonbons/di";
import { Async } from "./IViewEngine";

export interface IResultScope {
  configs: ReadonlyConfigs;
  injector: ReadonlyDI;
}

/**
 * ## 路由方法返回接口定义
 * @description
 * @author Big Mogician
 * @export
 * @interface IResult
 */
export interface IResult {
  /**
   * ### 需要实现的解析函数
   * * 将目标处理成body内容
   * @description
   * @author Big Mogician
   * @param {IResultScope} scope
   * @returns {(string | Promise<string>)}
   * @memberof IResult
   */
  toResult(scope: IResultScope): string | Promise<string>;
}

export type ICommonResultType = string | void | IResult;

export type IBodyResult = Async<ICommonResultType>;
