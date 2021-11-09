import mineflayer from 'mineflayer';
import minecraftdata from 'minecraft-data';
import 'dotenv/config';
import prismarinerecipe from 'prismarine-recipe';

const testserver = {
    host: "butterflyfish.aternos.host",
    port: 25948,
    version: "1.8.9",
};

// Creating a bot
// @ts-ignore
const bot = mineflayer.createBot({
  host: testserver.host,
  port: testserver.port,
  username: process.env.MAIL,
  password: process.env.PASSWORD,
  version: testserver.version,
  auth: "mojang"
});

// mineflayer-collectblock is used to find and collect blocks
bot.loadPlugin(require('mineflayer-collectblock').plugin);

// MC Data is used to get the properties of blocks
const mcData = minecraftdata(bot.version);

// Prismarine Recipe is used to get the recipe of a block
// @ts-ignore
const Recipe = prismarinerecipe(bot.version).Recipe;

bot.on("spawn", () => {
    console.log("Bot ist online und alle Bibliotheken sind geladen! :D");
});
function collectBlock(blockID: number) {
    // Find all nearby blocks of a specific type
    const foundBlocks = bot.findBlock({
        matching: blockID,
        maxDistance: 64
    });

    // Collect the blocks if exist any
    if (foundBlocks) {
        // @ts-ignore
        bot.collectBlock.collect(foundBlocks, error => {
            if (error)
                console.log(error);
            else
                collectBlock(blockID);
        });
    }
}

function craftItem(recipe: any, amount: number) {
    // Getting the position of the crafting table
    const craftingTable = bot.findBlock({
        matching: mcData.itemsByName["crafting_table"].id,
        maxDistance: 64
    });

    if (!craftingTable) {
        bot.chat("Any Craftingtable was found!");
        return;
    }

    // Get the recipe of the item
    bot.craft(recipe, amount, craftingTable).then(() => {
        bot.chat("Crafting finished!");
    });
}

bot.on("chat", (username: string, message: string) => {
    if (username === bot.username) return;
    if (!message.startsWith('!')) return;

    // Get the command and arguments --> choose between the commands
    const args = message.slice('!'.length).trim().split(/ +/g);
    const command = args.shift()?.toLowerCase();

    switch (command) {
        case 'collect':
            // Get the block to collect
            const block = mcData.blocksByName[args[0].toLowerCase()];
            if (!block) {
                bot.chat("Please specify a block!");
                return;
            }

            // Collect the block
            collectBlock(block.id);
            bot.chat(`Collecting minecraft:${block.name}`);
            break;
        case "craft":
            // Get the item to craft
            const item = mcData.itemsByName[args[0].toLowerCase()];
            if (!item) {
                bot.chat("Please specify an item!");
                return;
            }

            // Get the crafting recipe of the item
            const recipe = Recipe.find(item.id)[0];
            if (!recipe) {
                bot.chat("This item can't be crafted!");
                return;
            }

            // Get the amount of items to craft, default is 64
            const amount = parseInt(args[1]) ?? 64;

            // Craft the item
            craftItem(recipe, amount);
            bot.chat(`Crafting ${amount}x minecraft:${item.name}`);
            break;
        default:
            // If the command is not found, send a message
            bot.chat("This isn't an valid command!");
            break;
    }
})
