import { readFileSync } from "fs";
import { load } from "js-yaml";
import { join } from "path";

const YAML_CONFIG_FILENAME = "discord-bot.yaml";

export default () => {
  return load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), "utf8"),
  ) as Record<string, any>;
};
