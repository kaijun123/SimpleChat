### SimpleChat

#### About
- A simple chat app that uses websocket for real-time message routing, and rabbitmq to decouple the incoming messages and the db writes and increase throughput.
- Websocket is hosted at `ws://localhost:8080/`
- Simple UI can be found at `localhost:3000/client` for testing of functionalities

#### Technology
- Websocket: Real-time bi-directional networking
- RabbitMQ: Decouple message routing and db writes
- PostgreSQL: Database used to save the messages
- TypeScript: Provide typing support
- Sequelize: ORM used to connect and interact with the PostgreSQL database
- Sequelize CLI: To run the migrate files
- ts-node: Run TS scripts by compiing on the fly

#### Necessary Files
- .env file in root directory; variables to include
  - `ENVIRONMENT`

#### Quick Start:
```bash
# Pull postgres docker image
docker pull postgres

# Start the posgres docker container
docker run --name some-postgres -e POSTGRES_PASSWORD=password -p 5432:5431 -d postgres

# Pull rabbitmq image
docker pull rabbitmq:3-management

# Start the rabbitmq container
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# This generates the config json file which is required when you migrate the schemas to the database
npm run script ./scripts/genConfig

# Compile typescript code into javascript
npm run build

# Create the database
npm run db:create

# Migrate schema
npm run db:migrate

# Start the server
npm run start
```

#### Test
- Open 2 pages to localhost:3000/client
- Key in the user id and recipient id on both pages, but in reverse order to talk to each other
- Click `register`
- Type in the text box and click send
- Start chatting away!

#### Tutorials:
- Websocket:
  - https://www.blackslate.io/articles/real-time-communication-with-nodejs-express-websockets
  - https://dev.to/hamzakhan/built-in-websockets-in-nodejs-2024-a-comprehensive-guide-2236
- RabbitMQ:
  - Intro: https://www.cloudamqp.com/blog/part1-rabbitmq-for-beginners-what-is-rabbitmq.html
  - Exchange Types: https://www.cloudamqp.com/blog/part4-rabbitmq-for-beginners-exchanges-routing-keys-bindings.html
  - Management Plugin: https://geshan.com.np/blog/2024/05/rabbitmq-docker/
  - https://medium.com/cwan-engineering/rabbitmq-concepts-and-best-practices-aa3c699d6f08

#### TODO:
- Look into whether multiple producers are needed and how to create a pool of producers to choose from
- Look into bulk inserts for the db to speed up the db inserts
- Add history api to get all the past messages