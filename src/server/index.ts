import { Constructor } from "@bonbons/di";
import { IExoServer } from "./contract";
import { ExoServer } from "./exo-server";

export * from "./exo-server";
export { IExoServer } from "./contract";

export abstract class Server {
  /**
   * ### 创建一个新的应用
   * @description
   * @author Big Mogician
   * @static
   * @param {Constructor<any>?} ctor astroboy或者其继承
   * @param {*?} [configs] astroboy启动配置
   * @returns
   * @memberof Server
   */
  public static Create(): IExoServer;
  public static Create(ctor: Constructor<any>): IExoServer;
  public static Create(configs: any): IExoServer;
  public static Create(ctor: Constructor<any>, configs: any): IExoServer;
  public static Create(ctor?: Constructor<any>, configs?: any): IExoServer {
    return new ExoServer(ctor!, configs);
  }
}
