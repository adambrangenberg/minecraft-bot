import { Command } from '../interfaces'
import { sendMSG } from "../functions";
import {initStuff} from "../index";

export const command: Command = {
    name: "drop",
    usage: "!drop <Item> <Anzahl>",
    args: 2,

    run: function (rank, username, args, bot) {
        // Get the item to drop
        const item = initStuff.mcData.itemsByName[args[0].toLowerCase()];
        if (!item) {
            sendMSG(username, "Please specify an item!");
            return;
        }

        // Get the amount to drop
        const amount = parseInt(args[1]);

        bot.toss(item.id, null, amount, () => {
            sendMSG(username, `Dropped ${amount} of ${item.name}`);
        });

        // @ts-ignore
        bot.emit("stopCollect");
        // sendMSG(username, "Stopping...")
    }
}
