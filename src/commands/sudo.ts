import { Command } from '../interfaces'
import { sendMSG } from "../functions";

export const command: Command = {
    name: "sudo",
    usage: "!sudo <Command> (Slash already integrated)",
    adminsOnly: true,
    args: 1,

    run: function (rank, username, args, bot) {
        // Lets the bot run a command
        const command = args.join(" ");
        bot.chat(`/${command}`);
        sendMSG(username, `I've ran /${command}`);
    }
}
