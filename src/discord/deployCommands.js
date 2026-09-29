require("dotenv").config();

const { SlashCommandBuilder, REST, Routes } = require("discord.js");

const commands = [
    new SlashCommandBuilder().setName("ping").setDescription("Check bot latency."),

    new SlashCommandBuilder()
        .setName("status")
        .setDescription("Get the status of a Minecraft server.")
        .addStringOption(option =>
            option
                .setName("edition")
                .setDescription("Minecraft Edition")
                .setRequired(true)
                .addChoices({ name: "Java", value: "java" }, { name: "Bedrock", value: "bedrock" }),
        )
        .addStringOption(option =>
            option.setName("host").setDescription("Minecraft Server Adress / IP").setRequired(true),
        )
        .addIntegerOption(option => option.setName("port").setDescription("Minecraft server port").setRequired(false)),

    new SlashCommandBuilder()
        .setName("player-status")
        .setDescription("Get info of a Minecraft Player")
        .addStringOption(option =>
            option.setName("identifier").setDescription("The player's UUID / Username").setRequired(true),
        ),
    new SlashCommandBuilder().setName("help").setDescription("See all commands supported by Craftie"),
].map(command => command.toJSON());
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

async function deployCommands() {
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands });

    console.log("Registered discord commands");
}

deployCommands();
