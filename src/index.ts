import mineflayer from 'mineflayer';
import minecraftdata from 'minecraft-data';
import 'dotenv/config';

const testserver = {
    host: "TigerbyteDev.aternos.me",
    port: 25565,
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

// MC Data is used to get the properties of blocks
const mcData = minecraftdata(bot.version);

console.log("Bot ist online! :D");

// mineflayer-collectblock is used to find and collect blocks
bot.loadPlugin(require('mineflayer-collectblock').plugin);

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
        default:
            bot.chat("This isn't an valid command!");
            break;
    }
})
