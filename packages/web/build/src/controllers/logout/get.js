"use strict";
module.exports = function (core, req, res) {
    req.session.destroy(err => err && core.log(err, 'error', '/logout.get'));
    return res.redirect('/');
};
//# sourceMappingURL=get.js.map