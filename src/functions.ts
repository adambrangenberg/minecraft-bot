import { initStuff } from "./index";
import mcapi from "minecraft-lookup";
// @ts-ignore
import { Webhook } from 'simple-discord-webhooks';

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
            if (["Download", "GrieferGames", "Switcher", "SHOP", "MysteryMod", "News", "Switcher", "Freunde"].includes(username)) {
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
        console.log(head.helmavatar);
        const hook = new Webhook(hookID, `${username}`, head.helmavatar);
        hook.send(message);
    } catch (error) {
        console.log(error);
    }
}