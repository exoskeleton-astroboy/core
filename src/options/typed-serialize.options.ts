import { createOptions } from "../typings/IConfigs";
import { IStaticTypedResolver } from "../typings/IStaticTypeResolver";

export const STATIC_RESOLVER = createOptions<IStaticTypedResolver>(
  "STATIC_RESOLVER"
);
