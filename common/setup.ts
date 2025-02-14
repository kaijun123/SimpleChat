import fs from "fs";
import Toml from "toml";

export interface Configurations {
  __configure: (folder: string) => void;
  [index: string]: any;
};

const NODE_ENV = process.env.NODE_ENV || "development";

const loadConfig = (filename: string) => {
  const configPath = `${config.__configFolder}/${filename}.toml`;
  // console.log(configPath)
  try {
    const toml = Toml.parse(fs.readFileSync(configPath, "utf8"));
    // console.log("toml:", toml)
    if (toml.__configure)
      throw new Error("__configure is a reserved keyword in the configs");
    if (toml.__configFolder)
      throw new Error("__configFolder is a reserved keyword in the configs");
    return toml;
  } catch (e) {
  }
};

const configure = (configFolder: string, force: boolean = false) => {
  if (config.__initialized && !force) return;

  config.__configFolder = configFolder;

  // const envConfig = loadConfig(NODE_ENV);
  // Object.assign(config, envConfig);

  const baseConfig = loadConfig("base");
  if (baseConfig)
    Object.assign(config, baseConfig);

  const localConfig = loadConfig("local");
  if (localConfig)
    Object.assign(config, localConfig);

  config.__initialized = true;
};

const config: Configurations = { __configure: configure };

export default config;
