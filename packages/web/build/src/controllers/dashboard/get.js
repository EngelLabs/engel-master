"use strict";
module.exports = function (core, req, res) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    return core.renderer.dashboard(req, res);
};
//# sourceMappingURL=get.js.map