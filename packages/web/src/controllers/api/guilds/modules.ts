import Controller from '../../../core/structures/Controller';

export default new Controller('/api/guilds/:id/modules')
        .patch(async (app, req, res) => {
                const body = req.body;
                const module = app.config.modules[<string>body.name];

                if (!module) return res[403](10002, 'Unknown module');

                // TODO: Type this?
                const toUnset: any[] = [];
                const toSet: any = {};

                /* moduleConfig.disabled */
                if (typeof body.disabled === 'boolean') {
                        toSet.disabled = body.disabled;
                }

                /* moduleConfig.delCommands */
                if (typeof body.delCommands === 'boolean') {
                        toSet.delCommands = body.delCommands;
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

                if (!toUnset.length && !Object.keys(toSet).length) {
                        return res[400](30001, 'Invalid response body');
                }

                const update: any = { $set: {}, $unset: {} };
                for (const key of toUnset) {
                        update.$unset[`modules.${module.dbName}.${key}`] = null;
                }
                for (const key of toSet) {
                        update.$set[`modules.${module.dbName}.${key}`] = toSet[key];
                }

                try {
                        var result = await app.mongo.guilds
                                .findOneAndUpdate({ id: req.params.id }, update, { returnDocument: 'after' });

                        app.redis.publish(`engel:${app.staticConfig.client.state}:guilds:update`, JSON.stringify(req.params.id));
                } catch (err) {
                        app.logger.get('api/modules.patch').error(err);

                        return res[500]();
                }

                if (!result.value) {
                        return res[403](10001, 'Unknown guild');
                }

                return res[200](result.value.modules?.[module.dbName]);
        });
