// Main function:
// 1. Start an express server
// 2. Start a redis client
// 3. Create apis (add, remove)

import cors from "cors";
import 'dotenv/config';
import express, { json } from "express";
import config from "../common/setup";
import router from "./router";
import { isValidUrl } from '../common/utils';


(async () => {
  config.__configure("../config")

  // express api server
  const app = express()

  const url = isValidUrl(config.discoverUrl)
  const port = url.port || 3001

  app.use(json())
  app.use(cors())
  app.use(router)
  app.listen(port, async () => {
    console.log(`Api server is running on localhost:${port}`)
  })
})()