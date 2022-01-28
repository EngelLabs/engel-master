const successResponse = (res, status, data) => {
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

const errorResponse = (res, status, code, message) => {
        const data = { message };

        data._code = code !== undefined ? code : null;

        return res.status(status).send(data);
}

const responseHandlers = {
        200: (res, data = 'OK') => successResponse(res, 200, data),
        201: (res, data = 'OK') => successResponse(res, 201, data),
        204: (res) => successResponse(res, 204),
        400: (res, code, msg = '400 Bad Request') => errorResponse(res, 400, code, msg),
        401: (res, code, msg = '401 Unauthorized') => errorResponse(res, 401, code, msg),
        403: (res, code, msg = '403 Forbidden') => errorResponse(res, 403, code, msg),
        404: (res, code, msg = '404 Not Found') => errorResponse(res, 404, code, msg),
        405: (res, code, msg = '405 Method Not Allowed') => errorResponse(res, 405, code, msg),
        500: (res, code, msg = '500 Internal Server Error') => errorResponse(res, 500, code, msg),
};


module.exports = responseHandlers;