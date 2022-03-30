import type * as express from 'express';
import type App from '../../core/structures/App';

const inviteUrl = 'https://discord.com/api/oauth2/authorize?client_id=827788394401890374&permissions=0&scope=bot';

export = function (app: App, req: express.Request, res: express.Response) {
        return res.redirect(inviteUrl);
}
