import type * as express from 'express';
import type * as mongoose from 'mongoose';
import type * as types from '@engel/types';
import type Core from '../../../core/Core';

export = async function (core: Core, req: express.Request, res: express.Response) {
        const module = core.modules.get(<string>req.body.name);

        if (!module) return core.responses[403](res, 10002, 'Unknown module');

        let update: mongoose.UpdateQuery<types.ModuleConfig>;

        function set(key: keyof types.ModuleConfig, value: any, type?: types.Primitives) {
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
                set('disabled', req.body.disabled, 'boolean');
        }

        if (req.body.delCommands !== undefined) {
                set('delCommands', req.body.delCommands, 'boolean');
        }

        for (const key of ['allowedRoles', 'ignoredRoles', 'allowedChannels', 'ignoredChannels']) {
                if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                        if (req.body[key] instanceof Array) {
                                set(<keyof types.ModuleConfig>key, (<any[]>req.body[key]).filter(o => typeof o === 'string' && o.length));
                        } else if (req.body[key] === null) {
                                set(<keyof types.ModuleConfig>key, null);
                        }
                }
        }

        // switch (module.dbName) {
        //         case 'mod':
        //                 if (typeof req.body.responses === 'object') {
        //                         const guildConfig = await core.models.Guild
        //                                 .findOne({ id: req.params.id })
        //                                 .lean()
        //                                 .exec();

        //                         if (!guildConfig || !guildConfig.isPremium) {
        //                                 break;
        //                         }

        //                         const customResponseKeys = [
        //                                 'ban',
        //                                 'block',
        //                                 'kick',
        //                                 'lock',
        //                                 'mute',
        //                                 'unban',
        //                                 'unblock',
        //                                 'unlock',
        //                                 'unmute',
        //                                 'warn'
        //                         ];

        //                         for (const key in req.body.responses) {
        //                                 const val = req.body.responses[<keyof {}>key];

        //                                 if (customResponseKeys.includes(key) && typeof val === 'string') {
        //                                         update = update || {};
        //                                         update.mod = update.mod || {};
        //                                         update.mod.responses = update.mod.responses || {};
        //                                         update.mod.responses[key] = val;
        //                                 }
        //                         }
        //                 }
        // }

        if (!update) {
                return core.responses[400](res, 30001, 'Invalid response body');
        }

        if (update.$set) {
                for (const key in update.$set) {
                        update.$set[`modules.${module.dbName}.${key}`] = update.$set[key];

                        delete update.$set[key];
                }
        }

        if (update.$unset) {
                for (const key in update.$unset) {
                        update.$unset[`modules.${module.dbName}.${key}`] = update.$unset[key];

                        delete update.$unset[key];
                }
        }

        try {
                var result = await core.models.Guild
                        .findOneAndUpdate({ id: req.params.id }, update, { new: true })
                        .lean()
                        .exec();

                core.redis.publish('guildUpdate', req.params.id);
        } catch (err) {
                core.log(err, 'error', 'api/modules.patch');

                return core.responses[500](res);
        }

        if (!result) {
                return core.responses[403](res, 10001, 'Unknown guild');
        }

        return core.responses[200](res, result.modules?.[module.dbName] || {});
}
