import type * as express from 'express';
import type Core from '../../../core/Core';

export = async function (core: Core, req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!req.session.token) {
                return core.responses[401](res, 20001);
        }

        if (req.session.isAdmin) {
                return next();
        }

        const guildID = req.params.id;

        const guild = req.session.guilds.find(g => g.id === guildID);

        if (!guild) {
                return core.responses[403](res, 10001, 'Unknown guild');
        }

        return next();
}
