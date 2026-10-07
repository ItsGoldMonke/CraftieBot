require("dotenv").config();
const { GlobalFonts } = require("@napi-rs/canvas");
const { startSlackBot } = require("./slack/bot");
const { startDiscordBot } = require("./discord/bot");
const config = require("./core/utils/config");

const registered = GlobalFonts.registerFromPath(`src/fonts/${config.images.font}`, "Minecraft");

console.log("Registered Fonts:", registered);

async function main() {
    await startSlackBot(process.env.SLACK_BOT_TOKEN, process.env.SLACK_APP_TOKEN, true);
    await startDiscordBot(process.env.DISCORD_BOT_TOKEN);
}

main();
