"use strict";
const inviteUrl = 'https://discord.com/api/oauth2/authorize?client_id=827788394401890374&permissions=0&scope=bot';
module.exports = function (app, req, res) {
    return res.redirect(inviteUrl);
};
//# sourceMappingURL=get.js.map