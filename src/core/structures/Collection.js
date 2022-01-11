class Collection extends Map {
    get(key) {
        return super.get(key && key.toLowerCase ? key.toLowerCase() : key);
    }

    set(key, value) {
        return super.set(key && key.toLowerCase ? key.toLowerCase() : key, value);
    }
    
    delete(key) {
        return super.delete(key && key.toLowerCase ? key.toLowerCase() : key, value);
    }
}


module.exports = Collection;