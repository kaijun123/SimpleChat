import express from "express";
import { ConsumerManager } from "../common/Queue";
import config from "../common/setup";
import { defaultQueueName, isValidUrl, Message } from "../common/utils";
import MessageModel from "./models/Message";


(async () => {
  config.__configure("../config")

  const mqUrl = isValidUrl(config.mqUrl)
  const persistUrl = isValidUrl(config.persistUrl)

  // parse the flags from the command
  let numConsumers = 1
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--consumer" && args[i + 1]) {
      numConsumers = parseInt(args[i + 1], 10);
      console.log("numConsumers:", numConsumers)
    }
  }

  // RabbitMQ
  const callback = async (msg: Message) => {
    console.log("consumed message from queue:", JSON.stringify(msg))
    const { from, to, payload } = msg
    // singular inserts for the time
    // TODO: look into bulk inserts
    await MessageModel.create({ from, to, payload })
  }

  const consumerManager = new ConsumerManager(mqUrl.toString())
  await consumerManager.init()
  await consumerManager.add(defaultQueueName, callback, numConsumers)

  // express api server
  const app = express()
  const port = persistUrl.port || 3000

  app.listen(port, async () => {
    console.log(`Api server is running on localhost:${port}`)
  })
})().catch((err) => console.error(err))

