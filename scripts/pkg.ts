import { IConfig } from "@bigmogician/publisher/actions";

export const config: IConfig = {
  debug: false,
  rc: false,
  add: 0,
  whiteSpace: "  ",
  rootPath: ".",
  outDist: "dist",
  useYarn: true,
  outTransform: json => ({
    ...json,
    main: "./index.js",
    types: "./index.d.ts",
    scripts: undefined,
    nyc: undefined,
    devDependencies: undefined
  })
};
