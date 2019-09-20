import { createOptions } from "../typings/IConfigs";

export interface IScopeTraceOptions {
  enabled: boolean;
}

export const defaultScopeTraceOptions: IScopeTraceOptions = {
  enabled: false
};

export const SCOPE_TRACE_OPTIONS = createOptions<IScopeTraceOptions>(
  "SCOPE_TRACE"
);
