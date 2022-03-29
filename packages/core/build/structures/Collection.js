"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Collection extends Map {
    unique() {
        return new Set(this.values());
    }
    add(item) {
        this.set(item.name, item);
        if (item.aliases) {
            for (const alias of item.aliases) {
                this.set(alias, item);
            }
        }
    }
    remove(item) {
        this.delete(item.name);
        if (item.aliases) {
            for (const alias of item.aliases) {
                this.delete(alias);
            }
        }
    }
    set(key, value) {
        var _a;
        return super.set(((_a = key === null || key === void 0 ? void 0 : key.toLowerCase) === null || _a === void 0 ? void 0 : _a.call(key)) || key, value);
    }
    get(key) {
        var _a;
        return super.get(((_a = key === null || key === void 0 ? void 0 : key.toLowerCase) === null || _a === void 0 ? void 0 : _a.call(key)) || key);
    }
    delete(key) {
        var _a;
        return super.delete(((_a = key === null || key === void 0 ? void 0 : key.toLowerCase) === null || _a === void 0 ? void 0 : _a.call(key)) || key);
    }
}
exports.default = Collection;
//# sourceMappingURL=Collection.js.map