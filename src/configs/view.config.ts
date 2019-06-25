import { createConfig } from "../typings/IConfigs";

/**
 * Astroboy的配置的view结构
 * @description
 * @author Big Mogician
 * @interface IView
 */
interface IView {
  cache: boolean;
  root: string;
  defaultExtension: string;
  defaultViewEngine: string;
  mapping: { [prop: string]: any };
}

export const defaultView: Partial<IView> = {};

/** astroboy view config */
export const CONFIG_VIEW = createConfig<IView>("view");
