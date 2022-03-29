"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../structures/Base");
class Renderer extends Base_1.default {
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
exports.default = Renderer;
//# sourceMappingURL=Renderer.js.map