"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@engel/core");
class Base extends core.Base {
    get express() {
        return this.app.express;
    }
}
exports.default = Base;
//# sourceMappingURL=Base.js.map