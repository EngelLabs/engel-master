"use strict";
module.exports = function (app, req, res, next) {
    if (!req.session.isAdmin) {
        return app.responses[403](res);
    }
    return next();
};
//# sourceMappingURL=use.js.map