import { Request, Response, NextFunction } from "express";

function controller(req: Request, res: Response, next: NextFunction) {
  res.send("Health test")
}

export default controller