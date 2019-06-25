import path from "path";
import { createOptions } from "../../typings/IConfigs";

export interface INunjunksRenderOptions {
  root: string;
  autoescape: true;
  throwOnUndefined: false;
  trimBlocks: false;
  lstripBlocks: false;
  cache: true;
}

export const defaultNunjunksOptions: INunjunksRenderOptions = {
  root: path.resolve(process.cwd(), "app/views"),
  cache: true,
  autoescape: true,
  throwOnUndefined: false,
  trimBlocks: false,
  lstripBlocks: false
};

export const NUNJUNKS_OPTIONS = createOptions<INunjunksRenderOptions>(
  "NUNJUNKS_OPTIONS"
);
