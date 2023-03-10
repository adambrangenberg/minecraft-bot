import { Command } from '../interfaces'
import { sendMSG, getBlock } from "../functions";
import { initStuff } from '../index';

export const command: Command = {
    name: "collect",
    usage: "!collect <Blockname>",
    args: 1,

    async run(rank, username, args, bot) {
        // Other do dig that includes pathfinding too
        // @ts-ignore
        bot.emit("stopCollect");

        if (args[0] === "stop") {
            return
        }

        let loopCollect: boolean = true;

        // @ts-ignore
        bot.once("stopCollect", () => {
            if (!initStuff.whitelist.includes(username)) return;
            loopCollect = false
            sendMSG(username, "Stopping...")
        });

        // Get the block to collect
        const block = await getBlock(args[0], username);
        if (!block) return;

        collectBlock();
        sendMSG(username, `Collecting minecraft:${block.name}`);

        function collectBlock() {
            // Find the block
            const foundBlocks = bot.findBlock({
                matching: block.id,
                maxDistance: 64
            });

            // Collect the block if it exists
            if (foundBlocks) {
                // @ts-ignore
                bot.collectBlock.collect(foundBlocks, error => {

                    // Loop the process
                    if (error) {
                        console.log(error);
                    } else if (loopCollect) {
                        collectBlock();
                    } else {
                        sendMSG(username, "Stopped!");
                    }
                });
            }
        }
    }
}