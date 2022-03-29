export default class Collection<T extends {
    name: string;
    aliases?: string[];
}> extends Map {
    unique(): Set<T>;
    add(item: T): void;
    remove(item: T): void;
    set(key: string, value: T): this;
    get(key: string): T | undefined;
    delete(key: string): boolean;
}
