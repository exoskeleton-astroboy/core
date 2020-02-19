import Koa from "koa";
import { Injectable } from "../decorators/injectable";

// tslint:disable-next-line: no-namespace
export namespace AstroboyApp {
  // tslint:disable-next-line: interface-name
  export interface Contract<A = Koa, C = any> {
    readonly app: A;
    readonly config: C;
  }
}

/**
 * ## Astroboy.ts基础Application服务
 * * `app` 承载Koa.Application，可定制类型
 * * `config` 承载业务config，可定制类型
 * @description
 * @author Big Mogician
 * @export
 * @class AstroboyApp
 * @template A typeof `app` 类型
 * @template C typeof `config` 类型
 */
@Injectable()
export class AstroboyApp<A = Koa, C = any>
  implements AstroboyApp.Contract<A, C> {
  private _app!: A;

  /** BaseClass.app */
  public get app(): A {
    return this._app;
  }

  /** BaseClass.config */
  public get config(): C {
    return (this.app && (<any>this.app)["config"]) || {};
  }

  constructor() {}
}
