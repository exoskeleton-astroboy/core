import {
  AbstractType,
  Constructor,
  DIContainer,
  IConfigCollection,
  ImplementType,
  ScopeID
} from "@bonbons/di";
import { SimpleLogger } from "../plugins/simple-logger";
import { IConfigToken } from "../typings/IConfigs";

export type DIPair = [any, any];
export type DependencyFactory<DEPTS, T> =
  | [DEPTS, (...args: any[]) => T]
  | (() => T);

export interface IExoServer {
  option<T>(token: IConfigToken<T>, value: Partial<T>, merge?: boolean): this;
  scoped<TInject>(srv: Constructor<TInject>): this;
  scoped<TToken, TImplement>(
    token: AbstractType<TToken>,
    srv: ImplementType<TImplement>
  ): this;
  scoped<TToken, TImplement, DEPTS extends Constructor<any>[] = []>(
    token: AbstractType<TToken>,
    srv: DependencyFactory<DEPTS, TImplement>
  ): this;
  scoped<TToken, TImplement>(
    token: AbstractType<TToken>,
    srv: TImplement
  ): this;
  singleton<TInject>(srv: Constructor<TInject>): this;
  singleton<TToken, TImplement>(
    token: AbstractType<TToken>,
    srv: ImplementType<TImplement>
  ): this;
  singleton<TToken, TImplement, DEPTS extends Constructor<any>[] = []>(
    token: AbstractType<TToken>,
    srv: DependencyFactory<DEPTS, TImplement>
  ): this;
  singleton<TToken, TImplement>(
    token: AbstractType<TToken>,
    srv: TImplement
  ): this;
  unique<TInject>(srv: Constructor<TInject>): this;
  unique<TToken, TImplement>(
    token: AbstractType<TToken>,
    srv: ImplementType<TImplement>
  ): this;
  unique<TToken, TImplement, DEPTS extends Constructor<any>[] = []>(
    token: AbstractType<TToken>,
    srv: DependencyFactory<DEPTS, TImplement>
  ): this;
  unique<TToken, TImplement>(
    token: AbstractType<TToken>,
    srv: TImplement
  ): this;
  run(
    events?: Partial<{
      onStart: (app: any) => void;
      onError: (error: any, ctx: any) => void;
    }>
  ): void;
}

export interface IInternalExoServer extends IExoServer {
  di: DIContainer<ScopeID>;
  configs: IConfigCollection;
  logger: SimpleLogger;
}
