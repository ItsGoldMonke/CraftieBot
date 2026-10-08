const { App } = require("@slack/bolt");
const { getWithRetry } = require("../core/utils/requests");
const { createPlayerCard } = require("../core/commands/playerImage");
const { getServerStatus } = require("../core/commands/serverStatus");
const config = require("../core/utils/config");
const messages = require("../core/utils/messages");

async function startSlackBot(token, apptoken, socketMode) {
    const app = new App({
        token: token,
        appToken: apptoken,
        socketMode: socketMode,
    });

    app.command("/craftie-help", async ({ command, ack, respond }) => {
        await ack();
        console.log(`acknowledged command: ${command.text}`);
        await respond({
            text: `
        Available commands:
        /craftie-help - Show this message
        /craftie-ping - Check bot latency
        /craftie-status - Check Minecraft server status
        /craftie-player - Get player info`,
        });
    });

    app.command("/craftie-ping", async ({ command, ack, respond }) => {
        const start = Date.now();
        await ack();
        const latency = Date.now() - start;
        await respond({ text: `Pong!\nLatency: ${latency}ms` });
    });

    app.command("/craftie-player", async ({ command, ack, respond, client }) => {
        await ack();
        console.log(`acknowledged command: ${command.text}`);
        try {
            // Send inital message to indicate that the bot is processing the request and in order to create a thread.
            const message = await client.chat.postMessage({
                channel: command.channel_id,
                thread_ts: command.ts,
                text: "Generating status...",
            });
            console.log(`Sent initial message: ${message.ts}`);

            const args = command.text.trim().split(/\s+/);
            const uuidOrUsername = args[0]; // The UUID or username of the player.

            if (!uuidOrUsername) {
                console.log("No UUID or username provided.");
                return await client.chat.update({
                    channel: command.channel_id,
                    ts: message.ts,
                    text: messages.errors.invalidArgs,
                });
            }
            const playerData = await getWithRetry(
                config.apiUrls.playerData.replace("${uuidOrUsername}", uuidOrUsername),
                {
                    validateStatus: status => status >= 200 && status < 500,
                },
            );
            const userExists = playerData.data.success;
            if (!userExists) {
                console.log("Error: Player does not exist.");
                return await client.chat.update({
                    channel: command.channel_id,
                    ts: message.ts,
                    text: messages.errors.noUserFound,
                });
            }
            const uuid = playerData.data.data.player.id;
            console.log("UUID:", uuid);
            const username = playerData.data.data.player.username;
            console.log("Name:", username);

            console.log("Starting to generate status image...");
            const { buffer, errorsOccurred } = await createPlayerCard(uuid, username);

            await client.chat.update({
                channel: command.channel_id,
                ts: message.ts,
                text: "Status generated successfully! Find in thread.",
            });

            const result = await client.filesUploadV2({
                channel_id: command.channel_id,
                thread_ts: message.ts,
                file: buffer,
                filename: "status.png",
            });

            console.log("Uploaded file");

            if (errorsOccurred) {
                const occurredErrors = await client.chat.postMessage({
                    channel: command.channel_id,
                    thread_ts: message.ts,
                    text: "Errors may have occurred while generating the status. If the image is missing or incomplete, please try again for a full image.",
                });
            }
        } catch (err) {
            console.log(err);
            console.log(`Error occurred. See above`);
            await respond({
                text: messages.errors.playerFetchFailed,
            });
        }
    });

    app.command("/craftie-status", async ({ command, ack, respond }) => {
        await ack();
        console.log(`acknowledged command: ${command.text}`);

        try {
            const args = command.text.trim().split(/\s+/);

            const edition = args[0]; // Argument 'java' or 'bedrock' for which MC edition the server is.
            const host = args[1]; // The ip adress or domain the mincraft server is hosted on.
            const port = args[2]; // optional argument if the server is hosted on a non-standard port.

            if (!edition || !host) {
                return respond({ text: messages.slack.remindUsage });
            }

            // get status and return if failed
            const status = await getServerStatus(edition, host, port);
            if (status.failed == true) {
                return respond({ text: status.failReason });
            }

            const versionName = status.version;
            const motd = status.motd;
            const playersOnline = status.players?.online;
            const playersMax = status.players?.max;
            const players = status.players?.list;
            const response = status.raw;

            let srvPort = status.srv_record?.port;

            const imageUrl = status.image_url;

            await respond({
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `Server Status of ${status.host}:${srvPort ? srvPort : response.port}
    ${response.online ? "🟢 Server Online" : "🔴 Server Offline"}
    Minecraft version: ${versionName}
    MOTD: \`${motd}\`
    Players: ${playersOnline}/${playersMax}
    Online Players: ${players}`,
                        },
                        accessory: {
                            type: "image",
                            image_url: `${imageUrl}`,
                            alt_text: "Server Icon",
                        },
                    },
                ],
            });
        } catch (err) {
            console.log(err);
            await respond({
                text: messages.errors.serverFetchFailed,
            });
        }
    });

    await app.start();
    console.log("bot is running!");
}

module.exports = {
    startSlackBot,
};
