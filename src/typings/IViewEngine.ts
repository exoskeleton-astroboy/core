/** 表示一个异步过程 */
export type Async<T> = T | Promise<T>;

export interface IViewEngine {
  render(path: string, configs: any): Async<string>;
  renderString(path: string, configs: any): Async<string>;
}
