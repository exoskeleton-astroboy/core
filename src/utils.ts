import {
  ConfigsCollection,
  Constructor,
  DIContainer,
  getDependencies,
  PARAMS_META_KEY,
  ScopeID,
  TYPE_META_KEY
} from "@bonbons/di";
import get from "lodash/get";
import isPlainObject from "lodash/isPlainObject";
import merge from "lodash/merge";
import reduce from "lodash/reduce";
import uuid from "uuid/v4";
import { InjectService } from "./services/Injector";
import { IContext } from "./typings/IContext";

export const Colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  white: "\x1b[37m"
};

export type PartReset<T, SKIP, ADD extends {} = {}> = {
  [key in Exclude<keyof (T & ADD), keyof SKIP>]: (T & ADD)[key];
};

export type ChangeReturn<T, RETURN> = {
  [key in keyof T]: T[key] extends (...args: infer P) => infer R
    ? (...params: P) => RETURN
    : T[key];
};

export function fullText(v: any, n = 24) {
  const len = String(v).length;
  if (len > n - 1) {
    return String(v).substr(0, n - 2) + "+";
  }
  return String(v) + Array(n - len).join(" ");
}

export function setColor(name: keyof typeof Colors, value: any): string {
  return `${Colors[name]}${value}${Colors.reset}`;
}

export const GlobalDI = new DIContainer<ScopeID, { ctx: any }>();

export function setScopeId(ctx: IContext) {
  const state = ctx.state || (ctx.state = {});
  return (state["$$scopeId"] = Symbol(""));
}

export function setScopeTraceId(ctx: IContext) {
  const state = ctx.state || (ctx.state = {});
  return (state["$$scopeTraceId"] = uuid());
}

export function getScopeId(ctx: IContext, short?: boolean): ScopeID {
  if (!short) return get(ctx, "state['$$scopeId']");
  return getShortScopeId(getScopeId(ctx, false));
}

export function getShortScopeId(scopeId: ScopeID): ScopeID {
  return (scopeId || "").toString().split("-")[0];
}

export function getInjector(ctx: IContext) {
  return GlobalDI.get(InjectService, getScopeId(ctx));
}

export function resolveDepts<T>(target: Constructor<T>, ctx: IContext) {
  return GlobalDI.getDepedencies(
    getDependencies(target) || [],
    getScopeId(ctx)
  );
}

export function createInstance<T>(target: Constructor<T>, ctx: IContext) {
  return new target(...resolveDepts(target, ctx));
}

export function optionAssign(
  configs: ConfigsCollection,
  token: any,
  newValue: any
) {
  return isCustomClassInstance(newValue || {})
    ? newValue
    : merge({}, configs.get(token) || {}, newValue);
}

export function isCustomClassInstance(obj: any, type?: any) {
  return !type
    ? getPrototypeConstructor(obj) !== Object
    : getPrototypeConstructor(obj) === type;
}

export function getPrototypeConstructor(obj: any) {
  const proto = Object.getPrototypeOf(obj);
  return proto && proto.constructor;
}

export function getMethodParamsType(prototype: any, propertyKey: string) {
  return Reflect.getMetadata(PARAMS_META_KEY, prototype, propertyKey) || [];
}

export function getPropertyType(prototype: any, propertyKey: string) {
  return (
    Reflect.getMetadata(TYPE_META_KEY, prototype, propertyKey) || undefined
  );
}

export function resolveKeys(
  resolver: (k: string) => string,
  value: any,
  deep = true
) {
  let res: any;
  if (Array.isArray(value) && value.length > 0) {
    res = [];
  } else if (isPlainObject(value) && Object.keys(value).length > 0) {
    res = {};
  } else {
    return value;
  }
  return reduce(
    value,
    (result, val, key) => {
      if (deep) {
        val = resolveKeys(resolver, val);
      }
      const newKey = typeof key === "string" ? resolver(key) : key;
      result[newKey] = val;
      return result;
    },
    res
  );
}
