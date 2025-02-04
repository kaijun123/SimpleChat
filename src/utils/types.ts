import { Dialect } from "sequelize"

export type SimpleMap<V = string> = {
  [index: string]: V
}

export type DatabaseConfig = {
  database: string,
  user: string,
  password: string,
  port?: number,
  host: string,
  dialect: Dialect
}