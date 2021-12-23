import { Bot } from 'mineflayer';

export interface Command {
    name: string;
    usage: string;
    args: number;
    adminsOnly?: boolean;
    disabled?: boolean;
    run(username: string, args: string[], bot: Bot): any;
}