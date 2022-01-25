module.exports = function (server, req, res) {
        return server.renderer.index(req, res);
}