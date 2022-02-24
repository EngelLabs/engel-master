import globalDefaults from './utils/globalDefaults';


export interface Listener {
        name: string;
        execute: (...args: any) => void;
}

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
        isIgnored?: boolean;
        isPremium?: boolean;
        hasPremium?: boolean;
        delCommands?: boolean;
        commands?: Record<string, CommandConfig | boolean>;
        modules?: Record<string, ModuleConfig>;
}

export interface CommandConfig extends BaseCommandConfig {
        del?: boolean;
        disabled?: boolean;
}

export interface ModuleConfig extends BaseCommandConfig {
        delCommands?: boolean;
        disabled?: boolean;
}

type _Config = typeof globalDefaults;

export interface Config extends _Config {
        commands: Record<string, GlobalCommandConfig>;
        modules: Record<string, GlobalModuleConfig>;
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