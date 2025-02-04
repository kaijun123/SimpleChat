const pgtools = require('pgtools');
import config from "../sql/config"
import * as dotenv from "dotenv"
dotenv.config()


// https://www.npmjs.com/package/pgtools
;
(() => {
  const env = process.env.ENVIRONMENT || "development"
  const { database, user, password, port, host } = config[env]
  pgtools.createdb({ user, password, port, host }, database, (err: any, res: any) => {
    if (err) {
      console.error(err);
      process.exit(-1);
    }
    console.log("database created", database);
  })
})()