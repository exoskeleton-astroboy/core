import { DIContainer } from "@bonbons/di";
import chalk from "chalk";
import { fullText } from "../utils";
import { IExoServer, IInternalExoServer } from "./contract";

export function logActions(ctx: IExoServer, actions: (() => void)[]) {
  const [
    initLogger,
    initConfigs,
    resetDIResolver,
    resolveInjections,
    complete
  ] = actions;

  const context = <IInternalExoServer>ctx;

  initLogger();
  const logger = context["logger"];
  logger.debug(chalk.greenBright("======== ASTROBOY.TS Bootstrap ========"));
  logger.debug(chalk.yellowBright("start reading configs ... "));
  initConfigs();
  const configs = context["configs"].toArray();
  configs
    .map<[number, string]>(i => {
      const key = String(i.token.key);
      const token = key.substr(7, key.length - 8);
      return [
        token.startsWith("config::") ? 0 : 1,
        `--> [${chalk.blueBright(fullText(token, 26))}] - [${chalk.cyanBright(
          fullText(typeof i.value, 7)
        )}] - [length(keys):${chalk.cyanBright(
          fullText(Object.keys(i.value).length, 3)
        )}]`
      ];
    })
    .sort((a, b) => a[0] - b[0])
    .forEach(([, str]) => logger.debug(str));
  logger.debug("-----> DONE .");
  logger.debug(
    `Configs count: ${chalk.magentaBright(configs.length.toString())}`
  );
  resetDIResolver();
  logger.debug(chalk.yellowBright("start init DI tokens ... "));
  resolveInjections();
  const sorted = (context["di"]["sorted"] as any[])
    .map((i: any) => ({
      token: i.token.name,
      imp: i.imp,
      depts: i.depts.length,
      watch: i.watch.length,
      level: i.level
    }))
    .sort((a: any, b: any) => a.level - b.level);
  sorted.map((i: any) =>
    logger.debug(
      `--> [${fullText(`level:${i.level}`, 9)}] - [${chalk.greenBright(
        fullText(i.token, 18)
      )}] - [${
        DIContainer.isClass(i.imp)
          ? `🌟class  ${chalk.redBright(fullText(i.imp.name, 18))}`
          : DIContainer.isFactory(i.imp)
          ? `➡️arrow  ${chalk.yellowBright(fullText("Factory", 18))}`
          : `⚽️object ${chalk.blueBright(fullText("Object", 18))}`
      }] - [depts:${chalk.cyanBright(
        fullText(i.depts, 3)
      )}] - [watch:${chalk.cyanBright(fullText(i.watch, 3))}]`
    )
  );
  logger.debug("-----> DONE .");
  logger.debug(`DI count: ${chalk.magentaBright(sorted.length.toString())}`);
  logger.debug(chalk.yellowBright("start app ..."));
  logger.debug(
    chalk.greenBright("======== ASTROBOY.TS Bootstrap END ========")
  );
  complete();
}
