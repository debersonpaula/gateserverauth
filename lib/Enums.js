"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// error codes
exports.ERROR_REGISTER_BLANK = 'ERROR_REGISTER_BLANK';
exports.ERROR_REGISTER_DUPLICATED = 'ERROR_REGISTER_DUPLICATED';
exports.ERROR_LOGIN_BLANK = 'ERROR_LOGIN_BLANK';
exports.ERROR_LOGIN_FAIL = 'ERROR_LOGIN_FAIL';
exports.ERROR_SESSION_FAIL = 'ERROR_SESSION_FAIL';
exports.ERROR_AUTH_TOOL = 'ERROR_AUTH_TOOL';
// error messages
exports.ERRORS = {
    ERROR_REGISTER_BLANK: { status: 400, error: exports.ERROR_REGISTER_BLANK, message: 'Fields can`t be blank.' },
    ERROR_REGISTER_DUPLICATED: { status: 400, error: exports.ERROR_REGISTER_DUPLICATED, message: 'User already registered.' },
    ERROR_LOGIN_BLANK: { status: 400, error: exports.ERROR_LOGIN_BLANK, message: 'Fields can`t be blank.' },
    ERROR_LOGIN_FAIL: { status: 400, error: exports.ERROR_LOGIN_FAIL, message: 'Login failed.' },
    ERROR_SESSION_FAIL: { status: 403, error: exports.ERROR_SESSION_FAIL, message: 'Session invalid.' },
    ERROR_AUTH_TOOL: { status: 400, error: exports.ERROR_AUTH_TOOL, message: 'Authentication Tool not defined.' },
};
