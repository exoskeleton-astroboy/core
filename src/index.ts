import Astroboy = require("astroboy");

export * from "./decorators";
export * from "./middlewares";
export * from "./services/Injector";
export * from "./services/Context";
export * from "./services/BaseClass";
export * from "./services/AstroboyContext";
export * from "./services/AstroboyApp";
export * from "./services/Render";
export * from "./services/ConfigReader";
export * from "./services/ProcedureQueue";
export * from "./server";
export * from "./configs";
export * from "./typings/IConfigs";
export * from "./typings/IContext";
export * from "./typings/IResult";
export * from "./typings/IViewEngine";
export * from "./typings/IConfigCompiler";
export * from "./typings/IStaticTypeResolver";
export * from "./results/json";
export * from "./results/render";

export { Bundles } from "./bundle";

export {
  TypedSerializer,
  Serialize,
  Deserialize,
  Extends
} from "./plugins/typed-serializer";
export { NUNJUNKS_OPTIONS } from "./plugins/nunjunks";
export { SIMPLE_LOGGER_OPTIONS } from "./plugins/simple-logger";

export { Configs, InjectScope } from "./services/Configs";

export {
  GLOBAL_ERROR,
  JSON_RESULT_OPTIONS,
  RENDER_RESULT_OPTIONS,
  STATIC_RESOLVER,
  IJsonResultOptions as JsonResultOptions,
  IRenderResultOptions as RenderResultOptions
} from "./options";

export { Astroboy };
