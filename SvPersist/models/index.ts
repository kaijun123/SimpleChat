import { Sequelize } from "sequelize";
import config from "../sql/config";

// Create sequelize instance
const env = process.env.ENVIRONMENT || "development"
const { database, user, password, port, host, dialect } = config[env]
export const sequelize = new Sequelize(database, user, password, { dialect, host, port })

// Connect to db
sequelize.authenticate()
  .then(() => { console.log('Connection has been established successfully.') })
  .catch((error) => { console.error('Unable to connect to the database:', error); })
