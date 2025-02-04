import WebSocket from "ws"
import { SimpleMap } from "src/utils/types"
import { Producer, ProducerManager } from "./SvQueue"

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
  private pool: SimpleMap<WebSocket>

  constructor() {
    this.pool = {}
  }

  public connectionExist(userId: string) {
    if (this.pool[userId]) return true
    return false
  }

  public addNewConnections(userId: string, ws: WebSocket) {
    // if there exist a connection with the same userId, throw an error
    if (!this.connectionExist(userId)) {
      this.pool[userId] = ws
    }
  }

  public removeConnections(userId: string, ws: WebSocket) {
    // if there exist a connection with the same userId, throw an error
    if (this.connectionExist(userId)) {
      delete this.pool[userId]
    }
  }

  public route(msg: Message) {
    const { type, to } = msg

    if (type == MsgType.Normal) {
      // send the message to the recipient in real-time via ws
      const recipientWs = this.pool[to]
      if (recipientWs) {
        console.log("routed message")
        recipientWs.send(JSON.stringify(msg))
      }
    }
  }
}

export class WsServer {
  private server: WebSocket.Server
  private router: WsRouter
  private producer: Producer

  constructor(producer: Producer) {
    this.server = new WebSocket.Server({ port: 8080 });
    this.router = new WsRouter()
    this.producer = producer
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
            this.router.addNewConnections(msg.from, ws)
          }
          else if (type === MsgType.Unregister) {
            this.router.removeConnections(msg.from, ws)
          }
          else if (type === MsgType.Normal) {
            // do not allow empty payload for normal messages
            if (msg.payload.length === 0) return

            // route the message to the recipient
            this.router.route(msg)

            // Data Persistence: publishes the message to Queue
            await this.producer.send(msgString)
            console.log("sent message into the queue")
          }
        });

        // Handling client disconnection
        ws.on('close', () => {
          console.log('Client disconnected');
          this.router.removeConnections(userId!, ws)
        });
      });
    } catch (err) {
      console.error(err)
    }
  }
}