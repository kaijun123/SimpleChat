import { ProducerManager } from "../common/Queue";
import { Request, Response, Router } from "express";
import WebSocket, { WebSocketServer } from "ws";
import { HTTPMethods, Message, MsgType, SimpleMap, apiCall, defaultQueueName } from "../common/utils";

class WsRouter {
  private pool: SimpleMap<WebSocket> // cache of all the current local connections
  private discoverUrl: string // discover service url that stores the ws service instance that the client is connected to
  private apiUrl: string // current url

  constructor(discoverUrl: string, apiUrl: string) {
    this.pool = {}
    this.discoverUrl = discoverUrl
    this.apiUrl = apiUrl
  }

  public connectionExist(userId: string) {
    if (this.pool[userId]) return true
    return false
  }

  public async addNewConnections(userId: string, ws: WebSocket) {
    try {
      if (!this.connectionExist(userId)) {
        // NOTE: order of the functions is important here
        // api calls can fail

        // add to the discovery service
        const res = await apiCall(this.discoverUrl + "set", HTTPMethods.Post, { "key": userId, "value": this.apiUrl })
        console.log("addNewConnections: ", res)

        this.pool[userId] = ws
      }
    } catch (err) {
      console.error(err)
      // TODO: retry mechanism? what if the discover service is down? network failure?
      // Use load balancer? heartbeat mechanism to check for network partition
    }
  }

  public async removeConnections(userId: string, ws: WebSocket) {
    try {
      if (this.connectionExist(userId)) {
        // NOTE: order of the functions is important here
        // api calls can fail

        // add to the discovery service
        const res = await apiCall(this.discoverUrl + "del", HTTPMethods.Delete, { "key": userId })
        console.log("removeConnections: ", res)

        delete this.pool[userId]
      }
    } catch (err) {
      console.error(err)
      // TODO: retry mechanism? what if the discover service is down? network failure?
      // Use load balancer? heartbeat mechanism to check for network partition
    }
  }

  public async route(msg: Message) {
    const { type, to } = msg

    if (type == MsgType.Normal) {
      // send the message to the recipient in real-time via ws
      const recipientWs = this.pool[to]
      if (recipientWs) {
        // recipient connected to the same SvWebsocket
        console.log("routed message")
        recipientWs.send(JSON.stringify(msg))
      }
      else {
        // recipient not connected to the same SvWebsocket
        // find the url of the recipient's SvWebsocket instance 
        const res = await apiCall(this.discoverUrl + `get/${to}`, HTTPMethods.Get)
        const { value: recipientUrl } = res

        // recipient is online
        if (recipientUrl) {
          // send the message to the recipient's SvWebsocket instance
          const res = await apiCall(recipientUrl + "/send", HTTPMethods.Post, msg)
        }
      }
    }
  }
}

export class WsServer {
  private server: WebSocketServer
  private wsRouter: WsRouter
  private apiRouter: Router
  private wsPort: number
  private apiPort: number
  private producerManager: ProducerManager


  // private producerManager: ProducerManager

  // constructor(producerManager: ProducerManager, port: number) {
  constructor(wsPort: number, apiPort: number, host: string, discoverUrl: string, apiRouter: Router, producerManager: ProducerManager) {
    this.server = new WebSocketServer({ port: wsPort })
    this.wsRouter = new WsRouter(discoverUrl, host + ":" + apiPort)
    this.wsPort = wsPort
    this.apiPort = apiPort
    this.producerManager = producerManager

    // accept messages from other SvWebsocket instances and send to recipient
    this.apiRouter = apiRouter
    apiRouter.post("/send", (req: Request, res: Response) => {
      try {
        // console.log("reached", req.body)
        if (!req.body.type || !req.body.from || !req.body.to || !req.body.payload) {
          throw new Error("Invalid message received")
        }

        const { type, from, to, payload }: Message = req.body
        this.wsRouter.route({ type, from, to, payload })

        res.status(200).send({ "status": "success" })
      } catch (error) {
        console.error(error)
        res.status(400).send({ "status": error })
      }
    })
  }

  public run() {
    console.log(`WebSocket server is running on ws://localhost:${this.wsPort}`);

    this.server.on('connection', (ws) => {
      console.log('New client connected');
      let userId: string | null = null

      // Sending a message to the client
      // ws.send('Welcome to the WebSocket server!');

      // Listening for messages from the client
      ws.on('message', async (message) => {
        try {
          const msgString = message.toString()
          const msg: Message = JSON.parse(msgString)

          console.log(`Received message: ${msgString}`);

          // Echoing the message back to the client
          // TODO: add the echo back later
          // ws.send(`Server received: ${msgString}`);

          const type = msg.type
          if (type === MsgType.Register) {
            if (!userId) userId = msg.from
            console.log("registered for:", msg.from)
            await this.wsRouter.addNewConnections(msg.from, ws)
          }
          else if (type === MsgType.Unregister) {
            console.log("unregistered for:", msg.from)
            await this.wsRouter.removeConnections(msg.from, ws)
          }
          else if (type === MsgType.Normal) {
            // only allow messages to be sent after registering
            if (!userId) return

            // do not allow empty payload for normal messages
            if (msg.payload.length === 0) return

            // route the message to the recipient
            this.wsRouter.route(msg)

            // Data Persistence: publishes the message to Queue
            const [id, producer] = await this.producerManager.waitForProducer("message")
            await producer.send(msgString)
            this.producerManager.release(defaultQueueName, id)
            console.log("sent message into the queue")
          }
        } catch (error) {
          console.error(error)
        }
      });

      // Handling client disconnection
      ws.on('close', async () => {
        console.log('Client disconnected');
        await this.wsRouter.removeConnections(userId!, ws)
      });
    });
  }
}