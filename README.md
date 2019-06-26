# 🌟@exoskeleton/core

> 基于[astroboy](https://github.com/astroboy-lab/astroboy)的外骨骼

[![NPM][npm-icon]][npm-url]

[![Build status][ci-image]][ci-url]
[![Coverage Status][cover-image]][cover-url]
[![package version][pkg-url]][pkg-image]

## 已经实现的功能

- CLI 编译工具[ 实现：[@exoskeleton/cli](https://github.com/exoskeleton-astroboy/cli) ]
- 高性能依赖注入[ 实现：[@bonbons/di](https://www.npmjs.com/package/@bonbons/di) ]
- 控制器声明式路由[ 实现：[astroboy-router](https://www.npmjs.com/package/astroboy-router) ]
- 可扩展的注入式模版引擎
- 可配置容器定义化
- DI 可注入依赖实现多重继承
- Config 体系接入 DI 容器
- 配置容器对接 astroboy 标准 configs 模式
- 自动化生成 astroboy 的 routers 规范
- 命令行工具支持
- 完整兼容 astroboy 原始语义，支持任意扩展
- 支持完整依赖注入能力的高级中间件
- 路由方法返回配置接口化

> 😨 更多功能正在开发中...

### Wiki + Demo

- [Demo1:多版本并存](https://github.com/ws-node/demo.astroboy.ts) - 最大兼容预览(多重代码风格可以共存)
- [Demo2:全量 @exoskeleton/core+构建 base 项目包](https://github.com/ws-node/demo2.astroboy.ts) - base 仓库预览(构建继承 @exoskeleton/core 的 base 项目)
- [Demo3:使用 base 仓库构建应用](https://github.com/ws-node/demo3.astroboy.ts) - 最大预览(使用 base 项目构建应用)
- [GitHub Pages](https://ws-node.github.io/astroboy.ts) - @exoskeleton/core 文档

### 安装

> 先安装 @exoskeleton/cli 构建工具

```zsh
npm install astroboy @exoskeleton/core
```

```zsh
yarn add astroboy @exoskeleton/core
```

### 接入说明

#### 1. 按照 astroboy 框架要求创建应用程序目录（略）

#### 2. 调整 app.ts

```typescript
import path from "path";
import { Server, Astroboy } from "@exoskeleton/core";

// astroboy请手动安装，因为@exoskeleton/core只将其设置为开发依赖
// 未安装astroboy，会引发npm解析错误
Server.Create(Astroboy, {
  ROOT_PATH: path.resolve(__dirname, "..")
}).run({
  onStart: () => console.log("hello world!"),
  onError: err => console.log(`oh shit : ${String(err)}`)
});
```

#### 3. 配置初始化中间件

> app/middleware/server-init.ts

```typescript
import { serverInit } from "@exoskeleton/core";

export = () => serverInit;
```

> config/middleware.default.js

```javascript
module.exports = {
  "server-init": {
    priority: 0.1,
    enable: true
  }
};
```

> config/config.default.js

```javascript
/**
 * 默认配置文件
 */
const path = require("path");

module.exports = {
  "@@exoskeleton/core": {
    showTrace: false,
    diType: "native"
  }
};
```

#### 4. 启动

> 需要安装[@exoskeleton/cli](https://github.com/exoskeleton-astroboy/cli.git)使用

```zsh
# cmd：exo 或者 exoskeleton
# 本地安装@exoskeleton/core
npx exo dev --inspect --tsconfig app/tsconfig.json
# 全局装过@exoskeleton/core
exo dev --inspect --tsconfig app/tsconfig.json
```

### 开发姿势

#### 0.cli 配置文件

@exoskeleton/core 开放了一个配置文件，用来简化 cli 参数的使用，类似 webpack，可以使用--config 参数修改配置文件的名字。

> exoskeleton.config.js - 一个简单的配置文件

```javascript
const path = require("path");

module.exports = {
  tsconfig: "tsconfig.json",
  inspect: true,
  typeCheck: true,
  transpile: true,
  debug: "*",
  mock: "http://127.0.0.1:8001",
  // exoskeleton router 的命令配置
  // 编译生成routers，不再需要手动书写routers文件
  routers: {
    enabled: true,
    always: false,
    approot: "/v1",
    filetype: "ts",
    details: true
  },
  // exoskeleton-cli监控的文件修改列表，自动重启node服务
  watch: [
    path.join(__dirname, "app/**/*.*"),
    path.join(__dirname, "config/**/*.*"),
    path.join(__dirname, "plugins/**/*.*")
  ],
  // 忽略的文件列表
  ignore: [],
  // exoskeleton config 的命令配置
  // 编译ts配置文件，支持DI能力 @1.1.0 引入
  configCompiler: {
    enabled: true,
    force: true,
    configroot: "app/config",
    outputroot: "config
  }
};
```

#### 1.编写路由控制器

控制器方面使用装饰器来定制 Router 的业务层级，确定 Route 的 url 和 method，提供 params 和 body 的注入获取能力，并抽象了响应中 body 的写入能力。

> app/controllers/test.ts

```typescript
import {
  Controller,
  Configs,
  AstroboyContext,
  ENV,
  JsonResult,
  GET,
  POST,
  FromParams,
  FromBody,
  Deserialize,
  IContext
} from "@exoskeleton/core";

interface GetQuery {
  id: string;
  name: string;
  type: string;
}

interface PostData {
  id: number;
  name: string;
}

@Controller("test")
class TestController {
  // 构造函数注入能力
  constructor(
    private configs: Configs,
    private base: AstroboyContext<IContext>
  ) {}

  // GET: {项目前缀}/api/test/testGet/:type?id=xxxx&name=xxxx
  @GET("testGet/:type")
  // 显式进行params参数前提，作为路由方法参数
  // 使用接口为了更好的类型描述，不会进行任何运行时类型处理
  public methodGet(@FromParams() params: GetQuery) {
    const { ctx } = this.base;
    const { id, name, type } = params;
    ctx.type = "application/json";
    // JsonResult实现了IResult接口，提供将json内容编程化写入body的能力，同时提供了Configs容器的配置化支持
    // 你可以自己实现自定义逻辑，只要实现IResult接口即可
    return new JsonResult({
      id,
      name,
      type,
      url: ctx.url
    });
  }

  // POST: {项目前缀}/api/post/:type?id=xxxx&name=xxxx
  @POST("post/:type")
  // body也能进行相似的流程实现参数前提
  // 你仍然可以进行直接解构
  public async methodPost(
    @FromParams() params: GetQuery,
    @FromBody() { id, name }: PostData
  ) {
    const { name, id: id2, type } = params;
    return new JsonResult({
      id,
      name,
      type,
      id2,
      name
    });
  }
}

export = TestController;
```

到此一个业务路由层级的构建并没有完成，和原生 astroboy 开发类似，相应的需要一个 router 文件来创建 astroboy 的 router 数组定义。

> app/routers/test.ts

```typescript
import TEST from "../controllers/test";
import { buildRouter } from "@exoskeleton/core";

// “test”代表controllers内的文件级别
// “/v1”代表应用的路由前缀，这里只作为示例
export = buildRouter(TEST, "test", "/v1");
```

> 注：1.0.1-rc.27 版本以后已经支持自动生成 router，不需再要上述步骤，操作如下：

##### routers 预处理模式

- 使用 `@exoskeleton/cli` 提供的命令行工具

```bash
# 在开发启动或者生产打包前确保执行即可
npx exo router --always --filetype ts
```

到此一个完整的业务级别的 router 构造完成了。

#### 2.编写可注入服务

@exoskeleton/core 按照 IoC 模式的指导思路进行设计，所有的服务都应该按照 DI 的方式（无论是手动还是自动）获取、组装和构造逻辑层级。

> app/services/test.ts

```typescript
import { Injectable } from "@exoskeleton/core";

@Injectable()
class TestService {
  private value = 98765;

  public add(v: number) {
    this.value += v;
  }

  public showValue() {
    return this.value;
  }
}

export = TestService;
```

@exoskeleton/core 服务的默认行为是范围单例（scoped），简单的描述来说，一个服务在同一个请求流程中总是保持单例状态，并在请求结束后释放。scoped 服务可以在请求流程中的任意位置获取，并承担数据传输载体的职责。

你当然可以手动改变这一默认行为：

```typescript
// 请确保你了解type的含义，以免服务出现不符合预期的行为
@Injectable({ type: InjectScope.Singleton })
class Test02Service {
  ...
}
```

其他行为：

- new（每次获取总是创建一个全新的对象）
- singleton（在整个应用中保持唯一并积累副作用）

服务还具有其他高级功能（包括依赖注入分离和实现多重继承），这里不一一展开了。

#### 3.对接 astroboy 的配置

创建接口来描述 astroboy 的配置中的各个业务部分：

> config/options/demo.ts

```typescript
import { createConfig } from "@exoskeleton/core";

interface DemoOptions {
  /** ccccc */
  key01: number;
  key02: string;
}

export const DEMO_OPTIONS = createConfig<DemoOptions>("demo");
```

> config/config.default.js

```javascript
/**
 * 默认配置文件
 */
const path = require("path");

module.exports = {
  "@@exoskeleton/core": {
    showTrace: true,
    diType: "proxy"
  },

  demo: {
    key01: 12345,
    key02: "woshinidie"
  },

  strOpt: "test_string_config"
};
```

这样既可以更好的描述原本混乱的 config 文件，同时可以在对 config 访问的时候提供定义支持。

```typescript
// 注入Configs服务，然后获取配置
// opts变量将会被正确的绑定上类型信息
const opts = this.configs.get(DEMO_OPTIONS);
```

#### 4.在中间件中使用依赖注入

过程比较轻量，废话不多，直接上 demo：

> app/middlewares/demo.ts

```typescript
import { injectScope, ENV, Context } from "@exoskeleton/core";
import DataService from "../services/Data";

export = () =>
  injectScope(async ({ injector, configs, ctx, next }) => {
    // console.log(configs.get(ENV).showTrace);
    const data = injector.get(DataService);
    data.setStamp(new Date().getTime());
    await next();
    // console.log("fuck");
  });
```

##### 编译模式支持 @1.1.3-rc.16

在 `1.1.3-rc.16` 版本引入中间件编译能力，支持使用 DI 语法来直接书写中间件。

配置文件：

```javascript
const path = require("path");

// 不相关的配置信息已经隐藏
module.exports = {
  tsconfig: "tsconfig.json",
  // exo middleware 的命令配置
  // 编译ts配置文件，支持DI能力 @1.1.03-rc.16 引入
  middlewareCompiler: {
    enabled: true, // 默认：false
    force: true, // 默认：false
    root: "middlewares", // 默认位置：middlewares/*.ts
    output: "app/middlewares" // 默认输出位置：app/middlewares/*.js
  }
};
```

> middlewares/test.ts

```typescript
import { AstroboyContext } from "@exoskeleton/core";
import * as atexoskeletonc from "@exoskeleton/core";
import { testA } from "../app/utils/testA";

export default async function testMiddleware(
  context: AstroboyContext,
  injector: exoskeleton.InjectService
) {
  console.log(new Date().getTime());
  console.log(context.ctx.url);
  await testA();
  await this.next();
}
```

执行命令： `exoskeleton middleware --force`

得到结果：

> app/middlewares/test.js

```javascript
// [@exoskeleton/core] 自动生成的代码
import { injectScope, IMiddlewaresScope } from "@exoskeleton/core";
import astroboy_ts_1 = require("@exoskeleton/core");
import * as astroboy_ts_2 from "@exoskeleton/core";
import testA_1 = require("../utils/testA");
async function testMiddleware(context, injector) {
    console.log(new Date().getTime());
    console.log(context.ctx.url);
    await testA_1.testA();
    await this.next();
}
export = () => injectScope(async ({ injector, next }: IMiddlewaresScope) => {
  const _p0 = injector.get(astroboy_ts_1.AstroboyContext);
  const _p1 = injector.get(astroboy_ts_2.InjectService);
  await testMiddleware.call({ next }, _p0, _p1);
});
```

#### 5.支持 DI 的 ts 配置文件

在 `1.1.0` 版本引入配置文件编译能力，支持使用 ts 来书写 config，同时可以将类型友好的服务化配置引入 DI。

使用 `exoskeleton config --force` ，强制使用 ts 配置文件夹，覆盖原始的 config

##### 1.配置 exoskeleton.config.js

```javascript
const path = require("path");

// 不相关的配置信息已经隐藏
module.exports = {
  tsconfig: "tsconfig.json",
  // exoskeleton config 的命令配置
  // 编译ts配置文件，支持DI能力 @1.1.0 引入
  configCompiler: {
    enabled: true, // 默认：false
    force: true, // 默认：false
    configroot: "app/config", // 默认位置：app/config/**.ts
    outputroot: "config" // 默认输出位置：config/**.js
  }
};
```

##### 2.书写配置文件

下面是一个 `config.default.ts` 的例子：

> app/config/config.default.ts

```typescript
import { IStrictConfigsCompiler, ConfigReader } from "@exoskeleton/core";

type DIType = "proxy" | "native";

// 定义整个应用的config结构
export interface IConfigs {
  "@@exoskeleton/core": {
    showTrace: boolean;
    diType: DIType;
  };
  demo: {
    key01: number;
    key02: string;
  };
  strOpt: string;
  a: number;
  b: string;
  c: {
    d: boolean;
    e?: string;
  };
  f: {
    v: string;
  };
}

// 创建应用级别的DI项，可以在controller、service等地方注入使用
export class MyConfigsReader extends ConfigReader<IConfigs> {}

// 只要加上export标识，就可以输出到编译后的文件中去
export function woshinidie() {
  xFunc();
  return 123456;
}

export function xFunc() {
  console.log({
    a: 124,
    b: "sdfad"
  });
}

// 默认导出实现接口约定的类
export default function DefaultCOnfigs(): IConfigs {
  const path = require("path");
  return {
    "@@exoskeleton/core": {
      showTrace: true,
      diType: <DIType>"proxy"
    },
    demo: {
      key01: 12345,
      key02: "woshinidie"
    },
    strOpt: "test_string_config",
    a: woshinidie(),
    b: "default",
    c: {
      d: false,
      e: "352424"
    }
  };
}
```

书写一个环境 config 配置，比如 `config.dev.ts` :

> app/config/config.dev.ts

```typescript
import { IConfigs } from "./config.default";

// 使用非严格接口，只提供一部分的参数，用于覆盖
export default () => (<Partial<IConfigs>{
  b: "dev"
});
```

完成以后，在应用启动时执行：`exoskeleton config --force` :

> config/config.default.js

```javascript
// [@exoskeleton/core] 自动生成的代码
const tslib_1 = require("tslib");
const astroboy_ts_1 = require("@exoskeleton/core");
class MyConfigsReader extends astroboy_ts_1.ConfigReader {}
function woshinidie() {
  xFunc();
  return 123456;
}
function xFunc() {
  console.log({
    a: 124,
    b: "sdfad"
  });
}
module.exports = (function DefaultCOnfigs() {
  const path = require("path");
  return {
    "@@exoskeleton/core": {
      showTrace: true,
      diType: "proxy"
    },
    demo: {
      key01: 12345,
      key02: "woshinidie"
    },
    strOpt: "test_string_config",
    a: woshinidie(),
    b: "default",
    c: {
      d: false,
      e: "352424"
    }
  };
})();
```

> config/config.dev.js

```javascript
// [@exoskeleton/core] 自动生成的代码
const tslib_1 = require("tslib");
const config_default_1 = require("./config.default");
module.exports = (() => ({
  b: "dev"
}))();
```

> 文档完善中...

---

## MIT License

Copyright (c) 2018 NODE.Mogician <[bigmogician@outlook.com](bigmogician@outlook.com)>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[npm-icon]: https://nodei.co/npm/@exoskeleton/core.svg?downloads=true
[npm-url]: https://npmjs.org/package/@exoskeleton/core
[ci-image]: https://travis-ci.org/ws-node/astroboy.ts.svg?branch=master
[ci-url]: https://travis-ci.org/ws-node/astroboy.ts
[cover-image]: https://coveralls.io/repos/github/ws-node/astroboy.ts/badge.svg?branch=master
[cover-url]: https://coveralls.io/github/ws-node/astroboy.ts?branch=master
[pkg-url]: https://badge.fury.io/js/@exoskeleton/core.svg?branch=master
[pkg-image]: https://badge.fury.io/js/@exoskeleton/core.svg?branch=master
