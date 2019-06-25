import camel from "camelcase";
import decamel from "decamelize";
import set from "lodash/set";
import {
  IJsonResultOptions,
  JSON_RESULT_OPTIONS
} from "../options/json.options";
import { IResult, IResultScope } from "../typings/IResult";
import { resolveKeys } from "../utils";

/**
 * ## Body序列化约定实现
 * * 按照约定将内容序列化到body响应中
 * @description
 * @author Big Mogician
 * @export
 * @class JsonResult
 * @implements {IResult}
 */
export class JsonResult implements IResult {
  constructor(
    private value: any,
    private configs?: Partial<IJsonResultOptions>
  ) {}

  /**
   * ### 将json对象序列化写入body
   * * @框架调用方法，请勿手动调用
   * @description
   * @author Big Mogician
   * @param {IResultScope} { configs }
   * @returns {string}
   * @memberof JsonResult
   */
  public toResult({ configs }: IResultScope): string {
    const {
      format,
      whiteSpace: b,
      keyResolver: r,
      jsonTemplate: tpl,
      jsonTplKey: tplKey
    } = {
      ...configs.get(JSON_RESULT_OPTIONS),
      ...this.configs
    };
    let value = this.value || {};
    if (tpl) {
      const n = { ...tpl };
      if (tplKey) set(n, tplKey, value);
      value = n;
    }
    return JSON.stringify(
      !r ? value : resolveKeys(r, value),
      null,
      decideWhiteSpace(format, b)
    );
  }
}

function decideWhiteSpace(format: boolean, b: 0 | 1 | 2 | 4) {
  if (!format) return "";
  switch (b) {
    case 4:
      return "    ";
    case 2:
      return "  ";
    case 1:
      return " ";
    case 0:
      return "";
    default:
      return "";
  }
}

function camelCase(key: string) {
  return camel(key);
}

function snakeCase(key: string) {
  return decamel(key, "_");
}

export const JsonResolvers = {
  camelcase: camelCase,
  snakecase: snakeCase
};
