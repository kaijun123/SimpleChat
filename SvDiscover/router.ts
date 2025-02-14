import { Request, Response, Router } from "express";
import { RedisClient } from "./client"

const router = Router();
const client = new RedisClient()

// Need to ensure that the client is initialised
client.connect().then(() => {
  console.log("Client connected!");

  router.get("/get/:key", async (req: Request, res: Response) => {
    try {
      if (!req.params.key || req.params.key === undefined) {
        res.status(400).json({ status: "error" });
        return
      }

      const key = req.params.key
      console.log("key:", key)

      // NOTE: if the kv-pair does not exist, you will get a null value. Need to check the value
      const value = await client.get(key);
      res.status(200).json({ status: "success", value });
    } catch (error) {
      console.log("error:", error)
      res.status(400).json({ status: "error" });
    }
  });

  router.post("/set", async (req: Request, res: Response) => {
    try {
      if (!req.body.key || !req.body.value) {
        res.status(400).json({ status: "error" });
        return
      }
      console.log("set:", req.body)

      const { key, value } = req.body;
      await client.set(key, value);
      res.status(200).json({ status: "success" });
    } catch (error) {
      console.log("error:", error)
      res.status(400).json({ status: "error" });
    }
  });

  router.delete("/del", async (req: Request, res: Response) => {
    try {
      if (!req.body.key) {
        res.status(400).json({ status: "error" });
        return
      }
      console.log("del:", req.body)

      const { key } = req.body;
      await client.del(key);
      res.status(200).json({ status: "success" });
    } catch (error) {
      console.log("error:", error)
      res.status(400).json({ status: "error" });
    }
  });
})


export default router;