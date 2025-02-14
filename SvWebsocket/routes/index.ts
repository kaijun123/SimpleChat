import { Router } from "express";
import test from "./test";
import client from "./client"


const router = Router()

router.get("/test", test)
router.get("/client", client)

export default router;