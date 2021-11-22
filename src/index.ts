import minecraftdata from 'minecraft-data';
import { createBot } from "mineflayer";
import 'dotenv/config';
import prismarinerecipe from 'prismarine-recipe';
const { GoalNear } = require ('mineflayer-pathfinder').goals;
const Movements = require('mineflayer-pathfinder').Movements
import { config } from './config';
import { readdirSync } from "fs";
import { sendMSG } from './functions';

let loopCollect = true;
let commands = new Map();

config.users = process.env.USERS?.split(',') ?? [];
config.admins = process.env.ADMINS?.split(',') ?? [];
const whitelist: string[] = config.users.concat(config.admins);

// Creating a bot
// @ts-ignore
const bot = createBot({
  host: config.serverIP,
  username: process.env.MAIL,
  password: process.env.PASSWORD,
  version: config.version,
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

bot.chatAddPattern(config.msgRegex, 'msg');
bot.chatAddPattern(config.plotChatRegex, 'plotChat');
bot.chatAddPattern(config.chatmodeAlertRegex, 'chatmodeAlert');
bot.chatAddPattern(config.slowChatAlertRegex, 'slowChatAlert');
bot.chatAddPattern(config.commandSpamAlertRegex, 'commandSpamAlert');
bot.chatAddPattern(config.itemClearRegex, 'itemClearAlert');
bot.chatAddPattern(config.mobRemoverRegex, 'mobRemoverAlert');
bot.chatAddPattern(config.redstoneRegex, 'redstoneAlert');
bot.chatAddPattern(config.tpaRegex, 'tpa');
bot.chatAddPattern(config.tpaHereRegex, 'tpaHere');
bot.chatAddPattern(config.moneyDropRegex, 'moneyDrop');
bot.chatAddPattern(config.stopCollectRegex, 'stopCollect');
bot.chatAddPattern(config.stopCraftingRegex, 'stopCrafting');

function loadCommands() {
    const read = readdirSync('./src/commands');
    for (const file of read) {
        const { command } = require(`./commands/${file}`);
        commands.set(command.name, command);
        console.log(`Loaded ${command.name}`);
    }
}
loadCommands();

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
    }, config.portalCooldown);
});

bot._client.on('packet', (data, metadata) => {
    if(metadata.name == 'custom_payload' && data.channel == 'mysterymod:mm') {
        const dataBuffer = data.data;

        let i = 0;
        let j = 0;
        let b0;

        do {
            b0 = dataBuffer.readInt8();
            i |= (b0 & 127) << j++ * 7;
            if (j > 5) {
                return;
            }
        } while((b0 & 128) == 128);

        const key = dataBuffer.slice(0, i+1).toString();
        const message = dataBuffer.slice(i+1).toString();

        if (key.includes('mysterymod_user_check')) {
            bot._client.write('custom_payload', {
                channel: 'mysterymod:mm',
                data: Buffer.from(message)
            });
        }
    }
});

// @ts-ignore
bot.on("tpa", (rank: string, username: string) => {
    bot.chat("/tpaccept")
    console.log( `${rank} | ${username} wurde zu mir teleportiert!`);
});

// @ts-ignore
bot.on("tpaHere", (rank: string, username: string) => {
    bot.chat("/tpaccept")
    console.log( `Ich wurde zu ${rank} | ${username} teleportiert!`);
});

function clearInv(username: string) {
    const person = bot.nearestEntity();
    if (person) {
        bot.lookAt(person.position);
    }
    return new Promise<void>(async resolve => {
        const inv = bot.inventory.items();
        console.log(inv);
        for (let i = 0; i < inv.length; i++) {
            try {
                const item = inv[i];
                if (item.name.includes("axe") || item.name.includes("sword") || item.name.includes("shovel") || item.name.includes("hoe") || item.name.includes("pickaxe") || item.name.includes("helmet") || item.name.includes("chestplate") || item.name.includes("leggings") || item.name.includes("boots")) {
                    sendMSG(username, "I can't drop Tools or Armor, otherwise I would be kicked! Please kill me.");
                    continue;
                }
                // bot.toss(item.type, null, item.count);
                bot.tossStack(item);
            } catch (error) {
                console.log(error);
            }
        }

        sendMSG(username, "Inventory cleared!")
        resolve();
    });
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
    console.log(`${rank} | ${username} >> ${message}`);
    if (!whitelist.includes(username) || !message.startsWith('!')) return;

    // Get the command and arguments
    const args = message.slice('!'.length).trim().split(/ +/g);
    const cmd = args.shift()?.toLowerCase();

    if (commands.has(cmd)) {
        const command = commands.get(cmd);

        if (command.disabled) return sendMSG(username, "This command is disabled!");
        if (command.adminsOnly && !whitelist.includes(username)) return sendMSG(username, "You are not an admin!");
        if (args.length < command.args) return sendMSG(username, `This command needs ${command.args} arguments! Usage: ${command.usage}`);

        command.run(rank, username, args, bot);
    } else {
        return sendMSG(username, "Unknown Command! Use !help for a list of commands");
    }
});

// @ts-ignore
bot.on("chat", (username: string, message: string) => {
    return;
    console.log(`${username} | ${message}`);
    if (!whitelist.includes(username)) return;
    if (!message.startsWith('!')) return;

    // Get the command and arguments --> choose between the commands
    const args = message.slice('!'.length).trim().split(/ +/g);
    const command = args.shift()?.toLowerCase();

    switch (command) {
        case 'clearinv':
            clearInv(username);
            break;

        case 'runcommand':
            if (!config.admins.includes(username)) return;
            if (args.length === 0) {
                sendMSG(username, "Please specify an command!");
                return;
            }
            bot.chat(`${args.join(' ')}`);
            break;

        case 'pay':
            if (!config.admins.includes(username)) return;
            if (args.length < 2) {
                sendMSG(username, "Please specify a player and an amount!");
                return;
            }
            bot.chat (`/pay ${args[0]} ${args[1]}`);
            sendMSG(username, `Payed ${args[1]} to ${args[0]}`);
            break;
        default:
            // If the command is not found, send a message
            sendMSG(username, "This isn't an valid command!");
            console.log(bot.heldItem)
            break;
    }
})

export const initStuff = {
    mcData,
    defaultMove,
    bot,
    whitelist,
    Recipe
}
