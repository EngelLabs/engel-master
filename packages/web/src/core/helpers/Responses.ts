import * as express from 'express';
import Base from '../structures/Base';

interface SuccessResponse {
        // TODO: Type return type
        (this: Responses, res: express.Response, data?: any): any;
}

interface ErrorResponse {
        // TODO: Type return type
        (this: Responses, res: express.Response, code?: number, message?: any): any;
}

export default class Responses extends Base {
        public 200 = createSuccessResponse(200, 'OK');
        public 201 = createSuccessResponse(201, 'OK');
        public 204 = createSuccessResponse(204);
        public 400 = createErrorResponse(400, 'Bad Request');
        public 401 = createErrorResponse(401, 'Unauthorized');
        public 403 = createErrorResponse(403, 'Forbidden');
        public 404 = createErrorResponse(404, 'Not Found');
        public 405 = createErrorResponse(405, 'Method Not Allowed');
        public 500 = createErrorResponse(500, 'Internal Server Error');

        public _successResponse(res: express.Response, status: number, data?: any) {
                if (typeof data === 'string') {
                        res.set('Content-Type', 'text/plain');
                } else if (data !== undefined) {
                        if (data instanceof Array) {
                                data = data.map(o => {
                                        delete o.__v;
                                        delete o._id;

                                        return o;
                                });
                        } else {
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

        public _errorResponse(res: express.Response, status: number, code?: number, message?: any) {
                const data: any = { message };

                data._code = code !== undefined ? code : null;

                return res.status(status).send(data);
        }
}

function createSuccessResponse(status: number, defaultData?: any): SuccessResponse {
        return function(res, data) {
                data = data === undefined ? defaultData : data;

                return this._successResponse(res, status, data);
        }
}

function createErrorResponse(status: number, defaultMessage: string): ErrorResponse {
        return function(res, code, message) {
                message = message === undefined ? `${status}: ${defaultMessage}` : message;

                return this._errorResponse(res, status, code, message);
        }
}