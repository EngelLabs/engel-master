import type * as express from 'express';
import type App from '../../../core/structures/App';

export = async function (app: App, req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!req.session.token) {
                return app.responses[401](res, 20001);
        }

        if (req.session.isAdmin) {
                return next();
        }

        const guildID = req.params.id;

        const guild = req.session.guilds.find(g => g.id === guildID);

        if (!guild) {
                return app.responses[403](res, 10001, 'Unknown guild');
        }

        return next();
}
