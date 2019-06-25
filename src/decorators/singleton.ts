import { SingletonBasement as ReactiveSingleton } from "@bonbons/di";
import { getPropertyType } from "../utils";

export function Watch() {
  // tslint:disable-next-line: only-arrow-functions
  return function<T>(prototype: T, propertyKey: string) {
    const watch = (<any>prototype)["@watch"] || {};
    const override = (<any>prototype)["@override"] || [];
    watch[propertyKey] = {
      token: getPropertyType(prototype, propertyKey) || Object
    };
    override.push(propertyKey);
    Object.defineProperty(prototype, propertyKey, {
      get() {
        return this["delegate"][propertyKey];
      },
      enumerable: true,
      configurable: false
    });
    (<any>prototype)["@override"] = override;
    (<any>prototype)["@watch"] = watch;
  };
}

export { ReactiveSingleton };
