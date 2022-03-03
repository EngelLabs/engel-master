module.exports = function (server, req, res) {
        if (!req.session.user) {
                return res.redirect('/login');
        }

        return server.renderer.dashboard(req, res);
}