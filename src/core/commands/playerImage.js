const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { getWithRetry } = require("../utils/requests");
const config = require("../utils/config");
const size = config.images.size;
async function createPlayerCard(uuid, username) {
    let errorsOccurred = false;
    const canvas = createCanvas(size.width, size.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#3e3e3e";
    ctx.fillRect(0, 0, size.width, size.height);
    ctx.strokeStyle = "#00000065";
    ctx.strokeRect(0, 0, size.width, size.height);
    console.log("Created canvas and background.");
    // Get head image
    try {
        const response = await getWithRetry(
            config.apiUrls.playerHead.replace("${uuid}", uuid).replace("${size}", size.height / 2),
            {
                responseType: "arraybuffer",
                timeout: config.defaults.timeout,
            },
        );
        const head = await loadImage(Buffer.from(response.data));
        ctx.drawImage(
            head,
            (size.width / 4) * 3 - size.width / 20, // 560
            size.height / 4,
            size.height / 2,
            size.height / 2,
        );
        console.log("Loaded player head image.");
    } catch (err) {
        console.log("Failed to load player head image.", err);
        errorsOccurred = true;
    }
    const fontSize = 32 * (size.width / 800); // The font size is calculated based on a size of 32px on the default width of 800px
    ctx.font = `${fontSize} Minecraft`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Player Info for ${username}:`, size.width / 40, size.height / 10);
    console.log("Wrote player info text.");
    ctx.fillText(`UUID: ${uuid}`, size.width / 40, size.height / 5);
    // Get player's body image
    try {
        const response = await getWithRetry(
            config.apiUrls.playerBody.replace("${uuid}", uuid).replace("${size}", size.height / (2 + 2 / 3)),
            {
                responseType: "arraybuffer",
                timeout: config.defaults.timeout,
            },
        );
        const skin = await loadImage(Buffer.from(response.data));
        ctx.drawImage(
            skin,
            size.width / 40,
            size.height / 4,
            size.height / (2 + 2 / 3),
            (size.height / (2 + 2 / 3)) * 2,
        );

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
