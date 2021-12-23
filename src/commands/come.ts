import { Command } from '../interfaces'
import { sendMSG } from "../functions";
const { GoalNear } = require ('mineflayer-pathfinder').goals;

export const command: Command = {
    name: "come",
    usage: "!come",
    args: 0,
    run: async function (username, args, bot) {
        // Find the player
        const target = bot.players[username] ? bot.players[username].entity : null
        if (!target) return sendMSG(username, "I can't see you! D:");
        const position = target?.position;

        sendMSG(username, "Coming...");

        // and walk to it
        // @ts-ignore
        await bot.pathfinder.setGoal(new GoalNear(position.x, position.y, position.z, 1));
    }
}
