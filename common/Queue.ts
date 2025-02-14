import amqlib, { Channel, Connection } from "amqplib"
import { SimpleMap } from "./utils"

// Each connection represents 1 TCP/IP connection
// They are heavyweight and should not be open and closed easily
// create 1 connection per ProducerManager/ ConsumerManager
const connect = async (url: string): Promise<Connection> => {
  const connection = await amqlib.connect(url)
  return connection
}

// Multiple channels can be created using the same connection
// Reuse the same connection to create each channel
// Channels are lighter weight than connections
const createChannel = async (connection: Connection): Promise<Channel> => {
  const channel = await connection.createChannel()
  return channel
}


export class QueueManager {
  public url: string;
  public producerManager?: ProducerManager;
  public consumerManager?: ConsumerManager;

  public constructor(url: string) {
    this.url = url
  }

  public async init(): Promise<{ producerManager: ProducerManager, consumerManager: ConsumerManager }> {
    this.producerManager = new ProducerManager(this.url!)
    await this.producerManager.init()
    this.consumerManager = new ConsumerManager(this.url!)
    await this.consumerManager.init()
    return { producerManager: this.producerManager, consumerManager: this.consumerManager }
  }
}

export class ProducerManager {
  public url: string;
  public busy: SimpleMap<SimpleMap<Producer>> = {} // {queueName: {id: producer}}
  public free: SimpleMap<SimpleMap<Producer>> = {} // {queueName: {id: producer}}
  public poolSize: number = 0
  public connection?: Connection;

  public constructor(url: string) {
    this.url = url;
    console.log("Creating an instance of ProducerManager");
  }

  public async init() {
    this.connection = await connect(this.url);
    console.log("Creating a connection for ProducerManager");
  }

  public async add(queueName: string, number: number = 1) {
    if (!this.free[queueName]) this.free[queueName] = {};
    if (!this.busy[queueName]) this.busy[queueName] = {};

    const freeMp = this.free[queueName]

    for (var i = 0; i < number; i++) {
      const producer = new Producer(queueName, this.connection!)
      await producer.init()
      this.poolSize += 1
      freeMp[String(this.poolSize)] = producer
    }
  }

  public get(queueName: string): [string, Producer] | null {
    if (!this.free[queueName] || Object.keys(this.free[queueName]).length === 0) {
      console.warn(`No available producer for queue: ${queueName}`);
      return null;
    }

    const freeMp = this.free[queueName];
    const busyMp = this.busy[queueName] || (this.busy[queueName] = {});

    const producers = Object.entries(freeMp);
    const [id, producer] = producers[0];

    // Remove from free and add to busy
    delete freeMp[id];
    busyMp[id] = producer;

    return [id, producer];
  }

  public async waitForProducer(queueName: string): Promise<[string, Producer]> {
    while (!this.free[queueName] || Object.keys(this.free[queueName]).length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100ms before retrying
    }
    console.log("Obtained producer")
    return this.get(queueName)!;
  }

  public release(queueName: string, id: string) {
    if (!this.busy[queueName] || !this.busy[queueName][id]) {
      console.warn(`Producer with id ${id} is not found in busy queue: ${queueName}`);
      return;
    }

    if (!this.free[queueName]) this.free[queueName] = {};

    const producer = this.busy[queueName][id];

    // Remove from busy and add back to free
    delete this.busy[queueName][id];
    this.free[queueName][id] = producer;
    console.log("Released producer")
  }
}

export class ConsumerManager {
  public connection?: Connection;
  public url: string;

  public constructor(url: string) {
    this.url = url
    console.log("Creating an instance of ConsumerManager")
  }

  public async init() {
    this.connection = await connect(this.url!)
    console.log("Creating a connection for ConsumerManager")
  }

  public async add(queueName: string, callback: (payload: any) => Promise<void>, number: number = 1) {
    for (let i = 0; i < number; i++) {
      const consumer = new Consumer(queueName, this.connection!)
      await consumer.init()
      await consumer.consume(callback)
    }
  }
}



export class Producer {
  public queueName: string = ""
  // public exchangeType: string = ""
  // public exchangeName: string = ""
  public connection: Connection;
  public channel?: Channel;

  // public constructor(queueName: string, exchangeType: string, connection: Connection) {
  public constructor(queueName: string, connection: Connection) {
    this.queueName = queueName
    // this.exchangeType = exchangeType

    this.connection = connection
    console.log("Creating an instance of Producer")
  }

  public async init() {
    const channel = await createChannel(this.connection!)
    await channel.assertQueue(this.queueName!, { durable: true })
    this.channel = channel
  }

  public async send(payload: any) {
    const payloadBytes = Buffer.from(payload)
    await this.channel!.sendToQueue(this.queueName, payloadBytes, { persistent: true })
  }
}

export class Consumer {
  public queueName: string = ""
  // public exchangeType: string = ""
  // public exchangeName: string = ""
  public connection: Connection;
  public channel?: Channel;

  // public constructor(queueName: string, exchangeType: string, connection: Connection) {
  public constructor(queueName: string, connection: Connection) {
    this.queueName = queueName
    // this.exchangeType = exchangeType

    this.connection = connection
    console.log("creating an instance of Consumer")
  }

  public async init() {
    const channel = await createChannel(this.connection!)
    await channel.assertQueue(this.queueName!, { durable: true })
    await channel.prefetch(1)
    this.channel = channel
  }

  public async consume(callback: (payload: any) => Promise<void>) {
    await this.channel!.consume(this.queueName, async (msg) => {
      if (msg !== null) {
        const payload = JSON.parse(msg.content.toString())
        await callback(payload)
        // console.log('Received:', payload);

        this.channel!.ack(msg);
      } else {
        console.log('Consumer cancelled by server');
      }
    }, { noAck: false })
  }
}

