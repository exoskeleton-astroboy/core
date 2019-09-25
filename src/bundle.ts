import { Constructor, DIContainer } from "@bonbons/di";
import { IExoServer } from "./server/contract";
import { ChangeReturn, PartReset } from "./utils";

type ServerBundle = PartReset<IExoServer, { run: any }>;
type InnerBundle = ServerBundle & {
  "@global": DIContainer<any>;
  "@options": [any, any?][];
  "@singletons": [Constructor<any>, any?][];
  "@scopeds": [Constructor<any>, any?][];
  "@uniques": [Constructor<any>, any?][];
};
/**
 * ## DI Bundles
 * * 导入并移动使用DI容器的注册api
 * * 和普通注入项解析方式相同
 */
export const Bundles: ChangeReturn<ServerBundle, ServerBundle> = {
  option(...args: any[]): ServerBundle {
    (Bundles as any)["@options"].push(args);
    return Bundles as any;
  },
  scoped(...args: any[]): ServerBundle {
    (Bundles as any)["@scopeds"].push(args);
    return Bundles as any;
  },
  singleton(...args: any[]): ServerBundle {
    (Bundles as any)["@singletons"].push(args);
    return Bundles as any;
  },
  unique(...args: any[]): ServerBundle {
    (Bundles as any)["@uniques"].push(args);
    return Bundles as any;
  },
  "@options": [],
  "@singletons": [],
  "@scopeds": [],
  "@uniques": []
} as any;
export const InnerBundle: InnerBundle = Bundles as any;
