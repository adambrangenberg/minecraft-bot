import {initStuff} from "./index";
import mcapi from "minecraft-lookup";
// @ts-ignore
import {Webhook} from 'simple-discord-webhooks';
import {Bot} from 'mineflayer';

export function sendMSG(username: string, message: string) {
    initStuff.bot.chat(`/msg ${username} ${message}`);
}

export async function sendWebHook(username: string, message: string, channel: string) {
    let hookID: any = null;
    switch (channel) {
        case 'moneyDrops':
            // @ts-ignore
            hookID = process.env.MONEYDROPS_WEBHOOK;
            break;
        case 'chat':
            if (["Download", "GrieferGames", "Switcher", "SHOP", "MysteryMod", "News", "Switcher", "Freunde", "Usage"].includes(username)) {
                break;
            }
            if (message.includes("┃") || message.includes("mir]")) {
                break;
            }
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
        const head = await mcapi.head(username, 2000);
        const hook = new Webhook(hookID, `${username}`, head.helmavatar);
        hook.send(message);
    } catch (error) {
        console.log(error);
    }
}

export async function solveAfkChallenge(bot: Bot, window: any) {
    const items: any = window.slots;
    const slot = items[0].slot;

    try {
        await waitForClickSlot(bot, slot);
        await waitForCloseWindow(bot);
    } catch (e) {
        throw e;
    }

    return true;
}

export function waitForClickSlot(bot: Bot, slot: any) {
    return new Promise(async (resolve) => {
        await bot.clickWindow(slot, 0, 0, resolve);
    });
}

export function waitForCloseWindow(bot: Bot) {
    return new Promise<void>((resolve) => {
        bot.once('windowClose', () => {
            resolve();
        });
    })
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