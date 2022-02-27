interface VoidFunc {
        (...args: any): void;
        [s: string]: unknown;
}

export interface ListenerObject {
        name?: string;
        event?: string;
        execute: (...args: any) => void;
}

export type Listener = VoidFunc | ListenerObject;

export interface Task {
        (): void;
        actual?: NodeJS.Timer;
}

export type LogLevels = 'debug' | 'info' | 'warn' | 'error';

interface BaseCommandConfig {
        allowedRoles?: string[];
        ignoredRoles?: string[];
        allowedChannels?: string[];
        ignoredChannels?: string[];
}

export interface GuildConfig extends BaseCommandConfig {
        // Used by GuildCollection
        _cachedAt?: number;
        id: string;
        client: string;
        prefixes: string[];
        muteRole?: string;
        isIgnored?: boolean;
        isPremium?: boolean;
        hasPremium?: boolean;
        delCommands?: boolean;
        commands?: Record<string, CommandConfig | boolean>;
        modules?: Record<string, ModuleConfig>;
        noDisableWarning?: boolean;
        caseCount?: number;
}

export interface CommandConfig extends BaseCommandConfig {
        del?: boolean;
        disabled?: boolean;
}

export interface ModuleConfig extends BaseCommandConfig {
        delCommands?: boolean;
        disabled?: boolean;
}

export interface GlobalCommandConfig {
        name: string;
        info?: string;
        module: string;
        usage?: string;
        cooldown?: number;
        aliases?: string[];
        disabled?: boolean;
        examples?: string[];
        requiredArgs?: number;
        alwaysEnabled?: boolean;
        requiredPermissions?: string[];
}

export interface GlobalModuleConfig {
        name: string;
        info?: string;
        dbName: string;
        alises?: string[];
        disabled?: boolean;
        allowedByDefault?: boolean;
}

export interface CommandLog {
        name: string;
        message: any; // TODO: Type this
        failed?: boolean;
        created: Number;
}

export interface Config {
        state: string;
        author: { id: string; name: string };
        prefixes: { private: string[]; default: string[]; dm: string[] };
        guilds: { official: { id: string; invite: string }; protected: string[]; testing: string[] };
        users: { developers: string[]; protected: string[]; testers: string[]; blacklisted: string[] };
        webhooks: { errorLog: { id: string; token: string }; guildLog: { id: string; token: string } };
        colours: { info: number; error: number; success: number; loading: number; premium: number };
        emojis: { info: string; error: string; success: string; loading: string; premium: string, staff: string };
        commands: Record<string, CommandConfig>;
        modules: Record<string, ModuleConfig>;
        disableEmojis: boolean;
        globalCooldown: number;
        commandCooldown: number;
        cooldownWarn: boolean;
        cooldownWarnDelete: boolean;
        cooldownWarnDeleteAfter: number;
        adminOnly: boolean;
        configRefreshInterval: number;
        messageCache: boolean;
        messageUncacheInterval: number;
        messageMaxAge: number;
        guildCache: boolean;
        guildUncacheInterval: number;
        guildMaxAge: number;
        paused: boolean;
        apiToken: string;
        dmCommands: boolean;
}

export interface Giveaway {
        guild: string;
        author: string;
        message: string;
        title: string;
        info: string;
        item: string;
        expiry: number;
}

export interface ModLog {
        case: number;
        type: string;
        created: Number;
        expiry?: Number;
        duration?: number;
        guild: string;
        channel?: ModLogChannel;
        count?: number;
        user?: ModLogUser;
        mod: ModLogUser;
        reason?: string;
}

export interface ModLogChannel {
        id: string;
        name: string;
}

export interface ModLogUser {
        id: string;
        name: string;
}

export interface Tag {
        name: string;
        content: string;
        guild: string;
        author: string;
        createdAt: Number;
        editedAt?: Number;
}

export interface WebLog {
        guild: string;
        user: string;
        info: string;
        date: Number;
}
