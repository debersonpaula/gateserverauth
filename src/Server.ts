import * as http from 'http';
import {TGateServer} from 'gateserver';
import {TGateAuth} from 'gateauth';
import {TError, TResponse} from './Types';
import * as enums from './Enums';
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/
export class TGateServerAuth extends TGateServer {
  private _auth: TGateAuth;
  /** Authorization Key used to access the auth functionalities */
  public authKey: string;
  
  /** Create TGateServerAuth instance */
  constructor() {
    super();
    this._auth = new TGateAuth;
    this.authKey = 'auth';
    this.use(this._authListener.bind(this));
  }

  public get GateAuth(): TGateAuth {
    return this._auth;
  }

  /** Middleware to Authentication tools */
  private _authListener(req: http.IncomingMessage, res: http.ServerResponse, next: any) {
    // get parameters from headers
    const { authkey, authtool } = req.headers;
    if (authkey === this.authKey) {
      // verify which authtool used and call function
      switch (authtool) {
        case 'register':
          register(req, res, this._auth);
          break;
        case 'login':
          login(req, res, this._auth);
          break;
        case 'logout':
          logout(req, res, this._auth);
          break;
        case 'session':
          session(req, res, this._auth);
          break;
        default:
          res.end();
      }
    } else {
      // execute next listener
      // if the authKey was not provided
      if (authRequests(req, res, this._auth)) {
        next();
      }
    }
  }
}
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/
function authRequests(req: http.IncomingMessage, res: http.ServerResponse, auth: TGateAuth) {
  // get parameters from headers
  const id: number = convertToInt(req.headers.authid);
  const tokenId: string = convertToStr(req.headers.authtoken);
  // check session
  if (auth.checkAccess(id, tokenId)) {
    return true;
  } else {
    throwError(res, enums.ERROR_SESSION_FAIL);
    return false;
  }
}
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/
function register(req: http.IncomingMessage, res: http.ServerResponse, auth: TGateAuth){
  fetchBody(req, 512).then((body)=>{
    if (body.userlogin && body.userpass) {
      const id = auth.addUser(body.userlogin,body.userpass);
      if (id) {
        const token = auth.createAccess(id);
        writeResponse(res, 201, {id, token});
      } else {
        throwError(res, enums.ERROR_REGISTER_DUPLICATED);
      }
    } else {
      throwError(res, enums.ERROR_REGISTER_BLANK);
    }
  }).catch(e => console.log('error ->', e));
}
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/
function login(req: http.IncomingMessage, res: http.ServerResponse, auth: TGateAuth){
  fetchBody(req, 512).then((body)=>{
    if (body.userlogin && body.userpass) {
      const id = auth.checkUser(body.userlogin, body.userpass);
      if (id) {
        const token = auth.createAccess(id);
        writeResponse(res, 200, {id, token});
      } else {
        throwError(res, enums.ERROR_LOGIN_FAIL);
      }
    } else {
      throwError(res, enums.ERROR_LOGIN_BLANK);
    }
  }).catch(e => console.log('error ->', e));
}
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/
function logout(req: http.IncomingMessage, res: http.ServerResponse, auth: TGateAuth){
  // get parameters from headers
  const id: number = convertToInt(req.headers.authid);
  const tokenId: string = convertToStr(req.headers.authtoken);
  if (auth.checkAccess(id, tokenId)) {
    if (auth.destroyAccess(id)) {
      res.writeHead(204);
    }
  }
  res.end();
}
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/
function session(req: http.IncomingMessage, res: http.ServerResponse, auth: TGateAuth){
  // get parameters from headers
  const id: number = convertToInt(req.headers.authid);
  const tokenId: string = convertToStr(req.headers.authtoken);
  if (auth.checkAccess(id, tokenId)) {
    const {userlogin, data, access} = auth.users[id];
    writeResponse(res, 200, {userlogin, data});
  } else {
    throwError(res, enums.ERROR_SESSION_FAIL);
  }
}
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/
function fetchBody(req: http.IncomingMessage, limit: number): Promise<any> {
  return new Promise((resolve, reject)=>{
    try {
      if (req.method === 'POST') {
        let body = '';
        // fetch data from request
        req.on('data', function (data) {
          body += data;
          // if the data length override the limit, kill connection
          if (body.length > limit)
            req.connection.destroy();
        });
        // finalizes the fetch
        req.on('end', function () {
          try {
            const jsonBody: any = JSON.parse(body);
            resolve(jsonBody);
          } catch(e) {
            reject(e);
          }
        });
      }
    } catch(e) {
      reject(e);
    }
  });
}
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/
function writeResponse(res: http.ServerResponse, status: number, data: Object) {
  res.writeHead(status, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(data));
  res.end();
}
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/
function throwError(res: http.ServerResponse, errorCode: string) {
  const error = enums.ERRORS[errorCode] || { status: 0, error: '', message: ''};
  res.writeHead(error.status, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(error));
  res.end();
}
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/
function convertToInt(value: any): number {
  // if (typeof value === 'string') {
  //   return parseInt(value);
  // } else if (value.length) {
  //   return parseInt(value.toString());
  // }
  // return 0;
  try {
    const res = parseInt(value);
    return res;
  } catch {
    return 0;
  }
}
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/
function convertToStr(value: any): string {
  // if (typeof value === 'string') {
  //   return value;
  // } else if (value.length) {
  //   return value.toString();
  // }
  // return '';
  try {
    const res = value;
    return res;
  } catch {
    return '';
  }
}
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/