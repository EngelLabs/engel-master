import * as ioredis from 'ioredis';
import type App from '../structures/App';
export default function Redis(app: App, shouldLog?: boolean): ioredis.Redis;
