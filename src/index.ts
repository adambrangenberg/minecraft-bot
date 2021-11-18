import minecraftdata from 'minecraft-data';
import { createBot } from "mineflayer";
import 'dotenv/config';
import prismarinerecipe from 'prismarine-recipe';
const { GoalNear } = require ('mineflayer-pathfinder').goals;
const Movements = require('mineflayer-pathfinder').Movements
import { config } from './config';

let loopCollect = true;
config.USERS = process.env.USERS?.split(',') ?? [];
config.ADMINS = process.env.ADMINS?.split(',') ?? [];

// Creating a bot
// @ts-ignore
const bot = createBot({
  host: config.SERVER_IP,
  username: process.env.MAIL,
  password: process.env.PASSWORD,
  version: config.VERSION,
  auth: "mojang"
});

// mineflayer-collectblock is used to find and collect blocks
bot.loadPlugin(require('mineflayer-collectblock').plugin);
bot.loadPlugin(require("mineflayer-auto-eat"));
bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);

// MC Data is used to get the properties of blocks
const mcData = minecraftdata(bot.version);
const defaultMove = new Movements(bot, mcData)

// Prismarine Recipe is used to get the recipe of a block
// @ts-ignore
const Recipe = prismarinerecipe(bot.version).Recipe;

bot.chatAddPattern(config.MSG_REGEXP, 'msg');
bot.chatAddPattern(config.PLOTCHAT_REGEXP, 'plotchat');
bot.chatAddPattern(config.CHATMODE_ALERT_REGEXP, 'chatModeAlert');
bot.chatAddPattern(config.SLOWCHAT_ALERT_REGEXP, 'slowChatAlert');
bot.chatAddPattern(config.COMMANDSPAM_ALERT_REGEXP, 'commandSpamAlert');
bot.chatAddPattern(config.ITEMCLEAR_REGEXP, 'itemClearAlert');
bot.chatAddPattern(config.MOBREMOVER_REGEXP, 'mobClearAlert');
bot.chatAddPattern(config.REDSTONE_REGEXP, 'redstoneAlert');
bot.chatAddPattern(config.TPA_REGEXP, 'tpa');
bot.chatAddPattern(config.TPAHERE_REGEXP, 'tpahere');
bot.chatAddPattern(config.MONEYDROP_REGEXP, 'moneydrop');

bot.once("spawn", () => {
    console.log("Bot ist online und alle Bibliotheken sind geladen! :D");
    // @ts-ignore
    bot.autoEat.options.priority = "20";
    // @ts-ignore
    bot.autoEat.options.eatingTimeout = 3;

    bot.chat("/portal");
    const p = {
        x: 317.5,
        y: 67,
        z: 321,
    };
    // @ts-ignore
    bot.pathfinder.setMovements(defaultMove)
    setTimeout(async () => {
        // @ts-ignore
        await bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1));
    },config.PORTAL_COOLDOWN);
});

bot.on("spawn", () => {
    console.log("Joined");
})

// @ts-ignore
bot.on("tpa", (rank: string, username: string) => {
    bot.chat("/tpaccept")
    console.log( `${rank} | ${username} wurde zu mir teleportiert!`);
});

// @ts-ignore
bot.on("tpahere", (rank: string, username: string) => {
    bot.chat("/tpaccept")
    console.log( `Ich wurde zu ${rank} | ${username} teleportiert!`);
});

function collectBlock(blockID: number, username: string) {
    // Find all nearby blocks of a specific type
    const foundBlocks = bot.findBlock({
        matching: blockID,
        maxDistance: 64
    });

    // Collect the blocks if exist any
    if (foundBlocks) {
        // @ts-ignore
        bot.collectBlock.collect(foundBlocks, error => {
            if (error)
                console.log(error);
            else if (!loopCollect) {
                loopCollect = true;
                sendMSG(username, "Stopped!")
                return;
            } else collectBlock(blockID, username);
        });
    }
}

function craftItem(recipe: any, amount: number, username: string) {
    // Getting the position of the crafting table
    const craftingTable = bot.findBlock({
        matching: mcData.itemsByName["crafting_table"].id,
        maxDistance: 64
    });

    if (!craftingTable) {
        sendMSG(username, "Any Craftingtable was found!");
        return;
    }

    // Get the recipe of the item
    bot.craft(recipe, amount, craftingTable).then(() => {
        sendMSG(username, "Crafting finished!");
    });
}

function sendMSG(user: string, message: string) {
    bot.chat(`/msg ${user} ${message}`);
}
bot.on("chat", (username, message) =>{
    if (username === "Switcher") {
        // @ts-ignore
        bot.pathfinder.setGoal(null);
    }
    if (username === bot.username) return;
    console.log(`${username}: ${message}`);
});

// @ts-ignore
bot.on("msg", (rank: string, username: string, message: string) => {
    console.log(`${rank} | ${username} | ${message}`);
    if (!config.USERS.includes(username) && !config.ADMINS.includes(username)) return;
    if (!message.startsWith('!')) return;

    // Get the command and arguments --> choose between the commands
    const args = message.slice('!'.length).trim().split(/ +/g);
    const command = args.shift()?.toLowerCase();

    switch (command) {
        case 'collect':
            if (args.length === 0) {
                sendMSG(username, "Stopping...");
                loopCollect = false;
                return;
            }

            // Get the block to collect
            const block = mcData.blocksByName[args[0]?.toLowerCase()];
            if (!block) {
                sendMSG(username, "Please specify a block!");
                return;
            }

            // Collect the block
            collectBlock(block.id, username);
            sendMSG(username, `Collecting minecraft:${block.name}`);
            break;
        case "craft":
            // Get the item to craft
            const item = mcData.itemsByName[args[0].toLowerCase()];
            if (!item) {
                sendMSG(username, "Please specify an item!");
                return;
            }

            // Get the crafting recipe of the item
            const recipe = Recipe.find(item.id)[0];
            if (!recipe) {
                sendMSG(username, "This item can't be crafted!");
                return;
            }

            // Get the amount of items to craft, default is 64
            const amount = parseInt(args[1]) ?? 64;

            // Craft the item
            craftItem(recipe, amount, username);
            sendMSG(username, `Crafting ${amount}x minecraft:${item.name}`);
            break;
        default:
            // If the command is not found, send a message
            sendMSG(username, "This isn't an valid command!");
            break;
    }
})
