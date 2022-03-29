"use strict";
module.exports = function (core, req, res, next) {
    if (!req.session.isAdmin) {
        return core.responses[403](res);
    }
    return next();
};
//# sourceMappingURL=use.js.map