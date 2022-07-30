const jayson = require('jayson/promise');
const cliProgress = require('cli-progress');
const env = require('@engel/env-util').config({ ignoreMissing: true });
const { createLogger, createStaticConfig, Redis, App } = require('@engel/core');

const app = new App();
app.staticConfig = createStaticConfig();
const logger = app.logger = createLogger(app);
const redis = new Redis(app);

let progBar;

const port = Number(env.int('PORT', 8050));

const target = process.argv[2];
const ids = process.argv.slice(3);

logger.info(`Connecting to port ${port}`);

if (target) {
        const client = jayson.client.http({ port });
        client.request('restart', { target, id: ids })
                .then(({ error }) => {
                        if (error) {
                                logger.error(`Something went wrong: ${error}`);
                                process.nextTick(() => process.exit());
                        }
                });
} else {
        logger.info('No target specified, attempting to load progress bar for a already running restart...');
}

redis.subscribe(`engel:${app.staticConfig.client.state}:clusters:restart`);
redis.on('message', (_, status) => {
        const { count, total } = JSON.parse(status);

        if (!progBar) {
                progBar = new cliProgress.SingleBar({
                        format: 'Progress | {bar} {percentage}% | ETA: {eta}s | {value}/{total} Processes',
                        barCompleteChar: '\u25CF',
                        barIncompleteChar: '\u25CB',
                        hideCursor: true,
                        stopOnComplete: true
                });
                progBar.start(total);
        }
        if (count) {
                progBar.update(count);
        }
        if (count === total) {
                process.nextTick(() => process.exit());
        }
});
