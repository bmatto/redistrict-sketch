import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";

const files = glob.sync("./src/**/*.graphql");

files.forEach((file) => {
  const content = readFileSync(file, "utf-8");

  const outputPath = file + ".ts";
  writeFileSync(outputPath, `export default \`${content}\``);
});
