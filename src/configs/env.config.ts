import { createConfig } from "../typings/IConfigs";

interface IENV {
  /** 设置DI解析的模式，默认：`'native'` */
  diType: "native" | "proxy";
  /** 运行环境，默认：`'development'` */
  env: string;
}

export const defaultEnv: IENV = {
  diType: "native",
  env: "development"
};

/** astroboy.ts环境变量 */
export const ENV = createConfig<IENV>("@astroboy.ts");
