const {
    Client,
    GatewayIntentBits,
    Events,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    SectionBuilder,
    ThumbnailBuilder,
} = require("discord.js");
const { getServerStatus } = require("../core/commands/serverStatus");
const { getWithRetry } = require("../core/utils/requests");
const { createPlayerCard } = require("../core/commands/playerImage");
const messages = require("../core/utils/messages");
const config = require("../core/utils/config");

async function startDiscordBot(token) {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.once(Events.ClientReady, readyClient => {
        console.log(`Logged in discord bot as ${readyClient.user.tag}`);
    });

    client.on("interactionCreate", async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === "ping") {
            await interaction.reply("Pong!");
        }

        if (interaction.commandName === "status") {
            const edition = interaction.options.getString("edition");
            const host = interaction.options.getString("host");
            const port = interaction.options.getInteger("port");

            const status = await getServerStatus(edition, host, port);
            if (status.failed == true) {
                return await interaction.reply(`Failed: ${status.failReason}`);
            }

            const versionName = status.version;
            const motd = status.motd;
            const playersOnline = status.players?.online;
            const playersMax = status.players?.max;
            const players = status.players?.list;
            const response = status.raw;
            const srvPort = status.srv_record?.port;

            const imageUrl = status.image_url;
            console.log(status.raw);

            const container = new ContainerBuilder()
                .setAccentColor(0x95ba8e)
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder({
                                content: `# Server status of \`${status.host}:${srvPort ? srvPort : response.port}\``,
                            }),
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder({
                                content: `${response.online ? "🟢 Server Online" : "🔴 Server Offline"} \nMinecraft version: **${versionName}** \nMOTD: \`${motd}\` \nPlayers: ${playersOnline}/${playersMax}`,
                            }),
                            new TextDisplayBuilder({ content: `Online Players: ${players}` }),
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder().setURL(`${imageUrl}`).setDescription("Server Icon"),
                        ),
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true))
                .addTextDisplayComponents(new TextDisplayBuilder({ content: messages.discord.embedFooter }));
            // respond to Discord
            await interaction.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
                allowedMentions: { parse: [] },
            });
        }
        if (interaction.commandName === "player-status") {
            await interaction.reply({ content: "Generating status...", flags: MessageFlags.Ephemeral });
            const uuidOrUsername = interaction.options.getString("identifier");
            const playerData = await getWithRetry(
                config.apiUrls.playerData.replace("${uuidOrUsername}", uuidOrUsername),
                {
                    validateStatus: status => status >= 200 && status < 500,
                },
            );
            console.log(playerData);
            const userExists = playerData.data.success;
            if (!userExists) {
                console.log("Error: Player does not exist");
                return await interaction.editReply({
                    content: "Status not generated. Player does not exists. (or an error occurred)",
                });
            }
            const uuid = playerData.data.data.player.id;
            console.log("UUID:", uuid);
            const username = playerData.data.data.player.username;
            console.log("Username:", username);
            console.log("Starting to generate status message.");
            await createPlayerCard(uuid, username);
            await interaction.editReply({
                content: "Status generated: ",
                files: [
                    {
                        attachment: buffer,
                        name: "status.png",
                    },
                ],
            });
        }
        if (interaction.commandName === "help") {
            await interaction.reply(
                "Available commands:\n/help - Show this message \n/ping - Check bot latency\n/status - Check Minecraft server status\n/player-status - Get player info",
            );
        }
    });

    client.login(token);
}

module.exports = {
    startDiscordBot,
};
