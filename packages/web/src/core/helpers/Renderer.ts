import type * as express from 'express';
import Base from '../structures/Base';

interface _Renderer {
        [key: string]: (req: express.Request, res: express.Response) => void;
}

// Needs to be declared like this so typescript doesn't complain about -
// the interface being incompatible with the Base class
interface Renderer extends _Renderer { }

class Renderer extends Base {
        index(req: express.Request, res: express.Response) {
                res.locals.scripts.push('/js/react/homepage.js');
                res.locals.stylesheets.push('/css/index.css');

                return res.render('index');
        }

        dashboard(req: express.Request, res: express.Response) {
                res.locals.scripts.push('/js/react/dashboard.js');
                res.locals.stylesheets.push('/css/dashboard.css');

                return res.render('index');
        }
}

// Exported here as the interface and class have either both be exported or not -
// and we obviously can't have two default exports.
export default Renderer;
