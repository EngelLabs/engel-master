declare const _default: {
    name: string;
    version: string;
    lib: string;
    env: string;
    dev: boolean;
    logger: {
        level: string;
        dir: string;
    };
    client: {
        state: string;
        premium: boolean;
        id: string;
        token: string;
        secret: string;
    };
    mongo: {
        host: string;
        port: string;
        db: string;
    };
    redis: {
        host: string;
        port: number;
    };
};
export default _default;
