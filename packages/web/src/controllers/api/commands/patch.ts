import type * as express from 'express';
import type * as mongoose from 'mongoose';
import type * as types from '@engel/types';
import type Core from '../../../core/Core';

export = async function (core: Core, req: express.Request, res: express.Response) {
        const command = core.commands.get(<string>req.body.name);

        if (!command) return core.responses[403](res, 10002, 'Unknown command');

        let update: mongoose.UpdateQuery<types.CommandConfig>;

        function set(key: keyof types.CommandConfig, value: any, type?: types.Primitives) {
                if (value === null) {
                        update = update || {};
                        update.$unset = update.$unset || {};
                        update.$unset[key] = null;
                } else {
                        /* eslint-disable-next-line valid-typeof */
                        if (type !== undefined && typeof value !== type) {
                                return;
                        }

                        update = update || {};
                        update.$set = update.$set || {};
                        update.$set[key] = value;
                }
        }

        if (req.body.disabled !== undefined) {
                if (!command.isSubcommand) {
                        set('disabled', req.body.disabled, 'boolean');
                } else if (req.body.disabled !== null) {
                        set('disabled', req.body.disabled, 'boolean');
                }
        }

        if (!command.isSubcommand) {
                if (req.body.del !== undefined) {
                        set('del', req.body.del, 'boolean');
                }

                for (const key of ['allowedRoles', 'ignoredRoles', 'allowedChannels', 'ignoredChannels']) {
                        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                                if (req.body[key] instanceof Array) {
                                        set(<keyof types.CommandConfig>key, (<any[]>req.body[key]).filter(o => typeof o === 'string' && o.length));
                                } else if (req.body[key] === null) {
                                        set(<keyof types.CommandConfig>key, null);
                                }
                        }
                }
        }

        if (!update) {
                return core.responses[400](res, 30001, 'Invalid response body');
        }

        if (!command.isSubcommand) {
                if (update.$set) {
                        for (const key in update.$set) {
                                update.$set[`commands.${command.name}.${key}`] = update.$set[key];

                                delete update.$set[key];
                        }
                }

                if (update.$unset) {
                        for (const key in update.$unset) {
                                update.$unset[`commands.${command.name}.${key}`] = update.$unset[key];

                                delete update.$unset[key];
                        }
                }
        } else {
                update.$set[`commands.${command.name}`] = update.$set.disabled;

                delete update.$set.disabled;
        }

        try {
                var result = await core.models.Guild
                        .findOneAndUpdate({ id: req.params.id }, update, { new: true })
                        .lean()
                        .exec();

                core.redis.publish('guildUpdate', req.params.id);
        } catch (err) {
                core.log(err, 'error', 'api/commands.patch');

                return core.responses[500](res);
        }

        if (!result) {
                return core.responses[403](res, 10001, 'Unknown guild');
        }

        return core.responses[200](res, result.commands?.[command.name] || {});
}
