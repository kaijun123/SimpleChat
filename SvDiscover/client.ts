import redis, { RedisClientType, createClient } from "redis"

export class RedisClient {
  // host?: string
  // port?: string
  client: RedisClientType

  constructor() {
    // constructor(host?: string, port?: string) {
    // this.host = host
    // this.port = port
    this.client = createClient();
    this.client.on("error", (error) => console.error(`Error : ${error}`));
  }

  async connect() {
    // const url = `${this.host}:${this.port}`
    await this.client.connect()
  }

  async get(key: string) {
    const value = await this.client.get(key);
    return value
  }

  async set(key: string, value: string) {
    await this.client.set(key, value);
    console.log("successfully set value")
  }

  async del(key: string) {
    await this.client.del(key);
  }
}