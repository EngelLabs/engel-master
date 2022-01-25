const Base = require('../structures/Base');


class Renderer extends Base {
        index(req, res) {
                res.locals.scripts.push('/js/react/homepage.js');
                res.locals.stylesheets.push('/css/index.css');

                return res.render('index');
        }

        dashboard(req, res) {
                res.locals.scripts.push('/js/react/dashboard.js');
                res.locals.stylesheets.push('/css/dashboard.css');
                
                return res.render('index');
        }
}


module.exports = Renderer;