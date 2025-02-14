### SvWebsocket
- Each instance can allow for multiple websocket connections from different clients
- If the sender and recipient are connected to the same SvWebsocket instance, then it will immediately route the message to the recipient
- If the sender and recipient are NOT connected to the same SvWebsocket instance, then it will need to find the URL of the recipient's SvWebsocket by getting it from SvDiscover via API calls. Then make an API call to the recipient's SvWebsocket instance to send it to the recipient
- Allowed flags: `--apiPort`, `--wsPort`

#### Quick Start

```bash
# Start the SvWebsocket
npm run start-ws
```

#### Test
- Open 2 pages to ```localhost:3002/client```
- Key in the user id and recipient id on both pages, but in reverse order to talk to each other
- Click `register`
- Type in the text box and click send
- Start chatting away!