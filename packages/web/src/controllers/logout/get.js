module.exports = function (server, req, res) {
        req.session.destroy(err => err && server.log(err, 'error', '/logout.get'));

        return res.redirect('/');
}