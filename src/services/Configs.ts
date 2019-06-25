import {
  ConfigsCollection as ReadonlyConfigs,
  IConfigCollection
} from "@bonbons/di";
import { IConfigEntry, IConfigToken } from "../typings/IConfigs";

export { InjectScope } from "@bonbons/di";

export class RealConfigCollection implements IConfigCollection {
  private map = new Map<symbol, { value: any }>();

  public set<T>(token: IConfigToken<T>, entry: T) {
    this.map.set(token.key, { value: entry });
  }

  public get<T>(token: IConfigToken<T>): T {
    const entry = this.map.get(token.key);
    return entry && entry.value;
  }

  public toArray(): IConfigEntry<any>[] {
    return Array.from(this.map.entries()).map(([sb, { value }]) => ({
      token: { key: sb },
      value
    }));
  }
}

// tslint:disable-next-line: no-namespace
export namespace Configs {
  // tslint:disable-next-line: interface-name
  export interface Contract extends ReadonlyConfigs {}
}

/**
 * ## 全局配置容器
 * @description
 * @author Big Mogician
 * @export
 * @abstract
 * @class Configs
 * @implements {ReadonlyConfigs}
 */
export abstract class Configs implements Configs.Contract {
  /**
   * ### 解析并获得token对应的配置信息
   * @description
   * @author Big Mogician
   * @abstract
   * @template T
   * @param {IConfigToken<T>} token
   * @returns {T}
   * @memberof Configs
   */
  public abstract get<T>(token: IConfigToken<T>): T;
}
