import { Command } from '../interfaces'
import { sendMSG, getBlock, findBlocks } from "../functions";
import { initStuff } from '../index';

export const command: Command = {
    name: "dig",
    usage: "!dig <Blockname>",
    args: 1,

    run: async function (rank, username, args, bot) {
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
        sendMSG(username, `Collecting minecraft:${block.name}`);

        async function collectBlock() {
            const foundBlock = await findBlocks(block.id, bot);

            // Collect the blocks if exist any
            if (foundBlock) {
                // @ts-ignore
                await bot.dig(foundBlock, true, () => {
                    if (loopCollect) {
                        collectBlock();
                    } else {
                        sendMSG(username, "Stopped!");
                    }
                });
            }
        }
    }
}