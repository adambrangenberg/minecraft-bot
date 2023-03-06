import { Command } from '../interfaces'
import { sendMSG } from "../functions";
const { GoalNear } = require ('mineflayer-pathfinder').goals;

export const command: Command = {
    name: "come",
    usage: "!come",
    args: 0,
    run: async function (rank, username, args, bot) {
        // Find the player
        const target = bot.players[username] ? bot.players[username].entity : null
        if (!target) return sendMSG(username, "I can't see you! D:");
        const {x, y, z} = target?.position;

        sendMSG(username, `Coming to ${x}x ${y}y ${z}z`);

        // and walk to it
        await bot.pathfinder.setGoal(new GoalNear(x, y, z, 0 ));
        sendMSG(username, "Arrived.")
    }
}
