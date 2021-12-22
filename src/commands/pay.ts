import { Command } from '../interfaces'
import { sendMSG } from "../functions";

export const command: Command = {
    name: "pay",
    usage: "!pay <Target> (Default is the Author) <Amount>",
    adminsOnly: true,
    args: 1,

    run: function (rank, username, args, bot) {
        // Let's the bot bay an specific amount to an player
        const target = args[0] || username;
        bot.chat(`/pay ${target} ${args[1]}`);
        sendMSG(username, `Payed ${args[1]} to ${target}`);
    }
}
