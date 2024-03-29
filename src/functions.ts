import { initStuff } from "./index";
import mcapi from "minecraft-lookup";
import * as pathfinder from "mineflayer-pathfinder";
import { Webhook } from "simple-discord-webhooks";
import { Bot } from "mineflayer";
import { config } from "./config";
// @ts-ignore
import {mineflayer} from "prismarine-viewer";
import { MSGData } from "./interfaces";

export function startWebView(bot: Bot, port = 3000) {
  console.log("Starting Web GUI...")
  mineflayer(bot, {
    port,
    firstPerson: false,
    viewDistance: 6
  })

  // Draw the path followed by the bot
  const path = [bot.entity.position.clone()]
  bot.on('move', () => {
    if (path[path.length - 1].distanceTo(bot.entity.position) > 1) {
      path.push(bot.entity.position.clone())
      // @ts-ignore
      bot.viewer.drawLine('path', path)
    }
  })
  console.log("WebGUI gestartet, zugänglich auf http://localhost:" + port)

}
export function sendMSG(username: string, message: string) {
  initStuff.bot.chat(`/msg ${username} ${message}`);
}

// The Function to join on GrieferGames.net CB Nature
export async function serverJoin(bot: Bot) {
  bot.chat("/portal");

  // Coords of the Portal
  const p = {
    x: 317.5,
    y: 67,
    z: 321
  };

  // Moving to the portal
  bot.pathfinder.setMovements(initStuff.defaultMove);
  setTimeout(async () => {
    bot.once("spawn", () => {
      startWebView(bot)
      sendWebHook({username: "Bot", message: "Bot wurde gestartet!"}, "other")
    })
    await bot.pathfinder.setGoal(new pathfinder.goals.GoalNear(p.x, p.y, p.z, 1));
  }, config.portalCooldown);
}



export async function sendWebHook({ message, username, clan, rank }: MSGData, channel: "moneyDrops" | "chat" | "msg" | "other") {
  let hookID: any = null;
  let complete = false;

  // Get the type of channel
  switch (channel) {
    case "moneyDrops":
      hookID = process.env.MONEYDROPS_WEBHOOK;
      break;
    case "chat":
      // Whitelist DON'T REMOVE !!!!! RATE LIMITS !!!!!
      if (["Download", "GrieferGames", "Switcher", "SHOP", "MysteryMod", "News", "Switcher", "Freunde", "Usage", "Multiplikator", "Booster", "CaseOpening"].includes(username)) {
        break;
      }
      if (message.includes("mir]")) {
        break;
      }

      if (username === "Streamer") {
        hookID= process.env.OTHERS_WEBHOOK;
        break;
      }

      hookID = process.env.CHAT_WEBHOOK;
      complete = true;
      break;
    case "msg":
      hookID = process.env.MSG_WEBHOOK;
      break;
    case "other":
      hookID = process.env.OTHERS_WEBHOOK;
      break;
    default:
      hookID = null;
      break;
  }
  if (!hookID) return;
  let hook
  let hasClan
  try {
    // Getting the properties out of Minecraft API
    const hasRank = rank === undefined ? username : `${rank} ┃ ${username}`;
    hasClan = clan === undefined ? hasRank : `[${clan}] ` + hasRank
    const head = await mcapi.head(username, 2000);
    hook = new Webhook(hookID, `${hasClan}`, head.helmavatar);
    await hook.send(`\`${message}\``);
  } catch (error) {
    console.log("Failed to send WebHook message due to RateLimits.");
    console.log("Username:", hook?.username)
    console.log("Message:", hasClan)
    console.log("")
  }
}

export async function solveAfkChallenge(bot: Bot, window: any) {
  const items: any = window.slots;
  const slot = items[0].slot;

  try {
    // Well... Click the Slot
    await waitForClickSlot(bot, slot);
    // And wait for the server to close the windows
    await waitForCloseWindow(bot);
  } catch (e) {
    throw e;
  }

  return true;
}

export async function waitForClickSlot(bot: Bot, slot: any) {
  await bot.clickWindow(slot, 0, 0);
}

export function waitForCloseWindow(bot: Bot) {
  return new Promise<void>((resolve) => {
    bot.once("windowClose", () => {
      resolve();
    });
  });
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