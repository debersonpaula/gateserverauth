import { TGateServer } from 'gateserver';
import { TGateAuth } from 'gateauth';
export declare class TGateServerAuth extends TGateServer {
    private _auth;
    /** Authorization Key used to access the auth functionalities */
    authKey: string;
    /** Create TGateServerAuth instance */
    constructor();
    readonly GateAuth: TGateAuth;
    /** Middleware to Authentication tools */
    private _authListener(req, res, next);
}
