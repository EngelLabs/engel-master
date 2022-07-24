import type * as express from 'express';
import type App from '../../../core/structures/App';

export = async function (app: App, req: express.Request, res: express.Response) {
        const body = req.body;
        const command = app.commands.get(<string>body.name);

        if (!command) return app.responses[403](res, 10002, 'Unknown command');

        // TODO: Type this?
        const toUnset: any[] = [];
        const toSet: any = {};

        /* commandConfig.disabled */
        if (typeof body.disabled === 'boolean') {
                toSet.disabled = body.disabled;
        }

        if (!command.isSubcommand) {
                /* commandConfig.del */
                if (typeof body.del === 'boolean') {
                        toSet.del = body.del;
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
        }

        if (!toUnset.length && !Object.keys(toSet).length) {
                return app.responses[400](res, 30001, 'Invalid response body');
        }

        const update: any = { $set: {}, $unset: {} };
        if (command.isSubcommand) {
                update.$set[`commands.${command.name}`] = toSet.disabled;
        } else {
                for (const key of toUnset) {
                        update.$unset[`commands.${command.name}.${key}`] = null;
                }
                for (const key of toSet) {
                        update.$set[`commands.${command.name}.${key}`] = toSet[key];
                }
        }

        try {
                var result = await app.mongo.guilds
                        .findOneAndUpdate({ id: req.params.id }, update, { returnDocument: 'after' });

                app.redis.publish('guildUpdate', req.params.id);
        } catch (err) {
                app.logger.get('api/commands.patch').error(err);

                return app.responses[500](res);
        }

        if (!result.value) {
                return app.responses[403](res, 10001, 'Unknown guild');
        }

        return app.responses[200](res, result.value.commands?.[command.name]);
}
