import {
  Constructor,
  IBaseInjectable,
  InjectScope,
  InjectToken
} from "@bonbons/di";
import { GlobalDI } from "../utils";

interface IInjectableConfigs<T = any> {
  type: InjectScope;
  token: InjectToken<T>;
}

/**
 * ## 定义服务
 * @description
 * @author Big Mogician
 * @export
 * @param {Partial<{
 *   type: InjectScope,
 *   token: InjectToken
 * }>} [config]
 * @returns
 */
export function Injectable(): <T>(target: Constructor<T>) => any;
export function Injectable(
  scope: InjectScope
): <T>(target: Constructor<T>) => any;
export function Injectable(
  config: Partial<IInjectableConfigs>
): <T>(target: Constructor<T>) => any;
export function Injectable(config?: InjectScope | Partial<IInjectableConfigs>) {
  // tslint:disable-next-line: only-arrow-functions
  return function<T>(target: Constructor<T>) {
    // @ts-ignore no check for undefined
    let token: InjectToken<any> = undefined;
    let scope: InjectScope = InjectScope.Scope;
    switch (config) {
      case InjectScope.Scope:
      case InjectScope.Singleton:
      case InjectScope.New:
        scope = <InjectScope>config;
        break;
      default:
        const { token: tk = undefined, type: tp = InjectScope.Scope } =
          config || {};
        scope = tp || InjectScope.Scope;
        token = <any>tk;
    }
    const prototype: IBaseInjectable = target.prototype;
    prototype.__valid = true;
    GlobalDI.register({ token: token || target, imp: target, scope });
    return <Constructor<T>>target;
  };
}
