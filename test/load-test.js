import ws from 'k6/ws';

/**
 * Test if the system is able to take normal load for a period of time
 * https://grafana.com/docs/k6/latest/testing-guides/test-types/load-testing/
 * 
 * Important factors:
 * 1. No. of VU (virtual users): System must be able to support enough ws connections
 * 2. No. of msgs/duration/user: System must be able to process a certain no. of msgs (No. of VU * No. of msgs/duration/user = No. of msgs/duration for the system)
 * 3. Duration of test: System must be able to take the load for a period of time
 * 
 * Check the RabbitMQ to check for any increase in the queue length & the average time between the creation of the message and the insertion in the db
 */

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // traffic ramp-up from 1 to 100 users over 5 minutes.
    { duration: '5m', target: 100 }, // stay at 100 users for 30 minutes
    { duration: '2m', target: 0 }, // ramp-down to 0 users
  ],
};

export default function () {
  const url = 'ws://localhost:8082'; // Change to your WS server
  const params = { tags: { my_tag: 'websocket_test' } };

  const res = ws.connect(url, params, function (socket) {
    socket.on('open', () => {
      console.log('Connected');

      // register the user
      // outside the setInterval as you only need to do it once
      socket.send(JSON.stringify({
        type: "register",
        from: __VU,
        to: __VU,
        payload: `register ${__VU}`,
        sentTime: new Date().toISOString(),
      }));
      
      // Send messages every 1s => 1 msg/sec/user
      socket.setInterval(() => {
        console.log("sent message")
        // send a message
        socket.send(JSON.stringify({
          type: "normal",
          from: __VU,
          to: __VU,
          payload: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu",
          sentTime: new Date().toISOString(),
        }));
      }, 1 * 1000); // time in ms

      socket.setTimeout(()=> {
        console.log("Closing the socket after the test")
        socket.close()
      }, 40 * 60 * 1000) // entire duration of the test (40 mins * 60s/min * 1000ms/s)
    });

    socket.on('message', (data) => {
      console.log(`VU ${__VU} received message: ${data}`);
    });

    socket.on('close', () => {
      console.log('Disconnected');
    });

    socket.on('error', (e) => {
      console.error('Socket error:', e);
    });
  });
}
