// @ts-nocheck
import { Command } from '../interfaces'
import { sendMSG } from "../functions";

// @ts-nocheck
export const command: Command = {
    name: "name",
    usage: "nutzung",
    args: 0,
    adminsOnly: false,
    disabled: false,
    run: function (rank, username, args, bot) {
        // sendMSG(username, "Stopping...")
    }
}
