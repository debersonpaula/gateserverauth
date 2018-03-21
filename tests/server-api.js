const serverHandler = new Promise((resolve, reject) => {
  const jsonServer = require('json-server');
  const server = jsonServer.create();
  const router = jsonServer.router(__dirname + '/test-db.json');
  const middlewares = jsonServer.defaults();
  
  server.use(middlewares);
  server.use(router);
  const result = server.listen(3000, (err) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

module.exports = serverHandler;