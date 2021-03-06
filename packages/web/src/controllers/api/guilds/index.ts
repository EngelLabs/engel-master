import Controller from '../../../core/structures/Controller';

export default new Controller('/api/guilds/:id')
        .use(async (app, req, res, next) => {
                if (!req.session.token) {
                        return res[401](20001);
                }

                if (req.session.isAdmin) {
                        return next();
                }

                const guildID = req.params.id;

                const guild = req.session.guilds.find(g => g.id === guildID);

                if (!guild) {
                        return res[403](10001);
                }

                return next();
        })
        .get(async (app, req, res) => {
                const guild = await app.mongo.guilds.findOne({ id: req.params.id });

                return guild
                        ? res[200](guild)
                        : res[404](10001);
        })
        .patch(async (app, req, res) => {
                // TODO: Type this?
                const toSet: any = {};
                const toUnset: any[] = [];
                const body = req.body;

                /* guildConfig.prefixes */
                if (body.prefixes === null) {
                        toSet.prefixes = app.config.prefixes.default;
                } else if (body.prefixes instanceof Array) {
                        const prefixes = body.prefixes
                                .filter(p => typeof p === 'string' && p.length && p.length <= 12)
                                .slice(0, 15);

                        if (prefixes.length) {
                                toSet.prefixes = prefixes;
                        }
                }

                /* guildConfig.muteRole */
                if (body.muteRole === null) {
                        toUnset.push('muteRole');
                } else if (typeof body.muteRole === 'string') {
                        toSet.muteRole = body.muteRole;
                }

                /* snowflake arrays */
                for (const key of ['allowedRoles', 'ignoredRoles', 'allowedChannels', 'ignoredChannels']) {
                        const val = body[key];
                        if (val === null) {
                                toUnset.push(key);
                        } else if (val instanceof Array) {
                                const ids = val.filter(id => typeof id === 'string');

                                if (ids.length) {
                                        toSet[key] = ids;
                                }
                        }
                }

                /* booleans */
                for (const key of ['delCommands', 'noDisableWarning', 'verboseHelp']) {
                        if (typeof body[key] === 'boolean') {
                                toSet[key] = body[key];
                        }
                }

                /* admin-only */
                if (req.session.isAdmin) {
                        /* guildConfig.client */
                        if (body.client === null) {
                                toUnset.push('client');
                        } else if (typeof body.client === 'string') {
                                toSet.client = body.client;
                        }

                        /* guildConfig.caseCount */
                        if (body.caseCount === null) {
                                toUnset.push('caseCount');
                        } else if (typeof body.caseCount === 'number') {
                                toSet.caseCount = body.caseCount;
                        }

                        /* booleans */
                        for (const key of ['isIgnored', 'isPremium', 'hasPremium']) {
                                if (typeof body[key] === 'boolean') {
                                        toSet[key] = body[key];
                                }
                        }
                }

                if (!toUnset.length && !Object.keys(toSet).length) {
                        return res[400](30001, 'Invalid request body');
                }

                const update: any = { $set: {}, $unset: {} };
                for (const key of toUnset) {
                        update.$unset[key] = null;
                }
                for (const key in toSet) {
                        update.$set[key] = toSet[key];
                }

                try {
                        var result = await app.mongo.guilds
                                .findOneAndUpdate({ id: req.params.id }, update, { returnDocument: 'after' });

                        app.redis.publish(`engel:${app.staticConfig.client.state}:guilds:update`, JSON.stringify(req.params.id));
                } catch (err) {
                        app.logger.get('/api/guilds.patch').error(err);

                        return res[500]();
                }

                if (!result.value) {
                        return res[403](10001, 'Unknown guild');
                }

                return res[200](result.value);
        });
