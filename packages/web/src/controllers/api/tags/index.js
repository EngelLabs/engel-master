module.exports = {
        uri: '/api/guilds/:id/tags',
        delete: require('./delete'),
        get: require('./get'),
        patch: require('./patch'),
        post: require('./post'),
};