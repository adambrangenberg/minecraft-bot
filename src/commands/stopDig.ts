import { Command } from '../interfaces'

export const command: Command = {
    name: "stopDig",
    usage: "!stopDig",
    args: 0,

    run: function (username, args, bot) {
        // @ts-ignore
        bot.emit("stopDig");
    }
}