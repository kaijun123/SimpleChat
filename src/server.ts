// import express, { json } from "express"
// import ABI from "./utils/abi.json"
// import cors from "cors"
// import router from "./routes/index"
// import SvEvent from "./services/SvEvent"
// import config from "./setup"
import { WsServer } from "./services/SvWs"
import WebSocket from "ws"
  ;
(async () => {
  const ws = new WsServer()
  ws.run()
  
  // const wss = new WebSocket.Server({ port: 8080 });

  // wss.on('connection', (ws) => {
  //   console.log('New client connected');

  //   // Sending a message to the client
  //   ws.send('Welcome to the WebSocket server!');

  //   // Listening for messages from the client
  //   ws.on('message', (message) => {
  //     console.log(`Received message: ${message}`);
  //     // Echoing the message back to the client
  //     ws.send(`Server received: ${message}`);
  //   });

  //   // Handling client disconnection
  //   ws.on('close', () => {
  //     console.log('Client disconnected');
  //   });
  // });

  // console.log('WebSocket server is running on ws://localhost:8080');




  // config.__configure("./config")

  // const app = express()

  // const port = config.app.port || 3000
  // const svEvent = new SvEvent(config.app.url)
  // await svEvent.init()

  // app.use(router)
  // app.use(json())
  // app.use(cors())
  // app.listen(port, async () => {
  //   console.log(`Listening to port ${port}`)
  // })
})()

