import { initStuff } from "./index";
import mcapi from "minecraft-lookup";
// @ts-ignore
import { Webhook } from 'simple-discord-webhooks';
import { Bot } from 'mineflayer';

export function sendMSG(username: string, message: string) {
    initStuff.bot.chat(`/tell ${username} ${message}`);
}

export async function sendWebHook(username: string, message: string, channel: string) {
    let hookID: any = null;

    // Get the type of channel
    switch (channel) {
        case 'moneyDrops':
            // @ts-ignore
            hookID = process.env.MONEYDROPS_WEBHOOK;
            break;
        case 'chat':
            // @ts-ignore
            hookID = process.env.CHAT_WEBHOOK;
            break;
        case 'msg':
            // @ts-ignore
            hookID = process.env.MSG_WEBHOOK;
            break;
        case 'other':
            // @ts-ignore
            hookID = process.env.OTHERS_WEBHOOK;
            break;
        default:
            // @ts-ignore
            hookID = null;
            break;
    }
    if (!hookID) return;
    try {
        // Getting the properties out of Minecraft API
        const head = await mcapi.head(username, 2000);
        const hook = new Webhook(hookID, `${username}`, head.helmavatar);
        hook.send(`\`${message}\``);
    } catch (error) {
        console.log(error);
    }
}

export function getBlock(blockname: string, username: string) {
    const block = initStuff.mcData.blocksByName[blockname.toLowerCase()];
    if (!block) {
        sendMSG(username, "Please specify a block!");
    }
    return block;
}

export function findBlocks(blockid: number, bot: Bot) {
    return bot.findBlock({
        matching: blockid,
        maxDistance: 64
    });
}