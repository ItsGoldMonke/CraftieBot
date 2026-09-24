const { Client, GatewayIntentBits, Events, MessageFlags } = require("discord.js");
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

            // respond to Discord
            await interaction.reply({
                components: [
                    {
                        type: 17,
                        accent_color: 5793266,
                        components: [
                            {
                                type: 10,
                                content:
                                    "# 🧩 The Components V2 starter kit\nA hands-on tour of every block DWEEB gives you — and it's all live. **Click any component in the editor to edit it**, watch the preview update instantly, then hit **Send** or **Share** when it looks right.",
                            },
                            {
                                type: 14,
                                divider: true,
                                spacing: 2,
                            },
                            {
                                type: 9,
                                components: [
                                    {
                                        type: 10,
                                        content:
                                            "**Sections** set a short stack of text beside a single accessory. Pair one with a **thumbnail** — like this — for profile cards, product shots, and tidy call-outs.",
                                    },
                                ],
                                accessory: {
                                    type: 11,
                                    media: {
                                        url: "https://dweeb.faizo.net/media/defaults/dweeb-default-thumbnail.jpg",
                                    },
                                    description: "Thumbnail accessory",
                                },
                            },
                            {
                                type: 9,
                                components: [
                                    {
                                        type: 10,
                                        content:
                                            "Give a section a **button** instead and the same layout becomes an action card: a headline, a line of detail, and one tappable action docked on the right.",
                                    },
                                ],
                                accessory: {
                                    type: 2,
                                    style: 5,
                                    label: "Open",
                                    url: "https://dweeb.faizo.net",
                                },
                            },
                            {
                                type: 12,
                                items: [
                                    {
                                        media: {
                                            url: "https://dweeb.faizo.net/media/defaults/dweeb-showcase-gallery-1.jpg",
                                        },
                                        description: "Media galleries hold up to 10 images or clips",
                                    },
                                    {
                                        media: {
                                            url: "https://dweeb.faizo.net/media/defaults/dweeb-showcase-gallery-2.jpg",
                                        },
                                        description: "Give every item its own description…",
                                    },
                                    {
                                        media: {
                                            url: "https://dweeb.faizo.net/media/defaults/dweeb-showcase-gallery-3.jpg",
                                        },
                                        description: "…or mark any one of them as a spoiler",
                                    },
                                ],
                            },
                            {
                                type: 14,
                                divider: true,
                                spacing: 2,
                            },
                            {
                                type: 10,
                                content:
                                    "**Every text block speaks full Discord markdown.**\nBlend **bold**, *italic*, __underline__, ~~strikethrough~~, `inline code`, and ||spoilers|| — each renders exactly as Discord shows it. Drop in [masked links](https://dweeb.faizo.net), lists, and quotes wherever you need them:\n> Good messages look effortless. DWEEB just makes effortless easy.",
                            },
                            {
                                type: 10,
                                content:
                                    "**There's even more in the box** — dropdown menus, clickable (non-link) buttons, and file uploads are all one tap away in the **Add component** menu.",
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2,
                                        style: 5,
                                        label: "📖 Read the docs",
                                        url: "https://discord.com/developers/docs/components/reference",
                                    },
                                    {
                                        type: 2,
                                        style: 5,
                                        label: "💬 Join the Discord",
                                        url: "https://discord.gg/2wB7rHRDg2",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: 10,
                        content:
                            "-# 💡 **Posts through any webhook:** text, layout, media, and link buttons. Interactive pieces — clickable buttons and select menus — need a **bot or app** to own the webhook; a plain user webhook will reject them.\n-# Reopen this tour any time from the **Message directory**, or choose **Clear current message** under More to start fresh.",
                    },
                ],
                flags: 32768,
            });
        }
    });

    client.login(token);
}

module.exports = {
    startDiscordBot,
};
