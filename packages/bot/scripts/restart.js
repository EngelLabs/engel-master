const jayson = require('jayson/promise');
const cliProgress = require('cli-progress');
const env = require('@engel/env-util').config({ ignoreMissing: true });
const { baseConfig, createLogger } = require('@engel/core');

const logger = createLogger(baseConfig);

let progBar;

const port = Number(env.int('PORT', 8050));

const target = process.argv[2];
const ids = process.argv.slice(3);

logger.info(`Connecting to port ${port}`);

if (target) {
        const client = jayson.client.http({ port });
        client.request('restart', { target, id: ids, statusPort: 8051 })
                .then(({ error }) => {
                        if (error) {
                                logger.error(`Something went wrong: ${error}`);
                                process.nextTick(() => process.exit());
                        }
                });
} else {
        logger.info('No target specified, attempting to load progress bar for a already running restart...');
}

const server = new jayson.Server({
        update: ({ count, total }, cb) => {
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
                cb(null);
        }
});

server.http().listen(8051);
