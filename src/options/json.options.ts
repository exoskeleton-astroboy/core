import { createOptions } from "../typings/IConfigs";

/**
 * ## 配置JsonResult的解析方式
 * @description
 * @author Big Mogician
 * @export
 * @interface JsonResultOptions
 */
export interface IJsonResultOptions {
  /** 是否进行格式化 - 默认：`false` */
  format: boolean;
  /** 格式化空格数量 - 默认：`2` */
  whiteSpace: 0 | 1 | 2 | 4;
  /** 对象键值处理函数 - 默认：`undefined` */
  keyResolver?: (key: string) => string;
  /** json模板 - 默认：`undefined` */
  jsonTemplate?: { [prop: string]: any };
  /** json模板上写入内容的字段位置 - 默认：`undefined` */
  jsonTplKey?: string;
}

export const defaultJsonResultOptions: IJsonResultOptions = {
  format: false,
  whiteSpace: 2,
  keyResolver: undefined,
  jsonTemplate: undefined,
  jsonTplKey: undefined
};

export const JSON_RESULT_OPTIONS = createOptions<IJsonResultOptions>(
  "JSON_RESULT_OPTIONS"
);
