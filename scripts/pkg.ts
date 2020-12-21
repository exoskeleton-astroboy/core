import { IConfig } from "@bigmogician/publisher/actions";

export const config: IConfig = {
  debug: false,
  rc: false,
  add: 0,
  whiteSpace: "  ",
  rootPath: ".",
  outDist: "dist",
  useYarn: false,
  register: "https://registry.npmjs.org",
  outTransform: (json) => ({
    ...json,
    main: "./index.js",
    types: "./index.d.ts",
    scripts: undefined,
    nyc: undefined,
    devDependencies: undefined,
  }),
};
