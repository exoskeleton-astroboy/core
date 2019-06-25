import { InjectDIToken, ReadonlyDIContainer, ScopeID } from "@bonbons/di";

// tslint:disable-next-line: no-namespace
export namespace InjectService {
  // tslint:disable-next-line: interface-name
  export interface Contract extends ReadonlyDIContainer {
    readonly scopeId: ScopeID;
  }
}

/**
 * ## 依赖注入服务
 * * 手动注入器
 * @description
 * @author Big Mogician
 * @export
 * @abstract
 * @class InjectService
 */
export abstract class InjectService implements InjectService.Contract {
  public abstract readonly scopeId: ScopeID;
  /**
   * ### 解析并获得类型实例
   * * 有可能为null
   * @description
   * @author Big Mogician
   * @abstract
   * @template T
   * @param {InjectDIToken<T>} token
   * @returns {T}
   * @memberof InjectService
   */
  public abstract get<T>(token: InjectDIToken<T>): T;
  protected abstract INTERNAL_dispose(): void;
}

/**
 * ## 创建DI多重继承
 * * Proxy实现，只适合作为顶层服务存在
 * * 自定义多重先祖的优先级顺序
 * * 手动实现重载逻辑(如有必要)
 * * 不支持`deleteProperty`,`defineProperty`
 * * 不要使用`prop in object`来检查属性
 * * 不支持`toString`
 * * 不支持序列化
 * @description
 * @author Big Mogician
 * @export
 * @template T 对象DI类型
 * @param {T} target 当前对象
 * @param {string[]} depts 所有祖先实例在内部的字段名
 */
export function createInjectMixin<T extends object>(
  target: T,
  depts: string[]
): T;
export function createInjectMixin<T extends object, P1>(
  target: T,
  ...depts: [P1]
): T & P1;
export function createInjectMixin<T extends object, P1, P2>(
  target: T,
  ...depts: [P1, P2]
): T & P1 & P2;
export function createInjectMixin<T extends object, P1, P2, P3>(
  target: T,
  ...depts: [P1, P2, P3]
): T & P1 & P2 & P3;
export function createInjectMixin<T extends object, P1, P2, P3, P4>(
  target: T,
  ...depts: [P1, P2, P3, P4]
): T & P1 & P2 & P3 & P4;
export function createInjectMixin<T extends object>(
  target: T,
  ...depts: any[]
): T;
export function createInjectMixin(...args: any[]) {
  const [target, ...others] = args;
  if (others[0] instanceof Array) {
    return createProxyByKeys(target, others[0]);
  } else {
    return createProxyByDepts(target, others);
  }
}

function createProxyByDepts<T extends object>(tgt: T, depts: any[]) {
  return new Proxy(tgt, {
    get(target: any, key: string) {
      if (target[key]) return target[key];
      for (const current of depts) {
        if (current[key]) return current[key];
      }
      return undefined;
    },
    set(target: any, key: string, value: any) {
      if (target[key]) return (target[key] = value);
      for (const current of depts) {
        if (current[key]) {
          current[key] = value;
          return true;
        }
      }
    },
    deleteProperty(target: any, key: string) {
      throw new Error("Action [deleteProperty] of DI-Mixin is invalid.");
    },
    enumerate(target: any) {
      const ms = Object.assign({}, target, ...depts);
      return Object.keys(ms);
    },
    ownKeys(target: any) {
      const ms = Object.assign({}, target, ...depts);
      return Object.keys(ms);
    },
    has(target: any, key: string) {
      let has = key in target;
      if (has) return true;
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < depts.length; index++) {
        has = depts[index] in depts[index];
        if (has) return true;
      }
      return false;
    },
    defineProperty(target: any, key: string, descriptor: any) {
      throw new Error("Action [defineProperty] of DI-Mixin is invalid.");
    }
  });
}

function createProxyByKeys<T extends object>(tgt: T, depts: string[]) {
  return new Proxy(tgt, {
    get(target: any, key: string) {
      if (target[key]) return target[key];
      for (const dep of depts) {
        const current = target[dep];
        if (current[key]) return current[key];
      }
      return undefined;
    },
    set(target: any, key: string, value: any) {
      if (target[key]) return (target[key] = value);
      for (const dep of depts) {
        const current = target[dep];
        if (current[key]) {
          current[key] = value;
          return true;
        }
      }
    },
    deleteProperty(target: any, key: string) {
      throw new Error("Action [deleteProperty] of DI-Mixin is invalid.");
    },
    enumerate(target: any) {
      const ms = Object.assign({}, target, ...depts.map(i => target[i]));
      return Object.keys(ms);
    },
    ownKeys(target: any) {
      const ms = Object.assign({}, target, ...depts.map(i => target[i]));
      return Object.keys(ms);
    },
    has(target: any, key: string) {
      let has = key in target;
      if (has) return true;
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < depts.length; index++) {
        has = depts[index] in target[depts[index]];
        if (has) return true;
      }
      return false;
    },
    defineProperty(target: any, key: string, descriptor: any) {
      throw new Error("Action [defineProperty] of DI-Mixin is invalid.");
    }
  });
}
