import WebSocket from "ws"
import { SimpleMap } from "src/utils/types"

type Message = {
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
    if (this.connectionExist(userId)) {
      throw new Error("userId already in use")
    }

    this.pool[userId] = ws
  }

  public removeConnections(userId: string, ws: WebSocket) {
    // if there exist a connection with the same userId, throw an error
    if (!this.connectionExist(userId)) {
      throw new Error("userId does not exist")
    }

    delete this.pool[userId]
  }

  public route(msg: Message) {
    const { from, to, payload } = msg

    // send the message to the recipient in real-time via ws
    const recipientWs = this.pool[to]
    if (recipientWs) {
      recipientWs.send(JSON.stringify(msg))
    }

    // add to queue for persistence
  }
}

export class WsServer {
  private server: WebSocket.Server
  private router: WsRouter

  constructor() {
    this.server = new WebSocket.Server({ port: 8080 });
    this.router = new WsRouter()
  }

  public run() {
    try {
      console.log('WebSocket server is running on ws://localhost:8080');

      this.server.on('connection', (ws) => {
        console.log('New client connected');
        let userId: string | null = null

        // Sending a message to the client
        ws.send('Welcome to the WebSocket server!');

        // Listening for messages from the client
        ws.on('message', (message) => {
          const msgString = message.toString()
          const msg: Message = JSON.parse(msgString)
          console.log(`Received message: ${msgString}`);

          // Echoing the message back to the client
          ws.send(`Server received: ${msgString}`);

          // first message -> add the ws connection to the pool
          if (!userId) {
            userId = msg.from
            this.router.addNewConnections(userId, ws)
          }

          // route the message to the recipient
          this.router.route(msg)
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