import { Constructor, IBaseInjectable, InjectScope } from "@bonbons/di";
import { GlobalDI } from "../utils";

export function Procedure() {
  // tslint:disable-next-line: only-arrow-functions
  return function<T>(target: Constructor<T>) {
    const prototype: IBaseInjectable = target.prototype;
    prototype.__valid = true;
    GlobalDI.register({
      token: target,
      imp: target,
      scope: InjectScope.Scope
    });
    return <Constructor<T>>target;
  };
}
