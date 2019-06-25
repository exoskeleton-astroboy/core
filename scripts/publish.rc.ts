import run from "@bigmogician/publisher";
import { config } from "./pkg";

run({
  ...config,
  rc: true,
  useStamp: true,
  debug: false
});
