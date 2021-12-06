class Collection extends Map {
    unique() {
        return new Set(this.values());
    }
}


module.exports = Collection;