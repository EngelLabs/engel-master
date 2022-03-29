/// <reference types="node" />
import * as fs from 'fs';
import * as eris from 'eris';
import type * as types from '@engel/types';
export declare const readdir: typeof fs.readdir.__promisify__;
export declare function capitalize(str?: string): string;
export declare function getTopRole(guild: eris.Guild | undefined): eris.Role | undefined;
export declare function sleep(ms: number): Promise<void>;
export declare function sendMessage(channel: string | eris.TextableChannel, content: string | types.AdvancedMessageContent, type?: types.ResponseType): Promise<eris.Message | null>;
export declare function addReaction(channel: string | eris.TextableChannel, message: string | eris.Message, type: types.ResponseType): Promise<void>;
export declare function removeReaction(channel: string | eris.TextableChannel, message: string | eris.Message, type: types.ResponseType): Promise<void>;
