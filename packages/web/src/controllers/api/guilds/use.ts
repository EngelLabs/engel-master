import type * as express from 'express';
import type App from '../../../core/structures/App';

export = async function (app: App, req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!req.session.token) {
                return res[401](20001);
        }

        if (req.session.isAdmin) {
                return next();
        }

        const guildID = req.params.id;

        const guild = req.session.guilds.find(g => g.id === guildID);

        if (!guild) {
                return res[403](10001, 'Unknown guild');
        }

        return next();
}
