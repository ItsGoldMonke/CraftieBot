const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { getWithRetry } = require("./requests");

async function createPlayerCard(uuid, username) {
    let errorsOccurred = false;
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#3e3e3e";
    ctx.fillRect(0, 0, 800, 400);
    ctx.strokeStyle = "#00000065";
    ctx.strokeRect(0, 0, 800, 400);
    console.log("Created canvas and background.");

    try {
        const response = await getWithRetry(`https://api.mcheads.org/head/${uuid}/200`, {
            responseType: "arraybuffer",
            timeout: 5000,
        });
        const head = await loadImage(Buffer.from(response.data));
        ctx.drawImage(head, 560, 100, 200, 200);
        console.log("Loaded player head image.");
    } catch (err) {
        console.log("Failed to load player head image.", err);
        errorsOccurred = true;
    }

    ctx.font = "32px Minecraft";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Player Info for ${username}:`, 20, 40);
    console.log("Wrote player info text.");
    ctx.fillText(`UUID: ${uuid}`, 20, 80);

    try {
        const response = await getWithRetry(`https://api.mcheads.org/player/${uuid}/150`, {
            responseType: "arraybuffer",
            timeout: 5000,
        });
        const skin = await loadImage(Buffer.from(response.data));
        ctx.drawImage(skin, 20, 100, 150, 300);

        console.log("Loaded player skin image.");
    } catch (err) {
        console.log("Failed to load player skin image.", err);
        errorsOccurred = true;
    }
    console.log("Created Buffer");
    return ((buffer = canvas.toBuffer("image/png")), errorsOccurred);
}

module.exports = {
    createPlayerCard,
};
