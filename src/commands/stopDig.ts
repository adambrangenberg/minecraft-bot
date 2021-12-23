import { Command } from '../interfaces'
import { sendMSG } from "../functions";

export const command: Command = {
    name: "stopDig",
    usage: "!stopDig",
    args: 0,
    run: function (username, args, bot) {
        // @ts-ignore
        bot.emit("stopDig");
    }
}
