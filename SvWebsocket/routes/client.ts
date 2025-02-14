import { Request, Response, NextFunction } from "express";
import path from "path"

const controller = (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.join(__dirname, '../static/index.html'));
}

export default controller