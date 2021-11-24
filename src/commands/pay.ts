import { Command } from '../interfaces'
import { sendMSG } from "../functions";

export const command: Command = {
    name: "pay",
    usage: "!pay <Ziel> (Default: Author) <Anzahl>",
    args: 1,

    run: function (rank, username, args, bot) {
        const target = args[0] || username;
        bot.chat(`/pay ${target} ${args[1]}`);
        sendMSG(username, `Payed ${args[1]} to ${target}`);
    }
}
