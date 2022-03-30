"use strict";
module.exports = function (app, req, res) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    return app.renderer.dashboard(req, res);
};
//# sourceMappingURL=get.js.map