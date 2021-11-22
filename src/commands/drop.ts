import { Command } from '../interfaces'
import { sendMSG } from "../functions";

export const command: Command = {
    name: "drop",
    usage: "!drop <Item> <Anzahl>",
    args: 2,
    adminsOnly: false,
    disabled: false,
    run: function (rank, username, args, bot) {
        // @ts-ignore
        bot.emit("stopCollect");
        // sendMSG(username, "Stopping...")
    }
}
