# Gateway Server + Authenticator

Under development...

## Usage

```js
// require gateserver
const {TGateServerAuth} = require('gateserver-auth');

// create server instance
const server = new TGateServerAuth;

// load module definition
server.Modules = {
  "mock-test": {
    "host": "http://localhost:3000"
  }
};

// start server on port 8080
server.listen(8080);
```