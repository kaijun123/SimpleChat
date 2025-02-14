import cors from "cors";
import 'dotenv/config';
import express, { json } from "express";
import config from "../common/setup";
import { isValidUrl } from '../common/utils';
import { WsServer } from "./websocket";
import router from "./routes";


(async () => {
  // parse command line arguments
  const args = process.argv.slice(2);
  let apiPort: number | null = null, wsPort: number | null = null

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--apiPort" && args[i + 1]) {
      apiPort = parseInt(args[i + 1], 10);
    }
    if (args[i] === "--wsPort" && args[i + 1]) {
      wsPort = parseInt(args[i + 1], 10);
    }
  }
  // console.log("port:", port, "wsPort:", wsPort)
  if (!apiPort || !wsPort) {
    console.error("Incomplete command: port or wsPort is not provided!")
    process.exit(1)
  }

  // parse configs
  config.__configure("../config")
  const mqUrl = config.mqUrl || "amqp://localhost:5672"
  const discoverUrl = config.discoverUrl || "localhost:3001"
  isValidUrl(mqUrl)
  isValidUrl(discoverUrl)

  const host = process.env.host || "http://localhost"
  console.log("discoverUrl:", discoverUrl)

  // // Create the producer
  // const producerManager = new ProducerManager(mqUrl)
  // await producerManager.add("message", 5)

  // websocket server
  // const ws = new WsServer(producerManager, Number(wsPort))

  // express api server
  const app = express()
  app.use(json())
  app.use(cors())
  app.use(router)

  const ws = new WsServer(wsPort, apiPort, host, discoverUrl, router)
  ws.run()

  app.listen(apiPort, async () => {
    console.log(`Api server is running on localhost:${apiPort}`)
  })
})()

