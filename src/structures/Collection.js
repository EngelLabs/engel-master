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
        return super.set(key.toLowerCase ? key.toLowerCase() : key, value);
    }

    get(key, value) {
        return super.get(key.toLowerCase ? key.toLowerCase() : key, value);
    }

    delete(key, value) {
        return super.delete(key.toLowerCase ? key.toLowerCase() : key, value);
    }
}


module.exports = Collection;