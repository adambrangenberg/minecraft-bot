import minecraftdata from 'minecraft-data';
import { createBot } from "mineflayer";
import 'dotenv/config';
import prismarinerecipe from 'prismarine-recipe';
const { GoalNear } = require ('mineflayer-pathfinder').goals;
const Movements = require('mineflayer-pathfinder').Movements
import { config } from './config';
import { readdirSync } from "fs";
import { sendMSG, sendWebHook, solveAfkChallenge } from './functions';

let commands = new Map();
let currentCB = 'Offline';

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
bot.chatAddPattern(config.stopDigRegex, 'stopDig');

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


bot.on("kicked", async (reason) => {
    reason = JSON.parse(reason);
    await sendWebHook("Kick", reason.toString(), "others");

    switch(reason.toString()) {
        case "Der Server wird heruntergefahren.":

            setTimeout(() => {
                // @ts-ignore
                bot = createBot({
                    host: config.serverIP,
                    username: process.env.MAIL,
                    password: process.env.PASSWORD,
                    version: config.version,
                    auth: "mojang"
                });
            }, 3600000); // 60min
            break;
        case "Du bist schon zu oft online!":
            sendWebHook("Bot", "Bot wurde heruntergefahren...", "others");
            setTimeout(() => process.exit(), 1000);
            break;
        default:
            // @ts-ignore
            bot = createBot({
                host: config.serverIP,
                username: process.env.MAIL,
                password: process.env.PASSWORD,
                version: config.version,
                auth: "mojang"
            });    }
})

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

    // Emit scoreboard server updates.
    if (metadata.name === 'scoreboard_team' && data.name === 'server_value') {
        const serverName = data.prefix.replace(/\u00A7[0-9A-FK-OR]/gi, '');
        if(serverName != undefined && serverName.trim() != '' && !serverName.includes('Laden')) {
            currentCB = serverName;
        }
    }
});

bot.on('windowOpen', (window) => {
    let title = JSON.parse(window.title);

    if (window.type == 'minecraft:container' && title && title.includes('§cAFK?')) {
        solveAfkChallenge(bot, window).catch(() => console.error('Failed solving AFK challenge.'));
    }

});

// @ts-ignore
bot.on("tpa", async (rank: string, username: string) => {
    bot.chat("/tpaccept")
    await sendWebHook(username, `**${rank} | ${username}** wurde zu mir teleportiert!`, "other");
});

// @ts-ignore
bot.on("tpaHere", async (rank: string, username: string) => {
    bot.chat("/tpaccept")
     await sendWebHook(username, `Ich wurde zu **${rank} | ${username}** teleportiert!`, "other");
});

bot.on("chat", async (username, message) =>{
    if (username === "Switcher") {
        // @ts-ignore
        bot.pathfinder.setGoal(null);
    }
    if (username === bot.username) return;
    await sendWebHook(username, message, "chat");
});

// @ts-ignore
bot.on("moneyDrop", async (username: string, amount: number) => {
    await sendWebHook("MoneyDrop", `Es gab einen Moneydrop von ${amount}!`, "moneyDrops");
});

// @ts-ignore
bot.on("msg", async (rank: string, username: string, message: string) => {
    await sendWebHook(username, message, "msg");
    // console.log(`${rank} | ${username} >> ${message}`);
    if (!whitelist.includes(username) || !message.startsWith('!')) return;
    if (message.includes("stop")) return;
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

export const initStuff = {
    mcData,
    defaultMove,
    bot,
    whitelist,
    Recipe,
    currentCB
}
