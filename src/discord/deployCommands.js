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
        .addIntegerOption(option => option.setName("port").setDescription("Minecraft server point").setRequired(false)),
].map(command => command.toJSON());
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

async function deployCommands() {
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands });

    console.log("Registered discord commands");
}

deployCommands();
