import express, { json } from "express"
import cors from "cors"
import router from "./routes/index"
import config from "./setup"
import { WsServer } from "./services/SvWs"
// import WebSocket from "ws"
import SvPersist from "./services/SvPersist"

  ;
(async () => {
  config.__configure("./config")

  // RabbitMQ
  const svPersist = new SvPersist(config.app.url)
  await svPersist.init()

  // Create the producer
  const producerManager = svPersist.producerManager!
  // TODO: Do I need more producers? How to manage a pool of producers?
  const producer = await producerManager.add("message")

  // websocket server
  const ws = new WsServer(producer)
  ws.run()

  // express api server
  const app = express()
  const port = config.app.port || 3000

  app.use(router)
  app.use(json())
  app.use(cors())
  app.listen(port, async () => {
    console.log(`Api server is running on localhost:${port}`)
  })
})()

