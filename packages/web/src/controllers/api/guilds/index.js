module.exports = {
        uri: '/api/guilds/:id',
        get: require('./get'),
        patch: require('./patch'),
        use: require('./use'),
};