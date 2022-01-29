const Base = require('../structures/Base');


class Responder extends Base {
        constructor(server) {
                super(server);

                const success = this.successResponse.bind(this);
                const error = this.errorResponse.bind(this);

                this.responseHandlers = {
                        200: (res, data = 'OK') => success(res, 200, data),
                        201: (res, data = 'OK') => success(res, 201, data),
                        204: (res) => success(res, 204),
                        400: (res, code, msg = '400 Bad Request') => error(res, 400, code, msg),
                        401: (res, code, msg = '401 Unauthorized') => error(res, 401, code, msg),
                        403: (res, code, msg = '403 Forbidden') => error(res, 403, code, msg),
                        404: (res, code, msg = '404 Not Found') => error(res, 404, code, msg),
                        405: (res, code, msg = '405 Method Not Allowed') => error(res, 405, code, msg),
                        500: (res, code, msg = '500 Internal Server Error') => error(res, 500, code, msg),
                };

                return this.respond.bind(this);
        }

        respond(status, ...args) {
                return this.responseHandlers[status](...args);
        }

        successResponse(res, status, data) {
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

                return typeof data === undefined
                        ? res.end()
                        : res.send(data);
        }

        errorResponse(res, status, code, message) {
                const data = { message };

                data._code = code !== undefined ? code : null;

                return res.status(status).send(data);
        }
}


module.exports = Responder