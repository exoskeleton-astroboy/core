import chalk from "chalk";
import { Injectable } from "../../decorators/injectable";
import { Configs } from "../../services/Configs";
import { SimpleLogLevel } from "./base";
import { ISimpleLoggerOptions, SIMPLE_LOGGER_OPTIONS } from "./options";

// tslint:disable: no-console

function createStamp(date?: Date): string {
  const tData = date || new Date();
  const mili = tData.getMilliseconds();
  return `[${chalk.cyan(
    `${tData.toLocaleDateString()} ${tData.toLocaleTimeString()}:${
      mili < 10 ? `00${mili}` : mili < 100 ? `0${mili}` : mili
    }`
  )}]-`;
}

function createType(type: SimpleLogLevel): string {
  let color: string;
  let tps: string;
  switch (type) {
    case SimpleLogLevel.FATAL:
    case SimpleLogLevel.ERROR:
      [color, tps] = ["red", "ERROR"];
      break;
    case SimpleLogLevel.WARN:
      [color, tps] = ["yellow", "WARN"];
      break;
    case SimpleLogLevel.INFO:
      [color, tps] = ["blue", "INFO"];
      break;
    case SimpleLogLevel.DEBUG:
      [color, tps] = ["green", "DEBUG"];
      break;
    default:
      [color, tps] = ["white", "TRACE"];
  }
  return `[${(<any>chalk)[color](tps)}]-`;
}

@Injectable()
export class SimpleLogger {
  private pkgEnv: ISimpleLoggerOptions;

  constructor(private configs: Configs) {
    this.pkgEnv = this.configs.get(SIMPLE_LOGGER_OPTIONS);
  }

  public trace(title: string): void;
  public trace(title: string, details: any): void;
  public trace(...msg: any[]) {
    return this.log(SimpleLogLevel.TRACE, ...msg);
  }

  public debug(title: string): void;
  public debug(title: string, details: any): void;
  public debug(...msg: any[]) {
    return this.log(SimpleLogLevel.DEBUG, ...msg);
  }

  public info(title: string): void;
  public info(title: string, details: any): void;
  public info(...msg: any[]) {
    return this.log(SimpleLogLevel.INFO, ...msg);
  }

  public warn(title: string): void;
  public warn(title: string, details: any): void;
  public warn(...msg: any[]) {
    return this.log(SimpleLogLevel.WARN, ...msg);
  }

  public error(title: string): void;
  public error(title: string, details: any): void;
  public error(...msg: any[]) {
    return this.log(SimpleLogLevel.ERROR, ...msg);
  }

  public fatal(title: string): void;
  public fatal(title: string, details: any): void;
  public fatal(...msg: any[]) {
    return this.log(SimpleLogLevel.FATAL, ...msg);
  }

  private log(level: SimpleLogLevel, ...args: any[]) {
    if (level < this.pkgEnv.level) return;
    const [title, details] = args;
    console.log(`${createStamp()}${createType(level)}${title}`);
    if (details) {
      console.log(details);
    }
  }
}
