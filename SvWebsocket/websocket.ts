import WebSocket, { WebSocketServer } from "ws"
import { HTTPMethods, SimpleMap, apiCall } from "../common/utils"
import { Producer, ProducerManager } from "../common/Queue"


enum MsgType {
  Register = "register",
  Unregister = "unregister",
  Normal = "normal"
}

export type Message = {
  type: MsgType,
  from: string,
  to: string,
  payload: string,
}

class WsRouter {
  private pool: SimpleMap<WebSocket> // cache of all the current local connections
  private discoverUrl: string // discover service url that stores the ws service instance that the client is connected to
  private url: string // current url

  constructor(discoverUrl: string, url: string) {
    this.pool = {}
    this.discoverUrl = discoverUrl
    this.url = url
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
        const res = await apiCall(this.discoverUrl + "/set", { "key": userId, "value": this.url }, HTTPMethods.Post)
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
        const res = await apiCall(this.discoverUrl + "/del", { "key": userId }, HTTPMethods.Delete)
        console.log("removeConnections: ", res)

        delete this.pool[userId]
      }
    } catch (err) {
      console.error(err)
      // TODO: retry mechanism? what if the discover service is down? network failure?
      // Use load balancer? heartbeat mechanism to check for network partition
    }
  }

  // public route(msg: Message) {
  //   const { type, to } = msg

  //   if (type == MsgType.Normal) {
  //     // send the message to the recipient in real-time via ws
  //     const recipientWs = this.pool[to]
  //     if (recipientWs) {
  //       console.log("routed message")
  //       recipientWs.send(JSON.stringify(msg))
  //     }
  //   }
  // }
}

export class WsServer {
  private server: WebSocketServer
  private router: WsRouter
  // private producerManager: ProducerManager

  // constructor(producerManager: ProducerManager, port: number) {
  constructor(port: number, host: string, discoverUrl: string) {
    console.log("discoverUrl:", discoverUrl)
    this.server = new WebSocketServer({ port })
    this.router = new WsRouter(discoverUrl, host + ":" + port)
    // this.producerManager = producerManager
  }

  public run() {
    try {
      console.log('WebSocket server is running on ws://localhost:8080');

      this.server.on('connection', (ws) => {
        console.log('New client connected');
        let userId: string | null = null

        // Sending a message to the client
        // ws.send('Welcome to the WebSocket server!');

        // Listening for messages from the client
        ws.on('message', async (message) => {
          const msgString = message.toString()
          const msg: Message = JSON.parse(msgString)

          console.log(`Received message: ${msgString}`);

          // Echoing the message back to the client
          // TODO: add the echo back later
          // ws.send(`Server received: ${msgString}`);

          if (!userId) userId = msg.from
          const type = msg.type
          if (type === MsgType.Register) {
            console.log("registered for:", msg.from)
            await this.router.addNewConnections(msg.from, ws)
          }
          else if (type === MsgType.Unregister) {
            await this.router.removeConnections(msg.from, ws)
          }
          else if (type === MsgType.Normal) {
            // do not allow empty payload for normal messages
            if (msg.payload.length === 0) return

            // // route the message to the recipient
            // this.router.route(msg)

            // // Data Persistence: publishes the message to Queue
            // const producer = await this.producerManager.waitForProducer("message")
            // await producer.send(msgString)
            // console.log("sent message into the queue")
          }
        });

        // Handling client disconnection
        ws.on('close', async () => {
          console.log('Client disconnected');
          await this.router.removeConnections(userId!, ws)
        });
      });
    } catch (err) {
      console.error(err)
    }
  }
}