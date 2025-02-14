### SvDiscover
- A service that stores the mapping of the userId with the SvWebsocket URL that the user's websocket connection is with
- Aim is for different SvWebsocket instances to communicate via API calls to send messages that involve users on 2 different SvWebsocket instances

#### Quick Start

```bash
docker pull redis

# Start redis docker container
docker run --name redis -p 6379:6379 -d redis

# Start the SvDiscover
npm run start-discover
```