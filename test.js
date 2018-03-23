const server_api = require('./tests/server-api');
const server_gate = require('./tests/server-gate');
const axios = require('axios').default;
const assert = require('assert');

const targetHost = 'http://localhost:8080',
  targetAPI = targetHost + '/comments',
  authKey = 'dfdsifiuytoijp1p34ojpo34',
  userlogin = 'test-user',
  userpass = 'test-user',
  wrongpass = 'wrongpass';
let accessData;

describe('TGateServerAuth', () => {
  let serverApi, serverGate;
  //------------------------------------------
  describe('Starting servers', ()=>{
    it('start api server', (done) => {
      server_api.then( server => {
        serverApi = server;
        assert.notEqual(serverApi, undefined);
        done();
      });
    });
    it('start gate server', (done) => {
      server_gate.then( server => {
        serverGate = server;
        assert.notEqual(serverGate, undefined);
        done();
      });
    });

  });
  //------------------------------------------
  describe('AuthKey', ()=>{
    it('define key', () => {
      serverGate.authKey = authKey;
      assert.ok;
    });

    it('make request to ' + targetHost + ' (header with authkey and authtool=test)', (done) => {
      axios.get(targetHost, { headers: {authKey, authTool: 'test'} }
      ).then(res=>{
        assert.equal(res.status, 204);
        done();
      }).catch(err => {
        assert.fail(err);
        done();
      });
    });

    it('make request to ' + targetHost + ' (header with authkey and without authtool)', (done) => {
      axios.get(targetHost, { headers: {authKey} }
      ).then(res=>{
        assert.fail('error: should not return OK.');
        done();
      }).catch(err => {
        assert.equal(err.response.data.status, 400);
        assert.equal(err.response.data.error, 'ERROR_AUTH_TOOL');
        done();
      });
    });
  });
  //------------------------------------------
  describe('Registration', ()=>{
    const authTool = 'register';

    it(`register user '${userlogin}' with pass '${userpass}'`, (done) => {
      const data = {userlogin, userpass};
      axios.post(targetHost, data, { headers: {authKey, authTool} }
      ).then(res=>{
        accessData = res.data;
        assert.equal(res.status, 201);
        assert.notEqual(accessData.id, undefined);
        done();
      }).catch(err => {
        assert.fail(err);
        done();
      });
    });

    it(`register same user '${userlogin}' (should return error)`, (done) => {
      const data = {userlogin, userpass};
      axios.post(targetHost, data, { headers: {authKey, authTool} }
      ).then(res=>{
        assert.fail('error: user duplicated allowed.');
        done();
      }).catch(err => {
        assert.equal(err.response.data.status, 400);
        assert.equal(err.response.data.error, 'ERROR_REGISTER_DUPLICATED');
        done();
      });
    });

    it(`register user with blank fields (should return error)`, (done) => {
      const data = {userlogin: '', userpass: ''};
      axios.post(targetHost, data, { headers: {authKey, authTool} }
      ).then(res=>{
        assert.fail('error: user with blank fields allowed.');
        done();
      }).catch(err => {
        assert.equal(err.response.data.status, 400);
        assert.equal(err.response.data.error, 'ERROR_REGISTER_BLANK');
        done();
      });
    });
  });
  //------------------------------------------
  describe('Logging', ()=>{

    it(`login user '${userlogin}' with pass '${userpass}'`, (done) => {
      const authTool = 'login';
      const data = {userlogin, userpass};
      axios.post(targetHost, data, { headers: {authKey, authTool} }
      ).then(res=>{
        accessData = res.data;
        assert.equal(res.status, 200);
        assert.notEqual(accessData.id, undefined);
        done();
      }).catch(err => {
        assert.fail(err);
        done();
      });
    });

    it(`check session for user '${userlogin}'`, (done) => {
      const authTool = 'session',
            authToken = accessData.token.tokenId,
            authId = accessData.id;
      axios.get(targetHost, { headers: {authKey, authTool, authToken, authId} }
      ).then(res=>{
        assert.equal(res.status, 200);
        assert.equal(res.data.userlogin, userlogin);
        done();
      }).catch(err => {
        assert.fail(err);
        done();
      });
    });

    it(`logout user '${userlogin}'`, (done) => {
      const authTool = 'logout',
            authToken = accessData.token.tokenId,
            authId = accessData.id;
      axios.get(targetHost, { headers: {authKey, authTool, authToken, authId} }
      ).then(res=>{
        assert.equal(res.status, 204);
        done();
      }).catch(err => {
        assert.fail(err);
        done();
      });
    });

    it(`re-check session for user '${userlogin}'`, (done) => {
      const authTool = 'session',
            authToken = accessData.token.tokenId,
            authId = accessData.id;
      axios.get(targetHost, { headers: {authKey, authTool, authToken, authId} }
      ).then(res=>{
        assert.fail('session attempt with wrong credentials should not return');
        done();
      }).catch(err => {
        assert.equal(err.response.data.status, 403);
        assert.equal(err.response.data.error, 'ERROR_SESSION_FAIL');
        done();
      });
    });

    it(`login user '${userlogin}' with wrong pass '${wrongpass}'`, (done) => {
      const authTool = 'login';
      const data = {userlogin, userpass: wrongpass};
      axios.post(targetHost, data, { headers: {authKey, authTool} }
      ).then(res=>{
        assert.fail('login attempt with wrong credentials should not return');
        done();
      }).catch(err => {
        assert.equal(err.response.data.status, 400);
        assert.equal(err.response.data.error, 'ERROR_LOGIN_FAIL');
        done();
      });
    });

    it(`check invalid session`, (done) => {
      const authTool = 'session',
            authToken = accessData.token.tokenId,
            authId = accessData.id;
      axios.get(targetHost, { headers: {authKey, authTool, authToken, authId} }
      ).then(res=>{
        assert.fail('session attempt with wrong credentials should not return');
        done();
      }).catch(err => {
        assert.equal(err.response.data.status, 403);
        assert.equal(err.response.data.error, 'ERROR_SESSION_FAIL');
        done();
      });
    });

  });
  //------------------------------------------
  describe('Checking API', ()=>{

    it(`login first with user '${userlogin}' with pass '${userpass}'`, (done) => {
      const authTool = 'login';
      const data = {userlogin, userpass};
      axios.post(targetHost, data, { headers: {authKey, authTool} }
      ).then(res=>{
        accessData = res.data;
        assert.equal(res.status, 200);
        assert.notEqual(accessData.id, undefined);
        done();
      }).catch(err => {
        assert.fail(err);
        done();
      });
    });

    it(`checking api`, (done) => {
      const authToken = accessData.token.tokenId,
            authId = accessData.id,
            modname = 'mock-test';
      axios.get(targetHost, { headers: {authToken, authId, modname} }
      ).then(res=>{
        assert.equal(res.status, 200);
        done();
      }).catch(err => {
        assert.fail(err);
        done();
      });
    });

    it(`logout user '${userlogin}'`, (done) => {
      const authTool = 'logout',
            authToken = accessData.token.tokenId,
            authId = accessData.id;
      axios.get(targetHost, { headers: {authKey, authTool, authToken, authId} }
      ).then(res=>{
        assert.equal(res.status, 204);
        done();
      }).catch(err => {
        assert.fail(err);
        done();
      });
    });

    it(`checking api (without token)`, (done) => {
      const modname = 'mock-test';
      axios.get(targetHost, { headers: {modname} }
      ).then(res=>{
        assert.fail('session attempt with wrong credentials should not return');
        done();
      }).catch(err => {
        assert.equal(err.response.data.status, 403);
        assert.equal(err.response.data.error, 'ERROR_SESSION_FAIL');
        done();
      });
    });

  });
  //------------------------------------------
  describe('Stoping servers', ()=>{
    it('stop api server', (done) => {
      serverApi.close(()=>{
        assert.ok;
        done();
      });
    });
    it('stop gate server', (done) => {
      serverGate.close(()=>{
        assert.ok;
        done();
      });
    });
  });
  //------------------------------------------
});