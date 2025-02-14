### SvPersist
- A service that consumes messages from the RabbitMQ queue and then write it to the Postgresql DB for pesistence

#### Quick Start

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
npm run start-persist
```