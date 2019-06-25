import { Constructor, IBaseInjectable } from "@bonbons/di";
import { createRouter, Router } from "astroboy-router";
import {
  IControllerConstructor,
  IRouterFactory,
  IRouterMetaConfig
} from "astroboy-router/metadata";
import {
  FORK_TARGET,
  InjectorGetter,
  INTERNAL_INJECTOR,
  onBuild
} from "../core";
import { createInstance, getInjector } from "../utils";

/**
 * ## 定义控制器
 * * routes部分由astroboy-router实现
 * @description
 * @author Big Mogician
 * @export
 * @param {string | IRouterMetaConfig<void>} group
 * @returns {IRouterFactory}
 */
export function Controller(group: string): IRouterFactory;
export function Controller(options: IRouterMetaConfig<void>): IRouterFactory;
export function Controller(group: string | IRouterMetaConfig<void>): any {
  // tslint:disable-next-line: only-arrow-functions
  return function<T>(target: Constructor<T>) {
    const prototype: IBaseInjectable = target.prototype;
    prototype.__valid = true;
    const opts = typeof group === "string" ? { group } : group;
    Router({
      ...opts,
      register(delegate) {
        delegate.lifecycle("onBuild", onBuild, true);
      }
    })(target);
    // tslint:disable-next-line: variable-name
    const DI_ForkController = class {
      public static [FORK_TARGET] = target;
      constructor(ctx: any) {
        const injector = getInjector(ctx);
        const controller: any = createInstance(target, ctx);
        controller[INTERNAL_INJECTOR] = injector;
        return controller;
      }
    };
    (<any>prototype)["@router::v2"] = true;
    copyPrototype(DI_ForkController, target);
    Object.defineProperty(prototype, InjectorGetter, {
      get() {
        return this[INTERNAL_INJECTOR];
      },
      configurable: false,
      enumerable: false
    });
    return <Constructor<T>>(<unknown>DI_ForkController);
  };
}

/**
 * ### 获取fork对象的原始原型
 *
 * @author Big Mogician
 * @export
 * @param {IControllerConstructor<any>} target
 */
export function getForkSource(target: IControllerConstructor<any>) {
  const source = (<any>target)[FORK_TARGET];
  if (!source) {
    throw new Error(
      "astroboy.ts buildController failed: no fork source found."
    );
  }
  return source;
}

/**
 * ### 执行简单的原型拷贝
 * * 目的在于astroboy的routers在构建时会检查是否存在当前路由方法
 * * 返回的DI_CONTROLLER不存在相关函数信息，会报错
 * * 再运行时，执行的是真实的控制器对象上的逻辑
 * @param DI_CONTROLLER DI控制器构造函数
 * @param target 真实控制器构造函数
 */
export function copyPrototype<T>(
  DI_CONTROLLER: Constructor<any>,
  target: Constructor<T>
) {
  Object.getOwnPropertyNames(target.prototype).forEach(name => {
    Object.defineProperty(
      DI_CONTROLLER.prototype,
      name,
      Object.getOwnPropertyDescriptor(target.prototype, name)!
    );
  });
  // @ts-ignore
  DI_CONTROLLER.prototype.__proto__ = target.prototype.__proto__;
  // @ts-ignore
  DI_CONTROLLER.__proto__ = target.__proto__;
}

/**
 * ## 构建路由
 * * 等效astroboy-router的createRouter方法
 * @description
 * @author Big Mogician
 * @export
 * @template T
 * @param {ControllerConstructor<T>} ctor
 * @param {string} name
 * @param {string} root
 * @returns
 */
export function buildRouter<T>(
  ctor: IControllerConstructor<T>,
  name: string,
  root: string
) {
  return createRouter(getForkSource(ctor), name, root);
}
