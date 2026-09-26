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
    ButtonBuilder,
    ButtonStyle,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    ActionRowBuilder,
} = require("discord.js");
const { getServerStatus } = require("../core/commands/serverStatus");

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
                await interaction.reply(`Failed: ${status.failreason}`);
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
                .addTextDisplayComponents(
                    new TextDisplayBuilder({ content: "From Craftie, a bot built by <@758275913821192202>" }),
                );
            // respond to Discord
            await interaction.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
                allowedMentions: { parse: [] },
            });
        }
    });

    client.login(token);
}

module.exports = {
    startDiscordBot,
};

// example from dweeb:
// Components V2 message — discord.js v14.19 or newer.
// Designed in DWEEB (https://dweeb.faizo.net). Edit the text, then send.

const container = new ContainerBuilder()
    .setAccentColor(0xd57474)
    .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            [
                "# 🧩 The Components V2 starter kit",
                "A hands-on tour of every block DWEEB gives you — and it's all live. **Click any component in the editor to edit it**, watch the preview update instantly, then hit **Send** or **Share** when it looks right.",
            ].join("\n"),
        ),
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large))
    .addSectionComponents(
        new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "**Sections** set a short stack of text beside a single accessory. Pair one with a **thumbnail** — like this — for profile cards, product shots, and tidy call-outs.",
                ),
            )
            .setThumbnailAccessory(
                new ThumbnailBuilder()
                    .setURL("https://dweeb.faizo.net/media/defaults/dweeb-default-thumbnail.jpg")
                    .setDescription("Thumbnail accessory"),
            ),
        new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    "Give a section a **button** instead and the same layout becomes an action card: a headline, a line of detail, and one tappable action docked on the right.",
                ),
            )
            .setButtonAccessory(
                new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Open").setURL("https://dweeb.faizo.net"),
            ),
    )
    .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder()
                .setURL("https://dweeb.faizo.net/media/defaults/dweeb-showcase-gallery-1.jpg")
                .setDescription("Media galleries hold up to 10 images or clips"),
            new MediaGalleryItemBuilder()
                .setURL("https://dweeb.faizo.net/media/defaults/dweeb-showcase-gallery-2.jpg")
                .setDescription("Give every item its own description…"),
            new MediaGalleryItemBuilder()
                .setURL("https://dweeb.faizo.net/media/defaults/dweeb-showcase-gallery-3.jpg")
                .setDescription("…or mark any one of them as a spoiler"),
        ),
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large))
    .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            [
                "**Every text block speaks full Discord markdown.**",
                "Blend **bold**, *italic*, __underline__, ~~strikethrough~~, `inline code`, and ||spoilers|| — each renders exactly as Discord shows it. Drop in [masked links](https://dweeb.faizo.net), lists, and quotes wherever you need them:",
                "> Good messages look effortless. DWEEB just makes effortless easy.",
            ].join("\n"),
        ),
        new TextDisplayBuilder().setContent(
            "**There's even more in the box** — dropdown menus, clickable (non-link) buttons, and file uploads are all one tap away in the **Add component** menu.",
        ),
    )
    .addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("📖 Read the docs")
                .setURL("https://discord.com/developers/docs/components/reference"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("💬 Join the Discord")
                .setURL("https://discord.gg/2wB7rHRDg2"),
        ),
    );

const text = new TextDisplayBuilder().setContent(
    [
        "-# 💡 **Posts through any webhook:** text, layout, media, and link buttons. Interactive pieces — clickable buttons and select menus — need a **bot or app** to own the webhook; a plain user webhook will reject them.",
        "-# Reopen this tour any time from the **Message directory**, or choose **Clear current message** under More to start fresh.",
    ].join("\n"),
);
