import * as ioredis from 'ioredis';
import type Core from '../structures/Core';
export default function Redis(core: Core, shouldLog?: boolean): ioredis.Redis;
