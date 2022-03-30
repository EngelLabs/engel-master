"use strict";
module.exports = function (app, req, res) {
    req.session.destroy(err => err && app.log(err, 'error', '/logout.get'));
    return res.redirect('/');
};
//# sourceMappingURL=get.js.map