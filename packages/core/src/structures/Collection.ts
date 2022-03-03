/**
 * Abstract base class for named objects
 */
export default class Collection<T extends { name: string, aliases?: string[] }> extends Map {
        /**
         * Get a unique set of values
         */
        unique(): Set<T> {
                return new Set(this.values());
        }

        /**
         * Add an item
         */
        add(item: T): void {
                this.set(item.name, item);

                if (item.aliases) {
                        for (const alias of item.aliases) {
                                this.set(alias, item);
                        }
                }
        }

        /**
         * Remove an item
         */
        remove(item: T): void {
                this.delete(item.name);

                if (item.aliases) {
                        for (const alias of item.aliases) {
                                this.delete(alias);
                        }
                }
        }

        set(key: string, value: T): this {
                return super.set(key?.toLowerCase?.() || key, value);
        }

        get(key: string): T | undefined {
                return super.get(key?.toLowerCase?.() || key);
        }

        delete(key: string): boolean {
                return super.delete(key?.toLowerCase?.() || key);
        }
}
