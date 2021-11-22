export const config = {
    serverIP: 'griefergames.net',
    serverPort: 25565,
    version: '1.8.9',
    defaultCooldown: 3050,
    slowCooldown: 4050,
    portalCooldown: 12000,
    msgRegex: /^\[(\w+) \u2503 (\u007E?\u0021?\w{1,16}) -> mir\] (.+)$/,
    plotChatRegex: /^\[Plot\-Chat\]\[(.+)\] (\w+) \u2503 (\u007E?\u0021?\w{1,16}) \: (.+)$/,
    chatmodeAlertRegex: /^\[Chat\] Der Chat wurde von (\w+) \u2503 (\u007E?\u0021?\w{1,16}) (.+)\.$/,
    slowChatAlertRegex: /^\[GrieferGames\] Du kannst nur jede 10 Sekunden schreiben\.$/,
    commandSpamAlertRegex: /^Bitte unterlasse das Spammen von Commands!$/,
    payRegex: /^(.+) \u2503 (\u007E?\u0021?\w{1,16}) hat dir \$(\S+) gegeben\.$/,
    moneyDropRegex: /^\$(\S+) wurde zu deinem Konto hinzugefügt\.$/,
    redstoneRegex: /^- Redstone (?:ist wieder )?(\w+)\!?$/,
    itemClearRegex: /^\[GrieferGames\] Warnung! Die auf dem Boden liegenden Items werden in (\w{2}) Sekunden entfernt\!$/,
    mobRemoverRegex: /^\[MobRemover\] Achtung! In (\w{1}) Minuten werden alle Tiere gelöscht\.$/,
    tpaRegex: /^([A-Za-z\-]+\+?) \u2503 (\u007E?\u0021?\w{1,16}) fragt, ob er sich zu dir teleportieren darf.$/,
    tpaHereRegex: /^([A-Za-z\\-]+\+?) \u2503 (\u007E?\u0021?\w{1,16}) fragt, ob du dich zu ihm teleportierst.$/,
    stopCollectRegex: /^\[(\w+) \u2503 (\u007E?\u0021?\w{1,16}) -> mir\] !stopCollect/,
    stopCraftingRegex: /^\[(\w+) \u2503 (\u007E?\u0021?\w{1,16}) -> mir\] !stopCrafting/,

    // Coded expressions
    // These only match if tested against coded messages.
    // §f, §l, §r, etc.
    codedPayRegex: /^(.+)\u2503 (.+) §ahat dir \$(\S+) gegeben\.$/,

    admins: [""],
    users: [""]
};
