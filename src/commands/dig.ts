import { Command } from '../interfaces'
import { sendMSG, getBlock, findBlocks } from "../functions";
import { initStuff } from '../index';

export const command: Command = {
    name: "dig",
    usage: "!dig <Blockname>",
    args: 1,

    async run(rank, username, args, bot) {
        if (args[0] === "stop") {
            // @ts-ignore
            bot.emit("stopDig");
            return
        }

        // other to collect that doesn't include pathfinding --> the bot stands still
        let loopCollect: boolean = true;

        // @ts-ignore
        bot.once("stopDig", () => {
            if (!initStuff.whitelist.includes(username)) return;
            loopCollect = false
            sendMSG(username, "Stopping...")
        });

        // Get the block to collect
        const block = await getBlock(args[0], username);

        await collectBlock();
        sendMSG(username, `Collecting ${block.name}`);

        async function collectBlock() {
            // Find the block
            const foundBlock = await findBlocks(block.id, bot);

            // Collect the block if it exists
            if (foundBlock) {
                // @ts-ignore
                await bot.dig(foundBlock, true, () => {
                    // Loop the process
                    if (loopCollect) {
                        collectBlock();
                    } else {
                        sendMSG(username, "Stopped!");
                    }
                });
            } else {
                // If all blocks near are mined after 3 seconds --> stop digging
                setTimeout(async () => {
                    const foundBlock = await findBlocks(block.id, bot);
                    // @ts-ignore
                    if (!foundBlock) return bot.emit("stopDig");
                }, 3000);
            }
        }
    }
}