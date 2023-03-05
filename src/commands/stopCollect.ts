import { Command } from '../interfaces'

export const command: Command = {
    name: "stopCollect",
    usage: "!stopCollect",
    args: 0,
    run: function (username, args, bot) {
        // @ts-ignore
        bot.emit("stopCollect");
    }
}