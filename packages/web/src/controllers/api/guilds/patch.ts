import type * as express from 'express';
import type * as mongoose from 'mongoose';
import type * as types from '@engel/types';
import type App from '../../../core/structures/App';

export = async function (app: App, req: express.Request, res: express.Response) {
        let update: mongoose.UpdateQuery<types.Guild>;

        function set(key: keyof types.Guild, value: any, type?: types.Primitives) {
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

        if (req.body.prefixes !== undefined) {
                if (req.body.prefixes == null) {
                        set('prefixes', app.config.prefixes.default);
                } else if (req.body.prefixes instanceof Array) {
                        req.body.prefixes = req.body.prefixes
                                .filter(p => typeof p === 'string' && p.length && p.length <= 12);

                        set('prefixes', (<string[]>req.body.prefixes).length
                                ? req.body.prefixes
                                : app.config.prefixes.default
                        );
                }
        }

        if (req.body.delCommands !== undefined) {
                set('delCommands', req.body.delCommands, 'boolean');
        }

        if (req.body.muteRole !== undefined) {
                set('muteRole', req.body.muteRole, 'string');
        }

        for (const key of ['allowedRoles', 'ignoredRoles', 'allowedChannels', 'ignoredChannels']) {
                if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                        if (req.body[key] instanceof Array) {
                                set(<keyof types.Guild>key, (<any[]>req.body[key]).filter(o => typeof o === 'string' && o.length));
                        } else if (req.body[key] === null) {
                                set(<keyof types.Guild>key, null);
                        }
                }
        }

        if (req.body.noDisableWarning !== undefined) {
                set('noDisableWarning', req.body.noDisableWarning, 'boolean');
        }

        if (req.body.verboseHelp !== undefined) {
                set('verboseHelp', req.body.verboseHelp, 'boolean');
        }

        if (req.session.isAdmin) {
                for (const key of ['isIgnored', 'isPremium', 'hasPremium']) {
                        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                                set(<keyof types.Guild>key, req.body[key], 'boolean');
                        }
                }
                if (req.body.client !== undefined) {
                        set('client', req.body.client, 'string');
                }

                if (req.body.caseCount !== undefined) {
                        set('caseCount', req.body.caseCount, 'number');
                }
        }

        if (!update) {
                return app.responses[400](res, 30001, 'Invalid request body');
        }

        try {
                var result = await app.models.Guild
                        .findOneAndUpdate({ id: req.params.id }, update, { new: true })
                        .lean()
                        .exec();

                app.redis.publish('guildUpdate', req.params.id);
        } catch (err) {
                app.logger.get('/api/guilds.patch').error(err);

                return app.responses[500](res);
        }

        if (!result) {
                return app.responses[403](res, 10001, 'Unknown guild');
        }

        return app.responses[200](res, result);
}
