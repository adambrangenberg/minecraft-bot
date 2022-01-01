import minecraftdata from 'minecraft-data';
import { createBot } from "mineflayer";
import 'dotenv/config';
import prismarinerecipe from 'prismarine-recipe';
import * as pathfinder from 'mineflayer-pathfinder';
import { config } from './config';
import { readdirSync } from "fs";
import { sendMSG, sendWebHook } from './functions';

let commands = new Map();

// Getting the whitelisted Players out of .env and save them in an array
config.users = process.env.USERS?.split(',') ?? [];
config.admins = process.env.ADMINS?.split(',') ?? [];
const whitelist: string[] = config.users.concat(config.admins);

// Creating a bot
// @ts-ignore
let bot = createBot({
  host: config.serverIP,
  username: process.env.MAIL,
  password: process.env.PASSWORD,
  version: config.version,
  auth: "mojang"
});

// Loading all the plugins
bot.loadPlugin(require('mineflayer-collectblock').plugin);
bot.loadPlugin(require("mineflayer-auto-eat"));
bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);

// MC Data is used to get the properties of blocks
const mcData = minecraftdata(bot.version);
const defaultMove = new pathfinder.Movements(bot, mcData)

// Prismarine Recipe is used to get the recipe of a block
// @ts-ignore
const Recipe = prismarinerecipe(bot.version).Recipe;

// Load all the commands
const read = readdirSync('./src/commands'); // Before compiling change src to build
for (const file of read) {
    const { command } = require(`./commands/${file}`);
    commands.set(command.name, command);
    console.log(`Loaded ${command.name}`);
}


bot.once("spawn",async () => {
    console.log("Bot ist online! :D");
    // @ts-ignore
    bot.autoEat.options.priority = "20";
    // @ts-ignore
    bot.autoEat.options.eatingTimeout = 3;
    // @ts-ignore
    // bot.pathfinder.setMovements(defaultMove)
    await serverJoin(bot)
    console.log("Im Portal angekommen! :D")
});


bot.on("kicked", async (reason) => {
    // Will be fixed soon, at the moment it's just ending the bot
    await sendWebHook("Bot", "Bot wurde heruntergefahren...", "others");
    await sendWebHook("Kick", reason.toString(), "others");
    setTimeout(() => process.exit(), 1000);
})

bot.on("chat", async (username, message) =>{
    if (username === "Switcher") {
        // @ts-ignore
        bot.pathfinder.setGoal(null);
    }

    if (username === bot.username) return;
    await sendWebHook(username, message, "chat");
});

// Get's fired on /tell
// @ts-ignore
bot.on("whisper", async (username: string, message: string) => {
    await sendWebHook(username, message, "msg");
    if (!whitelist.includes(username) || !message.startsWith('!')) return;

    // Get the command and arguments
    const args = message.slice('!'.length).trim().split(/ +/g);
    const cmd = args.shift()?.toLowerCase();

    // IF the command is valid --> run checks
        // IF check are successful --> run command
        // ELSE reply what gone wrong
    // ELSE return that it isn't valid
    if (commands.has(cmd)) {
        const command = commands.get(cmd);

        if (command.disabled) return sendMSG(username, "This command is disabled!");
        if (command.adminsOnly && !config.admins.includes(username)) return sendMSG(username, "You are not an admin!");
        if (args.length < command.args) return sendMSG(username, `This command needs ${command.args} arguments! Usage: ${command.usage}`);

        command.run(username, args, bot);
    } else {
        return sendMSG(username, "Unknown Command!");
    }
});

// exporting all the variables from the index file
export const initStuff = {
    mcData,
    defaultMove,
    bot,
    whitelist,
    Recipe
}


