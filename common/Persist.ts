// import { ConsumerManager, ProducerManager, QueueManager } from "./SvQueue"
// import { Message } from "../SvWebsocket/Ws";
// import MessageModel from "../SvPersist/models/Message";


// class SvPersist {
//   public url: string;
//   public consumerManager?: ConsumerManager;
//   public producerManager?: ProducerManager;

//   public constructor(url: string) {
//     this.url = url
//   }

//   public async init() {
//     const queueManager = new QueueManager(this.url)
//     const { consumerManager, producerManager } = await queueManager.init()

//     const callback = async (msg: Message) => {
//       console.log("consumed message from queue:", JSON.stringify(msg))
//       const { from, to, payload } = msg
//       // singular inserts for the time
//       // TODO: look into bulk inserts
//       await MessageModel.create({ from, to, payload })
//     }

//     await consumerManager.add("message", callback, 2)

//     this.consumerManager = consumerManager
//     this.producerManager = producerManager
//   }
// }


// export default SvPersist;