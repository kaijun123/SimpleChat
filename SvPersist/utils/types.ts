import { Dialect } from "sequelize"

export type DatabaseConfig = {
  database: string,
  user: string,
  password: string,
  port?: number,
  host: string,
  dialect: Dialect
}