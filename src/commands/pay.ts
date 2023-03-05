import { Command } from '../interfaces'
import { sendMSG } from "../functions";

export const command: Command = {
    name: "pay",
    usage: "!pay <Amount> <Target> (Default is the Author)",
    adminsOnly: true,
    args: 1,

    run: function (rank, username, args, bot) {
        // Lets the bot pay a specific amount to a player
        const target = args[1] || username;
        bot.chat(`/pay ${target} ${args[0]}`);
        sendMSG(username, `Payed ${args[0]} to ${target}`);
    }
}
