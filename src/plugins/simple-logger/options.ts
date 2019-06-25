import { SimpleLogLevel } from "./base";
import { createOptions } from "../../typings/IConfigs";

export interface ISimpleLoggerOptions {
  level: SimpleLogLevel | number;
}

export const defaultSimpleLoggerOptions: ISimpleLoggerOptions = {
  level: SimpleLogLevel.WARN
};

export const SIMPLE_LOGGER_OPTIONS = createOptions<ISimpleLoggerOptions>(
  "SIMPLE_LOGGER_OPTIONS"
);
