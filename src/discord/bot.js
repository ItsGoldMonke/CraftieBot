const { Client, GatewayIntentBits, Events } = require("discord.js");

async function startDiscordBot(token) {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.once(Events.ClientReady, readyClient => {
        console.log(`Logged in discord bot as ${readyClient.user.tag}`);
    });

    client.login(token);
}

module.exports = {
    startDiscordBot,
};
