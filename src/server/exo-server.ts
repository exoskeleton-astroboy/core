import {
  Constructor,
  DIContainer,
  Injector,
  InjectScope,
  ReadonlyDIContainer,
  ScopeID
} from "@bonbons/di";
import Astroboy from "astroboy";
import Koa from "koa";
import { InnerBundle } from "../bundle";
import { CONFIG_VIEW, defaultEnv, defaultView, ENV } from "../configs";
import {
  defaultGlobalError,
  defaultJsonResultOptions,
  defaultRenderResultOptions,
  defaultScopeTraceOptions,
  GLOBAL_ERROR,
  JSON_RESULT_OPTIONS,
  RENDER_RESULT_OPTIONS,
  SCOPE_TRACE_OPTIONS,
  STATIC_RESOLVER
} from "../options";
import {
  defaultNunjunksOptions,
  NUNJUNKS_OPTIONS,
  NunjunksEngine
} from "../plugins/nunjunks";
import {
  defaultSimpleLoggerOptions,
  SIMPLE_LOGGER_OPTIONS,
  SimpleLogger
} from "../plugins/simple-logger";
import { TypedSerializer } from "../plugins/typed-serializer";
import { AstroboyContext } from "../services/AstroboyContext";
import { ConfigReader } from "../services/ConfigReader";
import { Configs, RealConfigCollection } from "../services/Configs";
import { Context } from "../services/Context";
import { InjectService } from "../services/Injector";
import { Render } from "../services/Render";
import { Scope } from "../services/Scope";
import { getScopeId, GlobalDI, optionAssign } from "../utils";
import { DIPair, IExoServer } from "./contract";
import { logActions } from "./log";

// tslint:disable: member-ordering

/**
 * ## astroboy.ts服务
 * @description
 * @module Server
 * @author Big Mogician
 * @export
 * @class Server
 */
export class ExoServer implements IExoServer {
  private di = GlobalDI;
  private configs = new RealConfigCollection();
  private logger!: SimpleLogger;

  private preSingletons: DIPair[] = [];
  private preScopeds: DIPair[] = [];
  private preUniques: DIPair[] = [];

  private appBuilder!: Constructor<any>;
  private appConfigs!: any;

  constructor();
  constructor(appBuilder: Constructor<any>);
  constructor(appConfigs: any);
  constructor(appBuilder: Constructor<any>, appConfigs: any);
  constructor(...args: any[]) {
    const [ctor, configs] = args;
    if (!ctor) {
      this.appBuilder = Astroboy;
    } else if (ctor.prototype === undefined) {
      this.appBuilder = Astroboy;
      this.appConfigs = ctor;
    } else {
      this.appBuilder = ctor;
      this.appConfigs = configs;
    }
    this.preInit();
  }

  public option(...args: any[]): this {
    const [e1, e2, mergeAllow = true] = args;
    if (!e1) {
      throw new Error(
        "DI token or entry is empty, you shouldn't call server.option(...) without any param."
      );
    }
    this.configs.set(e1, optionAssign(this.configs, e1, e2 || {}, mergeAllow));
    return this;
  }

  public scoped(...args: any[]): this {
    return this.preInject(InjectScope.Scope, <any>args);
  }

  public singleton(...args: any[]): this {
    return this.preInject(InjectScope.Singleton, <any>args);
  }

  public unique(...args: any[]): this {
    return this.preInject(InjectScope.New, <any>args);
  }

  public run(
    events?: Partial<{
      onStart: (
        app: any,
        injector: Readonly<ReadonlyDIContainer<ScopeID>>
      ) => void;
      onError: (error: any, injector: InjectService) => void;
    }>
  ) {
    this.init();
    this.finalInjectionsInit();
    this.startApp(events);
  }

  //#region 支持继承树覆写和扩展

