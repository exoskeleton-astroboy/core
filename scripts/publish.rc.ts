import run from "@bigmogician/publisher";
import { config } from "./pkg";

run({
  ...config,
  rc: "beta",
  add: 1,
  useStamp: false,
  debug: false
});
