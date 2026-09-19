require("dotenv").config();

const { GlobalFonts } = require("@napi-rs/canvas");
const { startSlackBot } = require("./slack/bot");

const registered = GlobalFonts.registerFromPath("src/fonts/MinecraftDefault-Regular.ttf", "Minecraft");

console.log("Registered Fonts:", registered);

async function main() {
    await startSlackBot(process.env.SLACK_BOT_TOKEN, process.env.SLACK_APP_TOKEN, true);
}

main();