  /**
   * ## 初始化Configs配置
   * * 🌟 在继承树中重载此方法以进行框架扩展
   * * 在 `Server.prototype.initInjections` 函数之前执行
   *
   * @author Big Mogician
   * @protected
   * @memberof Server
   */
  protected initOptions() {
    this.option(ENV, defaultEnv);
    this.option(CONFIG_VIEW, defaultView);
    this.option(JSON_RESULT_OPTIONS, defaultJsonResultOptions);
    this.option(RENDER_RESULT_OPTIONS, defaultRenderResultOptions);
    this.option(STATIC_RESOLVER, TypedSerializer);
    this.option(NUNJUNKS_OPTIONS, defaultNunjunksOptions);
    this.option(SIMPLE_LOGGER_OPTIONS, defaultSimpleLoggerOptions);
    this.option(SCOPE_TRACE_OPTIONS, defaultScopeTraceOptions);
    this.option(GLOBAL_ERROR, defaultGlobalError);
  }

  /**
   * ## 初始化DI注入关系配置
   * * 🌟 在继承树中重载此方法以进行框架扩展
   * * 在 `Server.prototype.initOptions` 函数之后执行
   *
   * @author Big Mogician
   * @protected
   * @memberof Server
   */
  protected initInjections() {
    // 不允许装饰器复写
    this.scoped(AstroboyContext);
    this.scoped(Scope);
    this.scoped(ConfigReader);
    this.singleton(SimpleLogger);
    // 允许被装饰器复写
    this.directInject(InjectScope.Scope, [NunjunksEngine]);
    this.directInject(InjectScope.Scope, [Render]);
  }

  /**
   * ## 处理合并与接受configs配置
   *
   * @author Big Mogician
   * @protected
   * @param {any} [configs={}] app.configs
   * @memberof Server
   */
  protected readConfigs(configs: any = {}) {
    this.configs.toArray().forEach(({ token }) => {
      const key = token.key.toString();
      if (/Symbol\(config::(.+)\)$/.test(key)) {
        this.option(token, configs[RegExp.$1] || {});
      }
    });
  }

  /**
   * ## 处理运行时参数
   *
   * @author Big Mogician
   * @protected
   * @template A extends Koa
   * @param {Koa} app
   * @memberof Server
   */
  protected readRuntimeEnv<A extends Koa>(app: A) {
    this.option(ENV, { env: app.env || "development" });
  }

  /**
   * ## 按照配置设置DI的解析方式
   * - `native` : 原生模式，最高的还原度，没有黑盒
   * - `proxy` : Proxy代理模式，追求更高性能的惰性解析
   * @description
   * @author Big Mogician
   * @protected
   * @memberof Server
   */
  protected resetDIResolver() {
    const { diType } = this.configs.get(ENV);
    this.di.resetConfigs({ type: diType });
  }

  /**
   * ## 解析Bundles
   *
   * @author Big Mogician
   * @protected
   * @memberof Server
   */
  protected resolveBundles() {
    InnerBundle["@singletons"].forEach(args => this.singleton(...args));
    InnerBundle["@scopeds"].forEach(args => this.scoped(...args));
    InnerBundle["@uniques"].forEach(args => this.unique(...args));
    InnerBundle["@options"].forEach(args => this.option(...args));
  }

  /**
   * ## 完成DI容器初始化并锁定
   * @description
   * @author Big Mogician
   * @protected
   * @memberof Server
   */
  protected resolveInjections() {
    this.preSingletons.forEach(([token, srv]) =>
      this.sendInjection(token, srv, InjectScope.Singleton)
    );
    this.preScopeds.forEach(([token, srv]) =>
      this.sendInjection(token, srv, InjectScope.Scope)
    );
    this.preUniques.forEach(([token, srv]) =>
      this.sendInjection(token, srv, InjectScope.New)
    );
    this.di.complete();
  }

  /**
   * ## Init函数，在服务启动时触发
   * 🌟 在继承树中重载此方法以进行框架扩展
   * * 在基础依赖注入功能完成之前执行
   *
   * @author Big Mogician
   * @protected
   * @memberof Server
   */
  protected init() {}

  //#endregion

  private preInit() {
    this.initOptions();
    this.initInjections();
  }

  private finalInjectionsInit() {
    this.initConfigCollection();
    this.initInjectService();
    this.initContextProvider();
  }

