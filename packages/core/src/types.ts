import type * as winston from 'winston';

export interface Logger extends winston.Logger {
        get(name: string): Logger;
}
