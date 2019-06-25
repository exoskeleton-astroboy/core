/**
 * 基础configs预编译接口
 *
 * @author Big Mogician
 * @interface BaseCompiler
 * @template T
 */
export interface IBaseCompiler<T> {
  /**
   * 编译输出过程，可以是import语句，模块变量声明，函数等执行过程语句
   *
   * @author Big Mogician
   * @param {NodeJS.Process} process
   * @returns {string[]}
   * @memberof BaseCompiler
   */
  procedures?(process: NodeJS.Process): string[];
}

/**
 * 严格configs预编译接口
 * * 需要实现完整的configs接口
 * * 适合config.default.ts使用
 *
 * @author Big Mogician
 * @export
 * @interface IStrictConfigsCompiler
 * @extends {IBaseCompiler<T>}
 * @template T
 */
export interface IStrictConfigsCompiler<T> extends IBaseCompiler<T> {
  configs(process: NodeJS.Process): T;
}

/**
 * 松散configs预编译接口
 * * 需要实现部分的configs接口
 * * 适合非config.default.ts的文件使用
 *
 * @author Big Mogician
 * @export
 * @interface IConfigsCompiler
 * @extends {IBaseCompiler<T>}
 * @template T
 */
export interface IConfigsCompiler<T> extends IBaseCompiler<T> {
  configs(process: NodeJS.Process): Partial<T>;
}

export interface IConfigDefines {
  modules?: {
    [name: string]: string;
  };
  consts?: {
    [name: string]: any;
  };
  functions?: Array<(...args: any[]) => any>;
}

export interface IInnerBaseCompiler<T> extends IConfigDefines {
  prototype: IBaseCompiler<T> & { [prop: string]: any };
}
