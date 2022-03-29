"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../structures/Base");
class Responses extends Base_1.default {
    200 = createSuccessResponse(200, 'OK');
    201 = createSuccessResponse(201, 'OK');
    204 = createSuccessResponse(204);
    400 = createErrorResponse(400, 'Bad Request');
    401 = createErrorResponse(401, 'Unauthorized');
    403 = createErrorResponse(403, 'Forbidden');
    404 = createErrorResponse(404, 'Not Found');
    405 = createErrorResponse(405, 'Method Not Allowed');
    500 = createErrorResponse(500, 'Internal Server Error');
    _successResponse(res, status, data) {
        if (typeof data === 'string') {
            res.set('Content-Type', 'text/plain');
        }
        else if (data !== undefined) {
            if (data instanceof Array) {
                data = data.map(o => {
                    delete o.__v;
                    delete o._id;
                    return o;
                });
            }
            else {
                delete data.__v;
                delete data._id;
            }
            data = { data };
            res.set('Content-Type', 'application/json');
        }
        res.status(status);
        return data === undefined
            ? res.end()
            : res.send(data);
    }
    _errorResponse(res, status, code, message) {
        const data = { message };
        data._debug = `https://http.cat/${status}`;
        data._code = code !== undefined ? code : null;
        return res.status(status).send(data);
    }
}
exports.default = Responses;
function createSuccessResponse(status, defaultData) {
    return function (res, data) {
        data = data === undefined ? defaultData : data;
        return this._successResponse(res, status, data);
    };
}
function createErrorResponse(status, defaultMessage) {
    return function (res, code, message) {
        message = message === undefined ? `${status}: ${defaultMessage}` : message;
        return this._errorResponse(res, status, code, message);
    };
}
//# sourceMappingURL=Responses.js.map