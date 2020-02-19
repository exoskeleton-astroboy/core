/** 表示一个异步过程 */
export type Async<T> = T | Promise<T>;

export interface IGlobalViewEngine {
  render(
    path: string,
    state?: Record<string, any>,
    configs?: any
  ): Async<string>;
  renderString(
    path: string,
    state?: Record<string, any>,
    configs?: any
  ): Async<string>;
}

export interface IViewEngine extends IGlobalViewEngine {
  render(path: string, configs: any): Async<string>;
  renderString(path: string, configs: any): Async<string>;
}
