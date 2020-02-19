import { Environment, FileSystemLoader } from "nunjucks";
import { Injectable } from "../../decorators/injectable";
import { Configs } from "../../services/Configs";
import { Render } from "../../services/Render";
import { IViewEngine, IGlobalViewEngine } from "../../typings/IViewEngine";
import { INunjunksRenderOptions, NUNJUNKS_OPTIONS } from "./options";

@Injectable()
export class Nunjucks implements IGlobalViewEngine {
  protected get configs() {
    return (
      this["@configs"] || (this["@configs"] = this.cfg.get(NUNJUNKS_OPTIONS))
    );
  }

  protected get loader() {
    return (
      this["@loader"] ||
      (this["@loader"] = new FileSystemLoader(this.configs.root, {
        noCache: !this.configs.cache
      }))
    );
  }
  private "@configs": INunjunksRenderOptions;
  private "@loader": FileSystemLoader;

  constructor(private cfg: Configs) {}

  protected createEnv(configs?: INunjunksRenderOptions) {
    return new Environment(
      this.loader,
      !configs ? this.configs : { ...this.configs, ...configs }
    );
  }

  public async render(
    name: string,
    state: Record<string, any>,
    configs?: any
  ): Promise<string> {
    return this.createEnv(configs || {}).render(name, state || {});
  }

  public async renderString(
    tpl: string,
    state: Record<string, any>,
    configs?: any
  ): Promise<string> {
    return this.createEnv(configs || {}).renderString(tpl, state || {});
  }
}

@Injectable()
export class NunjunksEngine extends Nunjucks implements IViewEngine {
  constructor(cfg: Configs, private rs: Render) {
    super(cfg);
  }

  public async render(name: string, configs: any): Promise<string> {
    return super.render(name, this.rs.getView(), configs);
  }

  public async renderString(tpl: string, configs: any): Promise<string> {
    return super.renderString(tpl, this.rs.getView(), configs);
  }
}
