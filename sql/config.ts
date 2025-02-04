import { DatabaseConfig, SimpleMap } from "src/utils/types";
import * as dotenv from "dotenv";
dotenv.config()

// This file contains all the configs to connect to the db, whether local or hosted db
const config: SimpleMap<DatabaseConfig> = {
  development: {
    database: "chat-db",
    user: "postgres",
    password: "",
    port: 5432,
    host: "localhost",
    dialect: "postgres"
  },
  // production: {
  //   database: "solidity-db-aws",
  //   user: `${process.env.PRODUCTION_USER}`,
  //   password: `${process.env.PRODUCTION_PASSWORD}`,
  //   port: 5432,
  //   host: `${process.env.PRODUCTION_ENDPOINT}`,
  //   dialect: "postgres"
  // }
}

export default config;