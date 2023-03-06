import { Command } from '../interfaces'
import { initStuff } from "../index";
import { sendMSG } from "../functions";

export const command: Command = {
    name: "craft",
    usage: "!craft <Item> <Resulting Amount> <Amount to craft>",
    args: 2,

    run: function (rank, username, args, bot) {
        // Get the item to craft
        const item = initStuff.mcData.itemsByName[args[0].toLowerCase()];
        if (!item) {
            sendMSG(username, "Please specify an item!");
            return;
        }

        // Get the crafting recipe of the item
        const recipe = initStuff.Recipe.find(item.id, item.variations?.find(i => i.displayName === args[0].toLowerCase())?.metadata ?? null)[0];
        console.log(item.variations?.find(i => i.displayName === args[0].toLowerCase())?.metadata)
        if (!recipe) {
            sendMSG(username, "This item can't be crafted!");
            return;
        }

        // Getting the position of the crafting table
        const craftingTable = bot.findBlock({
            matching: initStuff.mcData.itemsByName["crafting_table"].id,
            maxDistance: 64
        });

        if (!craftingTable) {
            sendMSG(username, "Any Craftingtable was found!");
            return;
        }

        // Get the amount of items to craft
        const amount = parseInt(args[2]);

        if (!amount) {
            // Parsing the parameters
            if (!args[1]) return sendMSG(username, "Please specify an resulting amount per process!");
            const resultAmount = parseInt(args[1]);
            if (resultAmount < 1) return sendMSG(username, "Please specify a valid amount!");

            let stopCrafting = true;

            // @ts-ignore
            bot.once("stopCrafting", () => {
                stopCrafting = false;
                sendMSG(username, "Stopping...");
            });

            function craftItem() {
                // Craft the item
                // @ts-ignore
                bot.craft(recipe, 1, craftingTable).then(async () => {
                    await bot.toss(item.id, null, resultAmount);
                    // Loop the process
                    if (stopCrafting) {
                        sendMSG(username, "Crafting stopped!");
                        return;
                    } else {
                        craftItem()
                    }
                });
            }
            craftItem();

            sendMSG(username, `Started crafting minecraft:${item.name} until stop Command!`);
        } else {
            // Parsing the parameters
            if (!args[1]) return sendMSG(username, "Please specify an resulting amount per process!");
            const resultAmount = parseInt(args[1]);
            if (resultAmount < 1) return sendMSG(username, "Please specify a valid amount!");
            const repeats = Math.round(resultAmount/amount);

            sendMSG(username, `Crafting minecraft:${item.name} for ${amount} times!`)

            // Craft the item
            bot.craft(recipe, repeats, craftingTable).then(async () => {
                await bot.toss(item.id, null, amount);
                sendMSG(username, `Crafted minecraft:${item.name} for ${amount} times!`);
            });
        }

    }
}