  private startApp(
    events?: Partial<{
      onStart: (
        app: any,
        injector: Readonly<ReadonlyDIContainer<ScopeID>>
      ) => void;
      onError: (error: any, injector: InjectService) => void;
    }>
  ) {
    const { onStart = undefined, onError = undefined } = events || {};
    new (this.appBuilder || Astroboy)(this.appConfigs || {})
      .on("start", (app: Koa) => {
        logActions(this, [
          () => (this.logger = new SimpleLogger(this.configs)),
          () => {
            this.readConfigs((app as any)["config"]);
            this.readRuntimeEnv(app);
          },
          () => this.resetDIResolver(),
          () => {
            this.resolveBundles();
            this.resolveInjections();
          },
          () => onStart && onStart(app, { get: this.di.get.bind(this) })
        ]);
      })
      .on("error", (error: any, ctx: any) => {
        const scopeId = getScopeId(ctx);
        const injector = this.di.get(InjectService, scopeId);
        onError && onError(error, injector);
      });
  }

  /** 预注册，会覆盖装饰器的定义注册 */
  private preInject(type: InjectScope, service: Constructor<any>): this;
  private preInject(
    type: InjectScope,
    tokenImplement: [Constructor<any>, any]
  ): this;
  private preInject(type: InjectScope, p: any | [any, any]) {
    const args = p instanceof Array ? p : [p, p];
    switch (type) {
      case InjectScope.Scope:
        this.preScopeds.push([args[0], args[1] || args[0]]);
        break;
      case InjectScope.Singleton:
        this.preSingletons.push([args[0], args[1] || args[0]]);
        break;
      default:
        this.preUniques.push([args[0], args[1] || args[0]]);
        break;
    }
    return this;
  }

  /** 直接注册，允许`@Injectable()`装饰器之后进行定义复写 */
  private directInject(type: InjectScope, service: [Constructor<any>]): this;
  private directInject(
    type: InjectScope,
    tokenImplement: [Constructor<any>, any]
  ): this;
  private directInject(type: InjectScope, args: [any] | [any, any]) {
    switch (type) {
      case InjectScope.Scope:
        this.sendInjection(args[0], args[1] || args[0], InjectScope.Scope);
        break;
      case InjectScope.Singleton:
        this.sendInjection(args[0], args[1] || args[0], InjectScope.Singleton);
        break;
      default:
        this.sendInjection(args[0], args[1] || args[0], InjectScope.New);
        break;
    }
    return this;
  }

  /**
   * DI项最终注册登记
   *
   * @author Big Mogician
   * @private
   * @param {any} token
   * @param {any} inject
   * @param {InjectScope} scope
   * @returns
   * @memberof Server
   */
  private sendInjection(token: any, inject: any, scope: InjectScope) {
    let [depts, imp] = inject instanceof Array ? inject : [undefined, inject];
    if (!imp && DIContainer.isFactory(depts)) {
      imp = depts;
      depts = undefined;
    }
    return this.di.register({
      token,
      depts,
      imp,
      scope
    });
  }

  /**
   * ## 初始化上下文服务
   * @description
   * @author Big Mogician
   * @private
   * @memberof Server
   */
  private initContextProvider() {
    this.scoped(Context, (scopeId?: ScopeID, { ctx = null }: any = {}) => {
      if (ctx === null) {
        throw new Error(
          "invalid call, you can only call a context in request pipe scope."
        );
      }
      return new Context(ctx);
    });
  }

  /**
   * ## 初始化手工注入服务
   * * 可以自举
   * @description
   * @author Big Mogician
   * @private
   * @memberof Server
   */
  private initInjectService() {
    // this.scoped(InjectService, (scopeId?: ScopeID) => ({
    //   get: (token: InjectToken<any>) => this.di.get(token, scopeId),
    //   INTERNAL_dispose: () => this.di.dispose(scopeId),
    //   scopeId
    // }));
    // 替换原来的InjectService，使用di提供的原生Injector
    this.scoped(InjectService, [[Injector], (injector: Injector) => injector]);
  }

  /**
   * ## 注入全局配置容器服务
   * @description
   * @author Big Mogician
   * @private
   * @memberof Server
   */
  private initConfigCollection() {
    this.singleton(Configs, () => ({
      get: this.configs.get.bind(this.configs)
    }));
  }
}
