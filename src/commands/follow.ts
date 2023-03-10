import { Command } from "../interfaces";
import { sendMSG } from "../functions";

const { GoalFollow } = require("mineflayer-pathfinder").goals;

export const command: Command = {
  name: "follow",
  usage: "!follow <Person>",
  args: 0,

  async run(rank, username, args, bot) {
    if (args[0] === "stop") {
      // @ts-ignore
      bot.emit("stopFollow");
      return
    }

    let follow = true;
    // @ts-ignore
    bot.once("stopFollow", () => {
      follow = false;
      bot.pathfinder.setGoal(null);
      sendMSG(username, "Stop following...");
    });

    const user = args[0] ?? username;
    const target = bot.players[user] ? bot.players[user].entity : null;
    if (!target) return sendMSG(username, "I can't see them! D:");
    try {
      while (follow) {
        await bot.pathfinder.goto(new GoalFollow(target, 1));
      }
    } catch (error) {
      // @ts-ignore
      bot.emit("stopFollow");
      sendMSG(username, "I couldn't seem to find a good path...")
    }
  }
};