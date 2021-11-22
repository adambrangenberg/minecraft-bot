import { initStuff } from "./index";

export function sendMSG(username: string, message: string) {
    initStuff.bot.chat(`/msg ${username} ${message}`);
}