import { Injectable } from "../decorators/injectable";
import { AstroboyContext } from "./AstroboyContext";

/**
 * astroboy基础配置结构
 *
 * @author Big Mogician
 * @export
 * @interface IAstroboyBaseConfigs
 */
export interface IAstroboyBaseConfigs {
  view: {
    root: string;
    cache: false;
    defaultExtension: string;
    defaultViewEngine: string;
    mapping: { [prop: string]: any };
  };
}

type MatchInvoke = string | RegExp | ((ctx: any) => boolean);

/**
 * astroboy中间件配置参数类型结构
 *
 * @author Big Mogician
 * @export
 * @interface IAstMiddlewareConfig
 * @template T
 */
export interface IAstMiddlewareConfig<T = any> {
  priority?: number;
  enable?: boolean;
  options?: T;
  ignore?: MatchInvoke | Array<MatchInvoke>;
  match?: MatchInvoke | Array<MatchInvoke>;
}

/**
 * astroboy基础中间件配置结构
 *
 * @author Big Mogician
 * @export
 * @interface IAstroboyBaseMiddlewares
 */
export interface IAstroboyBaseMiddlewares {
  "astroboy-static": IAstMiddlewareConfig<{ root?: string }>;
  "astroboy-security-cto": IAstMiddlewareConfig<string>;
  "astroboy-security-frameOptions": IAstMiddlewareConfig<string>;
  "astroboy-security-hsts": IAstMiddlewareConfig<{ maxAge: number }>;
  "astroboy-security-xssProtection": IAstMiddlewareConfig<string>;
  "astroboy-security-xss": IAstMiddlewareConfig<any>;
  "astroboy-router": IAstMiddlewareConfig<any>;
  "astroboy-body": IAstMiddlewareConfig<{
    formidable?: {
      uploadDir: string;
    };
    multipart?: string;
    jsonLimit?: string;
    formLimit?: string;
    textLimit?: string;
    strict?: boolean;
  }>;
}

/**
 * ## 基础ConfigReader
 * * 为configs提供智能感知
 * * 实现上只是一个`ctx.getConfig(...)`的代理
 * * 继承此类以实现自定义DI
 *
 * @template T typeof configs
 */
@Injectable()
export class ConfigReader<T extends { [prop: string]: any } = {}> {
  /**
   * 整个config数据
   *
   * @readonly
   * @type {T}
   * @memberof ConfigReader
   */
  public get global(): T {
    return this.read();
  }

  // tslint:disable-next-line: variable-name
  constructor(private __context: AstroboyContext) {}

  /**
   * 读取config的某一个key下的数据
   *
   * @author Big Mogician
   * @template K
   * @param {K} key
   * @returns {T[K]}
   * @memberof ConfigReader
   */
  public read<K extends keyof T>(key: K): T[K];
  /**
   * 读取整个config
   *
   * @author Big Mogician
   * @returns {T}
   * @memberof ConfigReader
   */
  public read(): T;
  public read(key?: string): any {
    return this.__context.ctx.getConfig(key);
  }
}
